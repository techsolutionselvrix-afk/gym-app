from typing import Literal, Optional
from pydantic import EmailStr, Field
from app.schemas.common import ORMBase, Timestamps

Role = Literal["member", "admin", "super_admin"]
Gender = Literal["male", "female", "other", "prefer_not_to_say"]


class ProfileOut(ORMBase, Timestamps):
    id: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    gender: Optional[Gender] = None
    role: Role
    gym_id: Optional[str] = None


class ProfileUpdate(ORMBase):
    full_name: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=20)
    avatar_url: Optional[str] = None
    gender: Optional[Gender] = None
