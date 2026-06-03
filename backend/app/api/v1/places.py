import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.place import Place
from app.schemas.place import PlaceCreate, PlaceOut, PlaceUpdate

router = APIRouter(prefix="/trips/{trip_id}/places", tags=["places"])


@router.get("", response_model=list[PlaceOut])
def list_places(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Place).filter(Place.trip_id == trip_id).order_by(Place.created_at.asc()).all()


@router.post("", response_model=PlaceOut, status_code=status.HTTP_201_CREATED)
def create_place(trip_id: uuid.UUID, body: PlaceCreate, db: Session = Depends(get_db)):
    place = Place(**body.model_dump(), trip_id=trip_id)
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.put("/{place_id}", response_model=PlaceOut)
def update_place(trip_id: uuid.UUID, place_id: uuid.UUID, body: PlaceUpdate, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id, Place.trip_id == trip_id).first()
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(place, field, value)
    db.commit()
    db.refresh(place)
    return place


@router.patch("/{place_id}/visited", response_model=PlaceOut)
def toggle_visited(trip_id: uuid.UUID, place_id: uuid.UUID, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id, Place.trip_id == trip_id).first()
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    place.visited = not place.visited
    db.commit()
    db.refresh(place)
    return place


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place(trip_id: uuid.UUID, place_id: uuid.UUID, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id, Place.trip_id == trip_id).first()
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    db.delete(place)
    db.commit()
