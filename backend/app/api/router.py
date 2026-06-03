from fastapi import APIRouter

from app.api.v1 import bookings, booking_files, checklist, expenses, itinerary, notes, photos, places, trips

router = APIRouter(prefix="/api/v1")
router.include_router(trips.router)
router.include_router(itinerary.router)
router.include_router(expenses.router)
router.include_router(bookings.router)
router.include_router(places.router)
router.include_router(checklist.router)
router.include_router(notes.router)
router.include_router(photos.router)
router.include_router(booking_files.router)
