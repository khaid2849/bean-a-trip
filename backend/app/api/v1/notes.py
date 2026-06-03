import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteOut, NoteUpdate

router = APIRouter(prefix="/trips/{trip_id}/notes", tags=["notes"])


@router.get("", response_model=list[NoteOut])
def list_notes(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Note).filter(Note.trip_id == trip_id).order_by(Note.updated_at.desc()).all()


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(trip_id: uuid.UUID, body: NoteCreate, db: Session = Depends(get_db)):
    note = Note(**body.model_dump(), trip_id=trip_id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(trip_id: uuid.UUID, note_id: uuid.UUID, body: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.trip_id == trip_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(trip_id: uuid.UUID, note_id: uuid.UUID, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id, Note.trip_id == trip_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    db.delete(note)
    db.commit()
