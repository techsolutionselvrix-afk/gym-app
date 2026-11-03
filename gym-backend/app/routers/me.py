from fastapi import APIRouter, Depends, HTTPException

from app.deps import CurrentUser, get_current_user
from app.schemas.user import ProfileOut, ProfileUpdate
from app.supabase_client import get_service_client

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=ProfileOut)
def read_me(user: CurrentUser = Depends(get_current_user)):
    sb = get_service_client()
    row = (
        sb.table("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .execute()
        .data
    )
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return row


@router.patch("", response_model=ProfileOut)
def update_me(payload: ProfileUpdate, user: CurrentUser = Depends(get_current_user)):
    sb = get_service_client()
    patch = payload.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    # Role and gym_id are intentionally not updatable here.
    res = (
        sb.table("profiles")
        .update(patch)
        .eq("id", user.id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return res.data[0]
