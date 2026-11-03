from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, get_current_user, require_roles, require_same_gym
from app.schemas.attendance import AttendanceOut, CheckinRequest, CheckoutRequest
from app.supabase_client import get_service_client

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/check-in", response_model=AttendanceOut, status_code=201)
def check_in(payload: CheckinRequest, user: CurrentUser = Depends(get_current_user)):
    """
    A member checks themselves in (QR scan). An admin can also check a member in
    manually. Super admin isn't typically on the floor; blocked here to keep audit clean.
    """
    sb = get_service_client()
    require_same_gym(user, payload.gym_id)

    if payload.member_id and payload.member_id != user.id:
        if user.role not in ("admin",):
            raise HTTPException(403, "Only admins can check in another member")
        target = sb.table("profiles").select("gym_id").eq("id", payload.member_id).single().execute().data
        if not target or target["gym_id"] != payload.gym_id:
            raise HTTPException(404, "Member not in this gym")

    member_id = payload.member_id or user.id

    # Prevent double check-ins: if an open attendance exists in last 12h, reuse it.
    open_row = (
        sb.table("attendance")
        .select("id, checked_in_at, checked_out_at")
        .eq("member_id", member_id)
        .eq("gym_id", payload.gym_id)
        .is_("checked_out_at", "null")
        .order("checked_in_at", desc=True)
        .limit(1)
        .execute()
        .data
    )
    if open_row:
        return sb.table("attendance").select("*").eq("id", open_row[0]["id"]).single().execute().data

    row = {
        "member_id": member_id,
        "gym_id": payload.gym_id,
        "checked_in_at": datetime.now(timezone.utc).isoformat(),
        "method": payload.method,
    }
    res = sb.table("attendance").insert(row).execute()
    return res.data[0]


@router.post("/check-out", response_model=AttendanceOut)
def check_out(payload: CheckoutRequest, user: CurrentUser = Depends(get_current_user)):
    sb = get_service_client()
    row = sb.table("attendance").select("*").eq("id", payload.attendance_id).single().execute().data
    if not row:
        raise HTTPException(404, "Attendance not found")
    if row["member_id"] != user.id and user.role not in ("admin", "super_admin"):
        raise HTTPException(403, "Cannot check out another member")
    require_same_gym(user, row["gym_id"])
    if row["checked_out_at"]:
        return row  # idempotent
    res = (
        sb.table("attendance")
        .update({"checked_out_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", payload.attendance_id)
        .execute()
    )
    return res.data[0]


@router.get("/me", response_model=list[AttendanceOut])
def my_attendance(
    user: CurrentUser = Depends(get_current_user),
    limit: int = Query(30, ge=1, le=200),
):
    sb = get_service_client()
    rows = (
        sb.table("attendance")
        .select("*")
        .eq("member_id", user.id)
        .order("checked_in_at", desc=True)
        .limit(limit)
        .execute()
        .data
    )
    return rows or []
