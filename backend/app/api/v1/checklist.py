import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.checklist import ChecklistItem
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemOut, ChecklistItemUpdate, ReorderRequest

router = APIRouter(prefix="/trips/{trip_id}/checklist", tags=["checklist"])


@router.get("", response_model=list[ChecklistItemOut])
def list_items(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(ChecklistItem).filter(ChecklistItem.trip_id == trip_id).order_by(ChecklistItem.category, ChecklistItem.order_index).all()


@router.post("", response_model=ChecklistItemOut, status_code=status.HTTP_201_CREATED)
def create_item(trip_id: uuid.UUID, body: ChecklistItemCreate, db: Session = Depends(get_db)):
    count = db.query(ChecklistItem).filter(ChecklistItem.trip_id == trip_id, ChecklistItem.category == body.category).count()
    item = ChecklistItem(**body.model_dump(), trip_id=trip_id, order_index=count)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ChecklistItemOut)
def update_item(trip_id: uuid.UUID, item_id: uuid.UUID, body: ChecklistItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id, ChecklistItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(trip_id: uuid.UUID, item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id, ChecklistItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()


@router.patch("/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_items(trip_id: uuid.UUID, body: ReorderRequest, db: Session = Depends(get_db)):
    for index, item_id in enumerate(body.item_ids):
        db.query(ChecklistItem).filter(ChecklistItem.id == item_id, ChecklistItem.trip_id == trip_id).update({"order_index": index})
    db.commit()
