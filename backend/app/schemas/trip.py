import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.trip import TripStatus


class TripCreate(BaseModel):
    name: str
    destination: str
    cover_color: str = "#0ea5e9"
    start_date: str
    end_date: str
    status: TripStatus = TripStatus.planning
    notes: str | None = None


class TripUpdate(BaseModel):
    name: str | None = None
    destination: str | None = None
    cover_color: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: TripStatus | None = None
    notes: str | None = None


class TripOut(BaseModel):
    id: uuid.UUID
    name: str
    destination: str
    cover_color: str
    cover_photo_url: str | None = None
    start_date: str
    end_date: str
    status: TripStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
