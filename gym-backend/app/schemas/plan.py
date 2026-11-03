from typing import Optional
from pydantic import Field
from app.schemas.common import ORMBase, Timestamps


class PlanCreate(ORMBase):
    gym_id: str
    name: str = Field(min_length=2, max_length=80)
    price_cents: int = Field(ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    duration_days: int = Field(ge=1, le=3650)
    features: Optional[dict] = None
    active: bool = True


class PlanUpdate(ORMBase):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    price_cents: Optional[int] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    duration_days: Optional[int] = Field(default=None, ge=1, le=3650)
    features: Optional[dict] = None
    active: Optional[bool] = None


class PlanOut(ORMBase, Timestamps):
    id: str
    gym_id: str
    name: str
    price_cents: int
    currency: str
    duration_days: int
    features: Optional[dict] = None
    active: bool
