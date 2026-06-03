# BeanATrip

An all-in-one travel planning and trip management web application. Replace the scattered chaos of Google Sheets, Notes, Messenger, and Calendar with a single workspace that covers your entire travel lifecycle — from planning to memories.

Built for personal use by a couple, designed to scale into a multi-user platform.

---

## Features

### Trip Management
- Create and manage trips with name, destination, dates, status, and cover color
- Trip status tracking: Planning → Active → Completed
- Trip overview dashboard with countdown, duration, and quick navigation

### Itinerary
- Day-by-day planning with activity management
- Drag-and-drop activity reordering
- Activity types: Activity, Food, Transport, Accommodation, Other
- Activity status: Planned, Done, Skipped
- **Calendar view** (month + week) alongside the list view

### Expenses
- Per-category budget planning (Food, Transport, Accommodation, Activities, Shopping, Other)
- Expense tracking with date and category
- Budget vs actual bar chart
- Remaining budget with over-budget alerts

### Bookings
- Records for flights, hotels, buses, trains, ferries
- Confirmation numbers, provider, check-in/out dates, amount, status
- **File attachments** per booking (PDFs, images) stored in MinIO

### Places
- Save attractions, restaurants, hotels, cafes, and shops
- Star ratings (1–5) and visited toggle
- Filter by place type

### Checklist
- Grouped by category: Packing, Documents, Preparation, Other
- Progress bar per category and overall
- Auto-refreshes every 30 seconds for shared access

### Notes
- Trip journal with card grid view
- Full note editor with title and freeform content

### Photos
- Upload trip photos (JPEG, PNG, WebP, up to 20MB each)
- Masonry gallery with inline caption editing
- Stored in MinIO (self-hosted object storage)

### Dashboard
- Upcoming activities from the active trip
- Budget overview with spent vs remaining
- Trip statistics: total, upcoming, completed, days to next trip

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| State / Data | TanStack Query, Zustand |
| Backend | FastAPI (Python), SQLAlchemy, Alembic |
| Database | PostgreSQL 16 |
| File Storage | MinIO (S3-compatible, self-hosted) |
| Charts | Recharts |
| Calendar | FullCalendar |
| Drag & Drop | @dnd-kit |
| Infrastructure | Docker + Docker Compose |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose V2
- Node.js 20+ (for local frontend development only)
- Python 3.10+ (for running Alembic migrations locally)

Verify Docker Compose V2 is available:
```bash
docker compose version
# Docker Compose version v2.x.x
```

> If you have the old `docker-compose` (v1) installed, use `docker compose` (with a space) instead throughout this guide.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url> bean-a-trip
cd bean-a-trip
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (the defaults work for local development):

```env
# PostgreSQL
POSTGRES_USER=beanatrip_admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=beanatrip

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_secure_password
MINIO_BUCKET=beanatip
MINIO_PUBLIC_URL=http://localhost:9000

# Backend
CORS_ORIGINS=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Build and start all services

```bash
docker compose up -d
```

This starts four containers:
- `bean-a-trip-db-1` — PostgreSQL on port **5434**
- `bean-a-trip-minio-1` — MinIO on ports **9000** (API) and **9001** (console)
- `bean-a-trip-backend-1` — FastAPI on port **8000**
- `bean-a-trip-frontend-1` — Next.js on port **3000**

### 4. Run database migrations

On first run, create the database schema:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

DATABASE_URL=postgresql://beanatrip_admin:your_secure_password@localhost:5434/beanatrip \
alembic upgrade head
```

### 5. Open the app

```
http://localhost:3000
```

You land directly on the dashboard — no login required.

---

## Service URLs

| Service | URL | Notes |
|---|---|---|
| App | http://localhost:3000 | Main web application |
| API | http://localhost:8000 | FastAPI backend |
| API Docs | http://localhost:8000/docs | Interactive Swagger UI |
| MinIO Console | http://localhost:9001 | File storage admin (minioadmin / minioadmin) |

---

## Project Structure

```
bean-a-trip/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry, CORS, MinIO bucket init
│   │   ├── api/v1/              # REST endpoints
│   │   │   ├── trips.py
│   │   │   ├── itinerary.py
│   │   │   ├── expenses.py
│   │   │   ├── bookings.py
│   │   │   ├── booking_files.py
│   │   │   ├── places.py
│   │   │   ├── checklist.py
│   │   │   ├── notes.py
│   │   │   └── photos.py
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── core/
│   │       ├── config.py        # Settings from environment variables
│   │       ├── database.py      # SQLAlchemy engine + session
│   │       └── storage.py       # MinIO client + presigned URLs
│   ├── alembic/versions/        # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── app/(app)/               # Protected app routes
│   │   └── trips/[id]/
│   │       ├── page.tsx         # Trip overview
│   │       ├── itinerary/       # Itinerary with calendar view
│   │       ├── expenses/        # Budget + expense tracking
│   │       ├── bookings/        # Bookings + file attachments
│   │       ├── places/          # Place list + map
│   │       ├── checklist/       # Packing + prep checklists
│   │       ├── notes/           # Travel journal
│   │       └── photos/          # Photo gallery
│   ├── components/
│   │   ├── bento/               # BentoGrid + BentoCard layout components
│   │   ├── trips/               # TripCard, TripForm, dialogs
│   │   ├── itinerary/           # ActivityCard, DnD list, FullCalendar
│   │   ├── expenses/            # BudgetChart, ExpenseForm, BudgetSetup
│   │   ├── bookings/            # BookingAttachments file upload
│   │   └── layout/              # Sidebar, Navbar, ThemeToggle
│   ├── hooks/                   # TanStack Query hooks per feature
│   ├── types/                   # TypeScript interfaces
│   └── lib/
│       ├── api.ts               # Axios instance
│       └── trip-utils.ts        # Date helpers, color constants
│
└── docs/
    ├── ProjectOverview.md
    ├── TechStack.md
    └── FutureFeatures.md        # Features planned for future phases
```

---

## Database Schema

| Table | Description |
|---|---|
| `trips` | Core trip record with dates, status, cover color |
| `itinerary_days` | Days within a trip |
| `activities` | Activities per day with type, time, status |
| `budget_items` | Planned budget per expense category |
| `expenses` | Actual expense records |
| `bookings` | Flight/hotel/transport booking records |
| `booking_files` | File attachments for bookings (MinIO) |
| `places` | Saved locations with type and rating |
| `checklist_items` | Packing and preparation checklist items |
| `notes` | Trip journal entries |
| `trip_photos` | Photo metadata (files stored in MinIO) |

---

## Development

### Running locally (without Docker)

**Backend:**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set environment variables
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
npm run dev      # http://localhost:3000
```

### Rebuilding after code changes

```bash
# Rebuild a specific service
docker compose build backend
docker compose build frontend

# Restart it
docker compose up -d --force-recreate backend
docker compose up -d --force-recreate frontend
```

### Adding a database migration

```bash
cd backend

# Auto-generate from model changes
DATABASE_URL=postgresql://... alembic revision --autogenerate -m "add new table"

# Apply migrations
DATABASE_URL=postgresql://... alembic upgrade head

# Roll back one step
DATABASE_URL=postgresql://... alembic downgrade -1
```

### Stopping the stack

```bash
docker compose down          # stop containers, keep data volumes
docker compose down -v       # stop containers and delete all data
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | — | PostgreSQL username |
| `POSTGRES_PASSWORD` | — | PostgreSQL password |
| `POSTGRES_DB` | — | PostgreSQL database name |
| `MINIO_ROOT_USER` | — | MinIO admin username |
| `MINIO_ROOT_PASSWORD` | — | MinIO admin password |
| `MINIO_BUCKET` | `beanatip` | MinIO bucket name for all uploads |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | Public URL for presigned file links |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins for the backend API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL used by the frontend |

---

## Roadmap

See [`docs/FutureFeatures.md`](docs/FutureFeatures.md) for planned features including:

- Google Maps integration for places
- AI-generated itineraries (Claude API)
- Expense split for group travel
- Real-time collaboration via WebSockets
- Weather forecast per trip
- Google Calendar sync
- Cross-trip analytics
