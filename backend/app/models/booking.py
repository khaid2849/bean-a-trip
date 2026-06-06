import uuid
from enum import Enum as PyEnum

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BookingType(str, PyEnum):
    flight = "flight"
    hotel = "hotel"
    bus = "bus"
    train = "train"
    ferry = "ferry"
    other = "other"


class BookingStatus(str, PyEnum):
    confirmed = "confirmed"
    pending = "pending"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    confirmation_number: Mapped[str | None] = mapped_column(String, nullable=True)
    provider: Mapped[str | None] = mapped_column(String, nullable=True)
    check_in: Mapped[str | None] = mapped_column(String, nullable=True)
    check_out: Mapped[str | None] = mapped_column(String, nullable=True)
    amount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[BookingStatus] = mapped_column(SAEnum(BookingStatus, name="bookingstatus"), nullable=False, default=BookingStatus.confirmed)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
