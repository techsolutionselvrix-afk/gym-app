from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, require_roles, require_same_gym
from app.schemas.gym import GymCreate, GymOut, GymUpdate
from app.supabase_client import get_service_client

router = APIRouter(prefix="/gyms", tags=["gyms"])


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
