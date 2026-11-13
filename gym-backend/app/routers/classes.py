from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import CurrentUser, require_roles
from app.schemas.classs import ClassCreate, ClassOut
from app.supabase_client import get_service_client

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("", response_model=list[ClassOut])
def list_classes(
    user: CurrentUser = Depends(require_roles("admin", "super_admin", "member")),
    limit: int = Query(50, ge=1, le=200),
):
    if not user.gym_id and user.role != "super_admin":
        raise HTTPException(400, "No gym attached")
    sb = get_service_client()
    q = sb.table("classes").select("*").order("start_time", desc=True).limit(limit)
    if user.role != "super_admin":
        q = q.eq("gym_id", user.gym_id)
    return q.execute().data or []


@router.post("", response_model=ClassOut, status_code=201)
def create_class(payload: ClassCreate, user: CurrentUser = Depends(require_roles("admin"))):
    if not user.gym_id:
        raise HTTPException(400, "No gym attached to your account")
    if payload.end_time <= payload.start_time:
        raise HTTPException(400, "end_time must be after start_time")
    sb = get_service_client()
    row = {
        "gym_id": user.gym_id,
        "name": payload.name,
        "start_time": payload.start_time.isoformat(),
        "end_time": payload.end_time.isoformat(),
        "capacity": payload.capacity,
        "trainer_id": payload.trainer_id,
    }
    res = sb.table("classes").insert(row).execute()
    if not res.data:
        raise HTTPException(500, "Could not create class")
    return res.data[0]


@router.delete("/{class_id}", status_code=204)
def delete_class(class_id: str, user: CurrentUser = Depends(require_roles("admin"))):
    sb = get_service_client()
    existing = sb.table("classes").select("gym_id").eq("id", class_id).limit(1).execute()
    row = existing.data[0] if existing.data else None
    if not row:
        raise HTTPException(404, "Class not found")
    if row["gym_id"] != user.gym_id:
        raise HTTPException(403, "Cross-tenant access denied")
    sb.table("classes").delete().eq("id", class_id).execute()
    return None
