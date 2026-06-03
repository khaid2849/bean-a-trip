import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.storage import delete_file, get_presigned_url, upload_file
from app.models.photo import TripPhoto
from app.schemas.photo import PhotoOut

router = APIRouter(prefix="/trips/{trip_id}/photos", tags=["photos"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def _photo_to_out(photo: TripPhoto) -> PhotoOut:
    return PhotoOut(
        id=photo.id,
        trip_id=photo.trip_id,
        file_name=photo.file_name,
        caption=photo.caption,
        url=get_presigned_url(photo.object_key),
        created_at=photo.created_at,
    )


@router.get("", response_model=list[PhotoOut])
def list_photos(trip_id: uuid.UUID, db: Session = Depends(get_db)):
    photos = db.query(TripPhoto).filter(TripPhoto.trip_id == trip_id).order_by(TripPhoto.created_at.desc()).all()
    return [_photo_to_out(p) for p in photos]


@router.post("", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    trip_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, or WebP.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")

    object_key = f"photos/{trip_id}/{uuid.uuid4()}_{file.filename}"
    upload_file(content, object_key, file.content_type or "image/jpeg")

    photo = TripPhoto(trip_id=trip_id, object_key=object_key, file_name=file.filename or "photo")
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return _photo_to_out(photo)


@router.patch("/{photo_id}/caption", response_model=PhotoOut)
def update_caption(trip_id: uuid.UUID, photo_id: uuid.UUID, caption: str, db: Session = Depends(get_db)):
    photo = db.query(TripPhoto).filter(TripPhoto.id == photo_id, TripPhoto.trip_id == trip_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo.caption = caption
    db.commit()
    db.refresh(photo)
    return _photo_to_out(photo)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(trip_id: uuid.UUID, photo_id: uuid.UUID, db: Session = Depends(get_db)):
    photo = db.query(TripPhoto).filter(TripPhoto.id == photo_id, TripPhoto.trip_id == trip_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    delete_file(photo.object_key)
    db.delete(photo)
    db.commit()
