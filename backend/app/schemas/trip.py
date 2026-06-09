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
    currency: str = "VND"
    lat: float | None = None
    lng: float | None = None


class TripUpdate(BaseModel):
    name: str | None = None
    destination: str | None = None
    cover_color: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: TripStatus | None = None
    notes: str | None = None
    is_favorite: bool | None = None
    currency: str | None = None
    lat: float | None = None
    lng: float | None = None


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
    is_favorite: bool
    currency: str
    lat: float | None = None
    lng: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
