from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.deps import CurrentUser, require_roles
from app.supabase_client import get_service_client

router = APIRouter(prefix="/holidays", tags=["holidays"])


class HolidayCreate(BaseModel):
    date: date
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)


class HolidayOut(BaseModel):
    id: str
    gym_id: str
    date: date
    title: str
    description: str | None = None
    created_at: str


@router.get("", response_model=list[HolidayOut])
def list_holidays(
    user: CurrentUser = Depends(require_roles("admin", "member")),
    year: int | None = Query(default=None, ge=2020, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
):
    if not user.gym_id:
        raise HTTPException(400, "No gym attached")
    sb = get_service_client()
    q = sb.table("gym_holidays").select("*").eq("gym_id", user.gym_id).order("date", desc=False)
    if year:
        start = f"{year}-01-01"
        end = f"{year + 1}-01-01"
        if month:
            next_month_year = year + (1 if month == 12 else 0)
            next_month = 1 if month == 12 else month + 1
            start = f"{year}-{month:02d}-01"
            end = f"{next_month_year}-{next_month:02d}-01"
        q = q.gte("date", start).lt("date", end)
    return q.execute().data or []


@router.post("", response_model=HolidayOut, status_code=201)
def create_holiday(payload: HolidayCreate, user: CurrentUser = Depends(require_roles("admin"))):
    if not user.gym_id:
        raise HTTPException(400, "No gym attached to your account")
    sb = get_service_client()
    row = {
        "gym_id": user.gym_id,
        "date": payload.date.isoformat(),
        "title": payload.title,
        "description": payload.description,
        "created_by": user.id,
    }
    try:
        res = sb.table("gym_holidays").insert(row).execute()
    except Exception as exc:
        msg = str(exc).lower()
        if "duplicate" in msg or "unique" in msg:
            raise HTTPException(409, "A holiday already exists for that date")
        raise HTTPException(400, f"Could not create: {exc}")
    if not res.data:
        raise HTTPException(500, "Insert returned no row")
    return res.data[0]


@router.delete("/{holiday_id}", status_code=204)
def delete_holiday(holiday_id: str, user: CurrentUser = Depends(require_roles("admin"))):
    sb = get_service_client()
    existing = sb.table("gym_holidays").select("gym_id").eq("id", holiday_id).limit(1).execute()
    row = existing.data[0] if existing.data else None
    if not row:
        raise HTTPException(404, "Holiday not found")
    if row["gym_id"] != user.gym_id:
        raise HTTPException(403, "Cross-tenant access denied")
    sb.table("gym_holidays").delete().eq("id", holiday_id).execute()
    return None
