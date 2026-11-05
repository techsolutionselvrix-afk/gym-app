from datetime import date, datetime
from typing import Literal, Optional
from app.schemas.common import ORMBase, Timestamps

MembershipStatus = Literal["active", "expired", "paused", "cancelled"]


class MembershipCreate(ORMBase):
    plan_id: str  # gym_id and member_id are inferred server-side


class MembershipOut(ORMBase, Timestamps):
    id: str
    member_id: str
    plan_id: str
    gym_id: str
    start_date: date
    end_date: date
    status: MembershipStatus


class MembershipWithContext(MembershipOut):
    plan_name: Optional[str] = None
    plan_price_cents: Optional[int] = None
    plan_currency: Optional[str] = None
    member_name: Optional[str] = None
    member_email: Optional[str] = None
