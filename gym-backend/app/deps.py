from typing import Iterable
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

from app.security import decode_supabase_jwt
from app.supabase_client import get_service_client


class CurrentUser(BaseModel):
    id: str
    email: str | None = None
    role: str                  # member | admin | super_admin
    gym_id: str | None = None  # null for super_admin
    access_token: str


def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return authorization.split(" ", 1)[1].strip()


def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    """
    Trust-but-verify:
      1. Validate Supabase JWT signature + expiry.
      2. Load the user's profile row (role, gym_id) from DB.
         Role is read from DB, not the JWT, so revoked/changed roles take effect immediately.
    """
    token = _bearer(authorization)
    claims = decode_supabase_jwt(token)
    user_id = claims["sub"]

    sb = get_service_client()
    res = (
        sb.table("profiles")
        .select("id, role, gym_id, email")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No profile for user")

    row = res.data
    return CurrentUser(
        id=row["id"],
        email=row.get("email") or claims.get("email"),
        role=row["role"],
        gym_id=row.get("gym_id"),
        access_token=token,
    )


def require_roles(*roles: str):
    allowed = set(roles)

    def _dep(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {sorted(allowed)}",
            )
        return user

    return _dep


def require_same_gym(user: CurrentUser, gym_id: str) -> None:
    """Enforce gym-scoping at the API layer; RLS also enforces at the DB layer."""
    if user.role == "super_admin":
        return
    if user.gym_id != gym_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant access denied")
