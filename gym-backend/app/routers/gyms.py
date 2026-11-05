from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.deps import CurrentUser, require_roles, require_same_gym
from app.schemas.gym import GymCreate, GymOut, GymUpdate
from app.supabase_client import get_service_client

router = APIRouter(prefix="/gyms", tags=["gyms"])


# App-subscription plans for gym owners (the SaaS subscription for GymSync itself,
# NOT the gym-member-subscribes-to-gym flow in /memberships).
APP_SUBSCRIPTION_PLANS = [
    {"id": "monthly", "name": "Monthly",   "days": 30,  "price_inr": 499},
    {"id": "quarterly", "name": "Quarterly", "days": 90,  "price_inr": 1299},
    {"id": "yearly", "name": "Yearly",    "days": 365, "price_inr": 4499},
]


class SubscriptionOut(BaseModel):
    gym_id: str
    ends_at: datetime | None
    days_remaining: int
    is_active: bool
    plans: list[dict] = Field(default_factory=lambda: APP_SUBSCRIPTION_PLANS)


class RenewPayload(BaseModel):
    plan_id: str


def _days_left(ends_at: datetime | None) -> int:
    if not ends_at:
        return 0
    delta = ends_at - datetime.now(timezone.utc)
    return max(0, int(delta.total_seconds() // 86400))


@router.get("/me/subscription", response_model=SubscriptionOut)
def get_my_gym_subscription(user: CurrentUser = Depends(require_roles("admin"))):
    if not user.gym_id:
        raise HTTPException(400, "Your account has no gym attached")
    sb = get_service_client()
    res = sb.table("gyms").select("id, subscription_ends_at").eq("id", user.gym_id).limit(1).execute()
    row = res.data[0] if res.data else None
    if not row:
        raise HTTPException(404, "Gym not found")
    ends_at_raw = row.get("subscription_ends_at")
    ends_at = None
    if ends_at_raw:
        ends_at = datetime.fromisoformat(str(ends_at_raw).replace("Z", "+00:00"))
    days = _days_left(ends_at)
    return SubscriptionOut(
        gym_id=row["id"],
        ends_at=ends_at,
        days_remaining=days,
        is_active=days > 0,
    )


@router.post("/me/subscription/renew", response_model=SubscriptionOut)
def renew_my_gym_subscription(
    payload: RenewPayload,
    user: CurrentUser = Depends(require_roles("admin")),
):
    plan = next((p for p in APP_SUBSCRIPTION_PLANS if p["id"] == payload.plan_id), None)
    if not plan:
        raise HTTPException(400, "Unknown plan")
    if not user.gym_id:
        raise HTTPException(400, "Your account has no gym attached")
    sb = get_service_client()
    res = sb.table("gyms").select("id, subscription_ends_at").eq("id", user.gym_id).limit(1).execute()
    row = res.data[0] if res.data else None
    if not row:
        raise HTTPException(404, "Gym not found")

    now = datetime.now(timezone.utc)
    current_end = None
    if row.get("subscription_ends_at"):
        current_end = datetime.fromisoformat(str(row["subscription_ends_at"]).replace("Z", "+00:00"))
    # Stack renewal on top of unused time (same policy as member renewal).
    base = current_end if current_end and current_end > now else now
    new_end = base + timedelta(days=int(plan["days"]))

    upd = sb.table("gyms").update({"subscription_ends_at": new_end.isoformat()}).eq("id", user.gym_id).execute()
    if not upd.data:
        raise HTTPException(500, "Could not update subscription")
    return SubscriptionOut(
        gym_id=user.gym_id,
        ends_at=new_end,
        days_remaining=_days_left(new_end),
        is_active=True,
    )


@router.get("", response_model=list[GymOut])
def list_gyms(
    user: CurrentUser = Depends(require_roles("admin", "super_admin")),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    sb = get_service_client()
    q = sb.table("gyms").select("*").order("created_at", desc=True).range(offset, offset + limit - 1)
    if user.role == "admin":
        q = q.eq("id", user.gym_id)
    return q.execute().data or []


@router.post("", response_model=GymOut, status_code=201)
def create_gym(payload: GymCreate, user: CurrentUser = Depends(require_roles("super_admin"))):
    sb = get_service_client()
    row = payload.model_dump(exclude_none=True)
    row["status"] = "trial"
    res = sb.table("gyms").insert(row).execute()
    return res.data[0]


@router.get("/{gym_id}", response_model=GymOut)
def get_gym(gym_id: str, user: CurrentUser = Depends(require_roles("admin", "super_admin", "member"))):
    require_same_gym(user, gym_id)
    sb = get_service_client()
    data = sb.table("gyms").select("*").eq("id", gym_id).single().execute().data
    if not data:
        raise HTTPException(404, "Gym not found")
    return data


@router.patch("/{gym_id}", response_model=GymOut)
def update_gym(
    gym_id: str,
    payload: GymUpdate,
    user: CurrentUser = Depends(require_roles("admin", "super_admin")),
):
    require_same_gym(user, gym_id)
    patch = payload.model_dump(exclude_none=True)
    # Admin can't change status; only super_admin can suspend/activate.
    if user.role != "super_admin":
        patch.pop("status", None)
    if not patch:
        raise HTTPException(400, "Nothing to update")
    sb = get_service_client()
    res = sb.table("gyms").update(patch).eq("id", gym_id).execute()
    if not res.data:
        raise HTTPException(404, "Gym not found")
    return res.data[0]
