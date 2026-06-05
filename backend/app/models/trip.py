import uuid
from enum import Enum as PyEnum

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripStatus(str, PyEnum):
    planning = "planning"
    active = "active"
    completed = "completed"


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str] = mapped_column(String, nullable=False)
    cover_color: Mapped[str] = mapped_column(String, nullable=False, default="#0ea5e9")
    start_date: Mapped[str] = mapped_column(String, nullable=False)
    end_date: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[TripStatus] = mapped_column(
        SAEnum(TripStatus, name="tripstatus"), nullable=False, default=TripStatus.planning
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_photo_key: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
