import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.booking import BookingStatus, BookingType


class BookingCreate(BaseModel):
    type: BookingType
    title: str
    confirmation_number: str | None = None
    provider: str | None = None
    check_in: str | None = None
    check_out: str | None = None
    amount: float | None = None
    notes: str | None = None
    status: BookingStatus = BookingStatus.confirmed


class BookingUpdate(BaseModel):
    type: BookingType | None = None
    title: str | None = None
    confirmation_number: str | None = None
    provider: str | None = None
    check_in: str | None = None
    check_out: str | None = None
    amount: float | None = None
    notes: str | None = None
    status: BookingStatus | None = None


class BookingOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    type: BookingType
    title: str
    confirmation_number: str | None
    provider: str | None
    check_in: str | None
    check_out: str | None
    amount: float | None
    notes: str | None
    status: BookingStatus
    created_at: datetime

    model_config = {"from_attributes": True}
