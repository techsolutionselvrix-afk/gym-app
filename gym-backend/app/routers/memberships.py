from datetime import date, timedelta
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, get_current_user, require_roles
from app.schemas.membership import MembershipCreate, MembershipOut
from app.supabase_client import get_service_client

router = APIRouter(prefix="/memberships", tags=["memberships"])


def _enrich(sb, rows: list[dict]) -> list[dict]:
    """Attach plan + member display info in a single pass."""
    if not rows:
        return []
    plan_ids = list({r["plan_id"] for r in rows if r.get("plan_id")})
    member_ids = list({r["member_id"] for r in rows if r.get("member_id")})

    plans = (
        sb.table("plans").select("id, name, price_cents, currency").in_("id", plan_ids).execute().data
        if plan_ids else []
    )
    members = (
        sb.table("profiles").select("id, full_name, email").in_("id", member_ids).execute().data
        if member_ids else []
    )
    plan_by_id = {p["id"]: p for p in plans}
    member_by_id = {m["id"]: m for m in members}

    out = []
    for r in rows:
        p = plan_by_id.get(r["plan_id"], {})
        m = member_by_id.get(r["member_id"], {})
        out.append({
            **r,
            "plan_name": p.get("name"),
            "plan_price_cents": p.get("price_cents"),
            "plan_currency": p.get("currency"),
            "member_name": m.get("full_name"),
            "member_email": m.get("email"),
        })
    return out


@router.get("/me")
def my_memberships(
    user: CurrentUser = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
):
    """Member's own memberships, newest first."""
    sb = get_service_client()
    rows = (
        sb.table("memberships")
        .select("*")
        .eq("member_id", user.id)
        .order("start_date", desc=True)
        .limit(limit)
        .execute()
        .data
        or []
    )
    return _enrich(sb, rows)


@router.post("", response_model=MembershipOut, status_code=201)
def subscribe(payload: MembershipCreate, user: CurrentUser = Depends(get_current_user)):
    """
    Member subscribes to (or renews) a plan.
    - Plan must exist and be active.
    - Member must share a gym with the plan (or be admin/super_admin).
    - Start date: today (or existing end_date if a currently active membership exists → renewal).
    - End date: start + plan.duration_days.
    - Older active memberships for the same member in the same gym are marked 'expired'.
    """
    sb = get_service_client()

    plan = (
        sb.table("plans")
        .select("id, gym_id, duration_days, active")
        .eq("id", payload.plan_id)
        .maybe_single()
        .execute()
        .data
    )
    if not plan:
        raise HTTPException(404, "Plan not found")
    if not plan["active"]:
        raise HTTPException(400, "Plan is not active")

    gym_id = plan["gym_id"]
    # Members can only subscribe within their own gym. Admins can subscribe members in their gym.
    if user.role == "member":
        if user.gym_id and user.gym_id != gym_id:
            raise HTTPException(403, "This plan belongs to a different gym")
        # If member has no gym yet, attach them to this one on first subscription.
        if not user.gym_id:
            sb.table("profiles").update({"gym_id": gym_id}).eq("id", user.id).execute()

    # Determine start date: if an active membership exists, start where it ends.
    today = date.today()
    existing = (
        sb.table("memberships")
        .select("id, end_date, status")
        .eq("member_id", user.id)
        .eq("gym_id", gym_id)
        .eq("status", "active")
        .order("end_date", desc=True)
        .limit(1)
        .execute()
        .data
    )
    start = today
    if existing:
        ex = existing[0]
        try:
            ex_end = date.fromisoformat(ex["end_date"])
        except Exception:
            ex_end = today
        if ex_end > today:
            start = ex_end  # stack the renewal after current expiry
        # Mark the previous one expired so there's exactly one active row at a time.
        sb.table("memberships").update({"status": "expired"}).eq("id", ex["id"]).execute()

    end = start + timedelta(days=int(plan["duration_days"]))

    row = {
        "member_id": user.id,
        "plan_id": plan["id"],
        "gym_id": gym_id,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "status": "active",
    }
    res = sb.table("memberships").insert(row).execute()
    return res.data[0]


@router.get("")
def list_memberships(
    user: CurrentUser = Depends(require_roles("admin", "super_admin")),
    status: Literal["active", "expired", "paused", "cancelled", "all"] = "active",
    limit: int = Query(100, ge=1, le=500),
):
    """Admin: memberships in own gym. Super admin: all gyms."""
    sb = get_service_client()
    q = (
        sb.table("memberships")
        .select("*")
        .order("start_date", desc=True)
        .limit(limit)
    )
    if user.role == "admin":
        if not user.gym_id:
            raise HTTPException(400, "Admin has no gym attached")
        q = q.eq("gym_id", user.gym_id)
    if status != "all":
        q = q.eq("status", status)
    rows = q.execute().data or []
    return _enrich(sb, rows)
