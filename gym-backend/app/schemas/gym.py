from typing import Literal, Optional
from pydantic import EmailStr, Field
from app.schemas.common import ORMBase, Timestamps

GymStatus = Literal["active", "suspended", "trial"]


class GymCreate(ORMBase):
    name: str = Field(min_length=2, max_length=120)
    address: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None


class GymUpdate(ORMBase):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    address: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None
    status: Optional[GymStatus] = None


class GymOut(ORMBase, Timestamps):
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    status: GymStatus
