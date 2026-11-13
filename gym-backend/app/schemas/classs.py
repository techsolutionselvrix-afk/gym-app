from datetime import datetime
from pydantic import BaseModel, Field


class ClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    start_time: datetime
    end_time: datetime
    capacity: int = Field(default=20, ge=1, le=500)
    trainer_id: str | None = None


class ClassOut(BaseModel):
    id: str
    gym_id: str
    name: str
    start_time: datetime
    end_time: datetime
    capacity: int
    trainer_id: str | None = None
