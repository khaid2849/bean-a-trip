import uuid
from datetime import datetime

from pydantic import BaseModel


class ChecklistItemCreate(BaseModel):
    title: str
    category: str = "Other"
    is_checked: bool = False


class ChecklistItemUpdate(BaseModel):
    title: str | None = None
    category: str | None = None
    is_checked: bool | None = None
    order_index: int | None = None


class ChecklistItemOut(BaseModel):
    id: uuid.UUID
    trip_id: uuid.UUID
    title: str
    is_checked: bool
    category: str
    order_index: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ReorderRequest(BaseModel):
    item_ids: list[uuid.UUID]
