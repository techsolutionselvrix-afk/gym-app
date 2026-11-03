from datetime import datetime
from typing import Generic, List, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class Paginated(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


class Timestamps(BaseModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None
