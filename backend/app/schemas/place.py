import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.place import PlaceType


class PlaceCreate(BaseModel):
    name: str
    type: PlaceType = PlaceType.attraction
    address: str | None = None
    notes: str | None = None
    rating: int | None = None
    visited: bool = False


class PlaceUpdate(BaseModel):
    name: str | None = None
    type: PlaceType | None = None
    address: str | None = None
    notes: str | None = None
    rating: int | None = None
    visited: bool | None = None


class PlaceOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    name: str
    type: PlaceType
    address: str | None
    notes: str | None
    rating: int | None
    visited: bool
    created_at: datetime

    model_config = {"from_attributes": True}
