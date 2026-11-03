from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, require_roles
from app.schemas.user import ProfileOut
from app.supabase_client import get_service_client

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[ProfileOut])
def list_members(
    user: CurrentUser = Depends(require_roles("admin", "super_admin")),
    gym_id: str | None = Query(default=None),
    search: str | None = Query(default=None, max_length=80),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    sb = get_service_client()
    effective_gym = gym_id or user.gym_id
    if user.role == "admin" and effective_gym != user.gym_id:
        raise HTTPException(403, "Cannot read other gyms")
    if not effective_gym and user.role != "super_admin":
        raise HTTPException(400, "gym_id required")

    q = sb.table("profiles").select("*").eq("role", "member").range(offset, offset + limit - 1)
    if effective_gym:
        q = q.eq("gym_id", effective_gym)
    if search:
        q = q.ilike("full_name", f"%{search}%")
    return q.execute().data or []


@router.get("/{member_id}", response_model=ProfileOut)
def get_member(member_id: str, user: CurrentUser = Depends(require_roles("admin", "super_admin"))):
    sb = get_service_client()
    row = sb.table("profiles").select("*").eq("id", member_id).eq("role", "member").single().execute().data
    if not row:
        raise HTTPException(404, "Member not found")
    if user.role == "admin" and row.get("gym_id") != user.gym_id:
        raise HTTPException(403, "Cross-tenant access denied")
    return row
