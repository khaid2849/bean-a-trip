# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

BeanATrip is a full-stack travel planning app built for personal use. No authentication — all data is shared. The stack is Next.js 14 (TypeScript, TailwindCSS, shadcn/ui) for the frontend, FastAPI (Python) for the backend, PostgreSQL for the database, and MinIO for file storage.

## Running the Stack

```bash
# Start all services
docker compose up -d

# Stop (keep data)
docker compose down

# Stop (delete all data)
docker compose down -v
```

Services: frontend on :3000, backend API on :8000, MinIO on :9000/:9001 (console), PostgreSQL on :5434.

### Local development (without Docker)

**Backend:**
```bash
cd backend
source .venv/bin/activate   # or create: python3 -m venv .venv && pip install -r requirements.txt
export DATABASE_URL=postgresql://beanatrip_admin:password@localhost:5434/beanatrip
export MINIO_ENDPOINT=localhost:9000
export MINIO_ACCESS_KEY=minioadmin
export MINIO_SECRET_KEY=minioadmin
export MINIO_PUBLIC_URL=http://localhost:9000
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Lint:**
```bash
cd frontend && npm run lint
```

### Database migrations (Alembic)

Run from `backend/` with the venv activated:
```bash
# Apply all pending migrations
DATABASE_URL=postgresql://... alembic upgrade head

# Auto-generate from model changes
DATABASE_URL=postgresql://... alembic revision --autogenerate -m "description"

# Roll back one step
DATABASE_URL=postgresql://... alembic downgrade -1
```

Note: `alembic.ini` has a hardcoded placeholder URL — always override via `DATABASE_URL=...` prefix on the command line.

### Rebuilding Docker services after code changes

```bash
docker compose build backend && docker compose up -d --force-recreate backend
docker compose build frontend && docker compose up -d --force-recreate frontend
```

## Architecture

### Backend (`backend/app/`)

- `main.py` — FastAPI app entry point: CORS middleware, MinIO bucket init on startup, router registration
- `api/router.py` — Aggregates all v1 routers under `/api/v1`
- `api/v1/` — One file per feature: `trips`, `itinerary`, `expenses`, `bookings`, `booking_files`, `places`, `checklist`, `notes`, `photos`
- `models/` — SQLAlchemy ORM models (one per domain entity)
- `schemas/` — Pydantic schemas for request validation and response serialization (one per domain)
- `core/config.py` — Settings loaded via `pydantic-settings` from env vars
- `core/database.py` — SQLAlchemy engine, `SessionLocal`, `Base`, and `get_db()` dependency
- `core/storage.py` — MinIO client (boto3 S3-compatible): upload, presigned URL generation, delete. Presigned URLs rewrite the internal docker hostname to `MINIO_PUBLIC_URL` for browser access.

### Frontend (`frontend/`)

- `app/(app)/` — Next.js App Router. The `(app)` route group wraps all feature pages.
- `app/(app)/trips/[id]/` — Each tab is its own sub-route: `itinerary/`, `expenses/`, `bookings/`, `places/`, `checklist/`, `notes/`, photos (root).
- `hooks/` — TanStack Query hooks per feature (`useTrips`, `useItinerary`, etc.). Each hook file exports `use<Feature>`, `useCreate<Feature>`, `useUpdate<Feature>`, `useDelete<Feature>` mutations that invalidate the relevant query keys on success.
- `types/` — TypeScript interfaces mirroring the backend Pydantic schemas (one file per domain).
- `lib/api.ts` — Axios instance preconfigured with `NEXT_PUBLIC_API_URL + "/api/v1"` as base URL.
- `lib/trip-utils.ts` — Date helpers and color constants for trips.
- `components/` — UI organized by feature (`trips/`, `itinerary/`, `expenses/`, `bookings/`, `places/`, `checklist/`, `notes/`), plus `bento/` (BentoGrid layout), `layout/` (Sidebar, Navbar), and `ui/` (shadcn primitives).

### Key patterns

- All API calls go through `lib/api.ts` (Axios). Components never call `fetch` directly.
- Data fetching and mutations live in `hooks/`. Page components import hooks, not `api`.
- Backend routers use `Depends(get_db)` for the SQLAlchemy session.
- File uploads (photos, booking attachments) hit dedicated endpoints, are stored in MinIO, and are referenced by object key in the database. Retrieval uses 7-day presigned URLs.
- No auth — all data is global/shared between users.
