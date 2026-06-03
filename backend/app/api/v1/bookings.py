import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingOut, BookingUpdate

router = APIRouter(prefix="/trips/{trip_id}/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingOut])
def list_bookings(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.trip_id == trip_id).order_by(Booking.check_in.asc().nulls_last()).all()


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(trip_id: uuid.UUID, body: BookingCreate, db: Session = Depends(get_db)):
    booking = Booking(**body.model_dump(), trip_id=trip_id)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(trip_id: uuid.UUID, booking_id: uuid.UUID, body: BookingUpdate, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.trip_id == trip_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(trip_id: uuid.UUID, booking_id: uuid.UUID, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.trip_id == trip_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    db.delete(booking)
    db.commit()
