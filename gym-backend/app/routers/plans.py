from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, require_roles, require_same_gym
from app.schemas.plan import PlanCreate, PlanOut, PlanUpdate
from app.supabase_client import get_service_client

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanOut])
def list_plans(
    user: CurrentUser = Depends(require_roles("member", "admin", "super_admin")),
    gym_id: str | None = Query(default=None),
    active_only: bool = Query(default=True),
):
    sb = get_service_client()
    effective_gym = gym_id or user.gym_id
    if user.role != "super_admin" and effective_gym != user.gym_id:
        raise HTTPException(403, "Cross-tenant access denied")
    q = sb.table("plans").select("*")
    if effective_gym:
        q = q.eq("gym_id", effective_gym)
    if active_only:
        q = q.eq("active", True)
    return q.order("price_cents").execute().data or []


@router.post("", response_model=PlanOut, status_code=201)
def create_plan(payload: PlanCreate, user: CurrentUser = Depends(require_roles("admin", "super_admin"))):
    require_same_gym(user, payload.gym_id)
    sb = get_service_client()
    res = sb.table("plans").insert(payload.model_dump(exclude_none=True)).execute()
    return res.data[0]


@router.patch("/{plan_id}", response_model=PlanOut)
def update_plan(
    plan_id: str,
    payload: PlanUpdate,
    user: CurrentUser = Depends(require_roles("admin", "super_admin")),
):
    sb = get_service_client()
    existing = sb.table("plans").select("gym_id").eq("id", plan_id).single().execute().data
    if not existing:
        raise HTTPException(404, "Plan not found")
    require_same_gym(user, existing["gym_id"])
    patch = payload.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(400, "Nothing to update")
    res = sb.table("plans").update(patch).eq("id", plan_id).execute()
    return res.data[0]
