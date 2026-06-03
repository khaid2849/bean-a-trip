import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.itinerary import Activity, ActivityStatus, ItineraryDay
from app.schemas.itinerary import ActivityCreate, ActivityOut, ActivityUpdate, DayCreate, DayOut, DayUpdate, ReorderRequest

router = APIRouter(prefix="/trips/{trip_id}/itinerary", tags=["itinerary"])


@router.get("", response_model=list[DayOut])
def get_itinerary(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).order_by(ItineraryDay.day_number).all()


@router.post("/days", response_model=DayOut, status_code=status.HTTP_201_CREATED)
def create_day(trip_id: uuid.UUID, body: DayCreate, db: Session = Depends(get_db)):
    count = db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).count()
    day = ItineraryDay(trip_id=trip_id, date=body.date, day_number=count + 1)
    db.add(day)
    db.commit()
    db.refresh(day)
    return day


@router.patch("/days/{day_id}", response_model=DayOut)
def update_day(trip_id: uuid.UUID, day_id: uuid.UUID, body: DayUpdate, db: Session = Depends(get_db)):
    day = db.query(ItineraryDay).filter(ItineraryDay.id == day_id, ItineraryDay.trip_id == trip_id).first()
    if not day:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
    day.date = body.date
    db.commit()
    db.refresh(day)
    return day


@router.delete("/days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day(trip_id: uuid.UUID, day_id: uuid.UUID, db: Session = Depends(get_db)):
    day = db.query(ItineraryDay).filter(ItineraryDay.id == day_id, ItineraryDay.trip_id == trip_id).first()
    if not day:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
    db.delete(day)
    db.commit()


@router.post("/days/{day_id}/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(trip_id: uuid.UUID, day_id: uuid.UUID, body: ActivityCreate, db: Session = Depends(get_db)):
    count = db.query(Activity).filter(Activity.day_id == day_id).count()
    activity = Activity(**body.model_dump(), day_id=day_id, trip_id=trip_id, order_index=count)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/days/{day_id}/activities/{activity_id}", response_model=ActivityOut)
def update_activity(trip_id: uuid.UUID, day_id: uuid.UUID, activity_id: uuid.UUID, body: ActivityUpdate, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.day_id == day_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/days/{day_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(trip_id: uuid.UUID, day_id: uuid.UUID, activity_id: uuid.UUID, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.day_id == day_id).first()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    db.delete(activity)
    db.commit()


@router.patch("/days/{day_id}/activities/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_activities(trip_id: uuid.UUID, day_id: uuid.UUID, body: ReorderRequest, db: Session = Depends(get_db)):
    for index, activity_id in enumerate(body.item_ids):
        db.query(Activity).filter(Activity.id == activity_id, Activity.day_id == day_id).update({"order_index": index})
    db.commit()
