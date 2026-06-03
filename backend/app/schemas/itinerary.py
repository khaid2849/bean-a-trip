import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.itinerary import ActivityStatus


class ActivityCreate(BaseModel):
    title: str
    types: list[str] = ["activity"]
    start_time: str | None = None
    end_time: str | None = None
    map_link: str | None = None
    notes: str | None = None
    status: ActivityStatus = ActivityStatus.planned


class ActivityUpdate(BaseModel):
    title: str | None = None
    types: list[str] | None = None
    start_time: str | None = None
    end_time: str | None = None
    map_link: str | None = None
    notes: str | None = None
    order_index: int | None = None
    status: ActivityStatus | None = None


class ActivityOut(BaseModel):
    id: uuid.UUID
    day_id: uuid.UUID
    trip_id: uuid.UUID
    title: str
    types: list[str]
    start_time: str | None
    end_time: str | None
    map_link: str | None
    notes: str | None
    order_index: int
    status: ActivityStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DayCreate(BaseModel):
    date: str


class DayUpdate(BaseModel):
    date: str


class DayOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    date: str
    day_number: int
    activities: list[ActivityOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ReorderRequest(BaseModel):
    item_ids: list[uuid.UUID]
