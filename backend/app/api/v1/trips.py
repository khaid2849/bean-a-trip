import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.storage import delete_file, get_presigned_url, upload_file
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripOut, TripUpdate

router = APIRouter(prefix="/trips", tags=["trips"])


def _enrich(trip: Trip) -> TripOut:
    out = TripOut.model_validate(trip)
    if trip.cover_photo_key:
        try:
            out.cover_photo_url = get_presigned_url(trip.cover_photo_key)
        except Exception:
            out.cover_photo_url = None
    return out


@router.get("", response_model=list[TripOut])
def list_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).order_by(Trip.start_date.asc()).all()
    return [_enrich(t) for t in trips]


@router.post("", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(body: TripCreate, db: Session = Depends(get_db)):
    trip = Trip(**body.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return _enrich(trip)


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return _enrich(trip)


@router.put("/{trip_id}", response_model=TripOut)
def update_trip(trip_id: uuid.UUID, body: TripUpdate, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return _enrich(trip)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    if trip.cover_photo_key:
        try:
            delete_file(trip.cover_photo_key)
        except Exception:
            pass
    db.delete(trip)
    db.commit()


@router.post("/{trip_id}/cover-photo", response_model=TripOut)
async def upload_cover_photo(
    trip_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    if trip.cover_photo_key:
        try:
            delete_file(trip.cover_photo_key)
        except Exception:
            pass

    file_bytes = await file.read()
    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    object_key = f"trips/{trip_id}/cover.{ext}"
    upload_file(file_bytes, object_key, file.content_type or "image/jpeg")

    trip.cover_photo_key = object_key
    db.commit()
    db.refresh(trip)
    return _enrich(trip)


@router.delete("/{trip_id}/cover-photo", response_model=TripOut)
def remove_cover_photo(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    if trip.cover_photo_key:
        try:
            delete_file(trip.cover_photo_key)
        except Exception:
            pass
        trip.cover_photo_key = None
        db.commit()
        db.refresh(trip)

    return _enrich(trip)
