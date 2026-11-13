from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

from app.deps import CurrentUser, require_roles
from app.schemas.user import ProfileOut
from app.supabase_client import get_service_client

router = APIRouter(prefix="/members", tags=["members"])


class MemberCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=1, max_length=120)
    phone: str | None = None


@router.post("", response_model=ProfileOut, status_code=201)
def create_member(payload: MemberCreate, user: CurrentUser = Depends(require_roles("admin"))):
    """Owner creates a member under their own gym.
    Sends Supabase confirmation email; the member must verify before login.
    """
    if not user.gym_id:
        raise HTTPException(400, "Your account is not attached to any gym")

    sb = get_service_client()
    try:
        created = sb.auth.admin.create_user({
            "email": str(payload.email),
            "password": payload.password,
            "email_confirm": False,
            "user_metadata": {
                "full_name": payload.full_name,
                "phone": payload.phone,
                "gym_id": user.gym_id,
                "role": "member",
            },
        })
    except Exception as exc:
        msg = str(exc)
        if "already" in msg.lower() or "registered" in msg.lower():
            raise HTTPException(409, "A user with that email already exists")
        raise HTTPException(400, f"Could not create user: {msg}")

    u = getattr(created, "user", None) or created
    new_id = getattr(u, "id", None) or (u.get("id") if isinstance(u, dict) else None)
    if not new_id:
        raise HTTPException(500, "Auth user created but no id returned")

    profile_row = {
        "id": new_id,
        "email": str(payload.email),
        "full_name": payload.full_name,
        "phone": payload.phone,
        "role": "member",
        "gym_id": user.gym_id,
    }
    # upsert so a trigger-created row doesn't block us.
    sb.table("profiles").upsert(profile_row, on_conflict="id").execute()
    res = sb.table("profiles").select("*").eq("id", new_id).limit(1).execute()
    return (res.data or [profile_row])[0]


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
