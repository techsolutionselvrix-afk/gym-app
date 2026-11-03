from datetime import datetime
from typing import Literal, Optional
from pydantic import Field
from app.schemas.common import ORMBase, Timestamps

CheckinMethod = Literal["qr", "manual", "biometric"]


class CheckinRequest(ORMBase):
    gym_id: str
    member_id: Optional[str] = None  # if admin checks a member in; else current user
    method: CheckinMethod = "qr"


class CheckoutRequest(ORMBase):
    attendance_id: str


class AttendanceOut(ORMBase, Timestamps):
    id: str
    gym_id: str
    member_id: str
    checked_in_at: datetime
    checked_out_at: Optional[datetime] = None
    method: CheckinMethod
