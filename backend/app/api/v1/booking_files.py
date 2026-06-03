import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.storage import delete_file, get_presigned_url, upload_file
from app.models.booking_file import BookingFile
from app.schemas.photo import BookingFileOut

router = APIRouter(prefix="/trips/{trip_id}/bookings/{booking_id}/files", tags=["booking-files"])

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def _file_to_out(f: BookingFile) -> BookingFileOut:
    return BookingFileOut(
        id=f.id,
        booking_id=f.booking_id,
        file_name=f.file_name,
        file_type=f.file_type,
        file_size=f.file_size,
        url=get_presigned_url(f.object_key),
        created_at=f.created_at,
    )


@router.get("", response_model=list[BookingFileOut])
def list_files(trip_id: uuid.UUID, booking_id: uuid.UUID, db: Session = Depends(get_db)):
    files = db.query(BookingFile).filter(BookingFile.booking_id == booking_id).order_by(BookingFile.created_at.asc()).all()
    return [_file_to_out(f) for f in files]


@router.post("", response_model=BookingFileOut, status_code=status.HTTP_201_CREATED)
async def upload_booking_file(
    trip_id: uuid.UUID,
    booking_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")

    object_key = f"bookings/{trip_id}/{booking_id}/{uuid.uuid4()}_{file.filename}"
    upload_file(content, object_key, file.content_type or "application/octet-stream")

    booking_file = BookingFile(
        booking_id=booking_id,
        trip_id=trip_id,
        object_key=object_key,
        file_name=file.filename or "file",
        file_type=file.content_type or "application/octet-stream",
        file_size=len(content),
    )
    db.add(booking_file)
    db.commit()
    db.refresh(booking_file)
    return _file_to_out(booking_file)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking_file(trip_id: uuid.UUID, booking_id: uuid.UUID, file_id: uuid.UUID, db: Session = Depends(get_db)):
    f = db.query(BookingFile).filter(BookingFile.id == file_id, BookingFile.booking_id == booking_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    delete_file(f.object_key)
    db.delete(f)
    db.commit()
