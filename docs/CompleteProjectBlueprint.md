 ---
  BeanATrip — Complete Project Blueprint

  ---
  1. Finalized Tech Stack

  Frontend

  ┌──────────────────────────┬─────────────────────────────────────────────────────┐
  │           Tool           │                        Role                         │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ Next.js 14+ (App Router) │ Framework — SSR, file routing, API routes           │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ TypeScript               │ Type safety across all frontend code                │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ TailwindCSS              │ Utility-first styling, powers the Bento Grid        │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ shadcn/ui                │ Base component library (Card, Dialog, Button, etc.) │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ TanStack Query           │ Server state, data fetching, caching                │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ Zustand                  │ Lightweight client state (UI state, active trip)    │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ @dnd-kit/core            │ Drag & drop for itinerary reordering                │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ FullCalendar             │ Calendar views for itinerary                        │
  ├──────────────────────────┼─────────────────────────────────────────────────────┤
  │ Google Maps JS API       │ Place search, map embeds                            │
  └──────────────────────────┴─────────────────────────────────────────────────────┘

  Backend

  ┌──────────────────────┬─────────────────────────────────────────────┐
  │         Tool         │                            Role                             │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ FastAPI (Python)     │ REST API, business logic, auto OpenAPI docs                 │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ SQLAlchemy + Alembic │ ORM + database migrations                                   │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Pydantic v2          │ Request/response validation                                 │
  ├──────────────────────┼─────────────────────────────────────────────────────────────┤
  │ Supabase             │ PostgreSQL + Auth + Storage + Realtime (all-in-one for MVP) │
  └──────────────────────┴─────────────────────────────────────────────────────────────┘

  Infrastructure (MVP)

  ┌──────────┬───────────────────────────────────────────┐
  │     Tool     │                   Role                    │
  ├──────────────┼───────────────────────────────────────────┤
  │ Supabase     │ DB, Auth, Storage, Realtime subscriptions │
  ├──────────────┼───────────────────────────────────────────┤
  │ Vercel       │ Frontend hosting (Next.js native)         │
  ├──────────────┼───────────────────────────────────────────┤
  │ Railway      │ FastAPI backend hosting                   │
  ├──────────────┼───────────────────────────────────────────┤
  │ Google Cloud │ Maps API, Places API                      │
  └──────────────┴───────────────────────────────────────────┘

  ---
  2. Bento Grid Design System

  What It Is

  A modular card-grid layout where each feature domain lives in its own self-contained "bento cell." Cells span different sizes to create visual hierarchy — no walls of scrolling content.

  Visual Language

  ┌──────────────┬──────┬──────┐
  │              │  B   │  C   │  ← Row 1: A is 2×1 wide, B and C are 1×1
  │      A       │      │      │
  ├──────┬───────┴──────┼──────┤
  │  D   │      E       │  F   │  ← Row 2: E is 2×1 wide
  │      │              │      │
  └──────┴──────────────┴──────┘

  Core Rules

  - Grid: grid-cols-4 on desktop, grid-cols-2 on tablet, grid-cols-1 on mobile
  - Gap: gap-4 (16px) between cells
  - Cards: rounded-2xl, subtle border, white/dark background, generous p-5 padding
  - Sizes: small col-span-1, medium col-span-2, hero col-span-3 or full col-span-4
  - Color accent: One accent color per card type (budget = green, timeline = blue, checklist = amber)

  Applied to Each Screen

  Home / Trips Dashboard

  ┌────────────────────┬──────────┐
  │   Active Trip Card │ Upcoming │  Active trip = hero cell (col-span-2)
  │   (map + details)  │  Trips   │
  ├──────────┬─────────┴──────────┤
  │ Quick    │   Recent Activity   │
  │ Add Trip │                    │
  └──────────┴────────────────────┘

  Trip Overview Dashboard

  ┌──────────┬──────────┬──────────┬──────────┐
  │ Budget   │Countdown │ Progress │ Members  │  ← 4 small stat cards
  │ Summary  │  to Trip │  Bar     │ Online   │
  ├──────────┴──────────┼──────────┴──────────┤
  │  Today's Itinerary  │   Expense Tracker   │  ← 2 medium cards
  │  (timeline)         │   (budget vs actual)│
  ├─────────────────────┴──────────┬──────────┤
  │      Map Preview               │Checklist │  ← map = hero, checklist = small
  │      (places pinned)           │          │
  └────────────────────────────────┴──────────┘

  Expense Overview

  ┌────────────────────┬──────────┬──────────┐
  │ Total Budget       │  Spent   │ Remaining│  ← 3 KPI cards
  ├────────────────────┴──────────┴──────────┤
  │         Budget vs Actual Chart (full row)│  ← wide chart card
  ├──────────────────┬───────────────────────┤
  │ Category Breakdown│ Recent Transactions  │
  │ (donut chart)     │ (list)               │
  └──────────────────┴───────────────────────┘

  ---
  3. Project Structure

  bean-a-trip/
  ├── frontend/                    # Next.js app
  │   ├── app/
  │   │   ├── (auth)/              # login, register pages
  │   │   ├── (app)/               # protected app routes
  │   │   │   ├── dashboard/       # home — trips list
  │   │   │   ├── trips/
  │   │   │   │   ├── [id]/        # trip overview dashboard
  │   │   │   │   ├── [id]/itinerary/
  │   │   │   │   ├── [id]/expenses/
  │   │   │   │   ├── [id]/bookings/
  │   │   │   │   ├── [id]/places/
  │   │   │   │   └── [id]/checklist/
  │   │   │   └── settings/
  │   │   └── layout.tsx
  │   ├── components/
  │   │   ├── bento/               # BentoGrid, BentoCard, size variants
  │   │   ├── trips/               # TripCard, TripForm
  │   │   ├── itinerary/           # DayTimeline, ActivityCard, DragHandle
  │   │   ├── expenses/            # ExpenseForm, BudgetChart, CategoryBadge
  │   │   ├── bookings/            # BookingCard, FileUpload
  │   │   ├── places/              # PlaceSearch, MapEmbed, PlaceCard
  │   │   ├── checklist/           # ChecklistItem, ChecklistGroup
  │   │   └── ui/                  # shadcn/ui re-exports + custom base components
  │   ├── lib/
  │   │   ├── api.ts               # axios/fetch client pointing to FastAPI
  │   │   ├── supabase.ts          # Supabase client
  │   │   └── utils.ts
  │   └── stores/                  # Zustand stores
  │
  └── backend/                     # FastAPI app
      ├── app/
      │   ├── main.py
      │   ├── api/
      │   │   ├── trips.py
      │   │   ├── itinerary.py
      │   │   ├── expenses.py
      │   │   ├── bookings.py
      │   │   ├── places.py
      │   │   └── checklist.py
      │   ├── models/              # SQLAlchemy models
      │   ├── schemas/             # Pydantic schemas
      │   ├── crud/                # DB operations
      │   └── core/
      │       ├── config.py
      │       ├── database.py
      │       └── auth.py          # JWT verification from Supabase
      ├── alembic/                 # migrations
      └── requirements.txt

  ---
  4. Core Database Schema

  users          id, email, name, avatar_url, created_at
  trips          id, name, destination, cover_image, start_date, end_date,
                 status (planning/active/completed), owner_id, created_at
  trip_members   trip_id, user_id, role (owner/editor/viewer)

  -- Itinerary
  itinerary_days id, trip_id, date, day_number
  activities     id, day_id, title, type, start_time, end_time,
                 place_id, notes, order_index, status

  -- Places
  places         id, trip_id, name, type (attraction/restaurant/hotel),
                 google_place_id, lat, lng, address, notes, rating

  -- Expenses
  budget_items   id, trip_id, category, planned_amount
  expenses       id, trip_id, title, amount, category,
                 paid_by, date, notes, receipt_url

  -- Bookings
  bookings       id, trip_id, type (flight/hotel/bus/other), title,
                 confirmation_number, provider, check_in, check_out,
                 amount, status, notes
  booking_files  id, booking_id, file_url, file_name, file_type

  -- Checklist
  checklists     id, trip_id, name, category
  checklist_items id, checklist_id, title, is_checked,
                  checked_by, checked_at, order_index

  ---
  5. Accounts & API Keys to Set Up

  ┌──────────┬─────────────────────┬───────────────────────┐
  │       Service        │       What For       │       Free Tier       │
  ├──────────────────────┼──────────────────────┼───────────────────────┤
  │ Supabase             │ DB + Auth + Storage  │ 500MB DB, 1GB storage │
  ├──────────────────────┼──────────────────────┼───────────────────────┤
  │ Vercel               │ Frontend deploy      │ Unlimited personal    │
  ├──────────────────────┼──────────────────────┼───────────────────────┤
  │ Railway              │ FastAPI backend      │ $5/mo hobby           │
  ├──────────────────────┼──────────────────────┼───────────────────────┤
  │ Google Cloud Console │ Maps API, Places API │ $200/mo credit        │
  ├──────────────────────┼──────────────────────┼───────────────────────┤
  │ GitHub               │ Source control       │ Free                  │
  └──────────────────────┴──────────────────────┴───────────────────────┘

  ---
  6. Development Roadmap

  Phase 0 — Setup (Day 1–2)

  - [ ] Create GitHub repo (monorepo: frontend/ + backend/)
  - [ ] Init Next.js 14 with TypeScript + TailwindCSS + shadcn/ui
  - [ ] Init FastAPI with SQLAlchemy + Alembic
  - [ ] Connect Supabase (DB + Auth)
  - [ ] Deploy skeleton to Vercel + Railway
  - [ ] Set up Google Maps API key

  Phase 1 — Core Foundation (Week 1–2)

  - [ ] Auth: login/register with Supabase Auth (Google OAuth)
  - [ ] Trip CRUD: create, list, view, edit, delete trips
  - [ ] Home dashboard: Bento Grid of trips
  - [ ] Trip Overview dashboard: Bento Grid of stats

  Phase 2 — Itinerary (Week 3)

  - [ ] Day management per trip
  - [ ] Activity CRUD within each day
  - [ ] Drag & drop reorder with @dnd-kit
  - [ ] Calendar view with FullCalendar

  Phase 3 — Expenses (Week 4)

  - [ ] Budget planning per category
  - [ ] Expense entry and tracking
  - [ ] Budget vs actual charts (Recharts)
  - [ ] Expense bento dashboard

  Phase 4 — Places & Bookings (Week 5–6)

  - [ ] Google Places search integration
  - [ ] Map embed with pinned places
  - [ ] Booking records with file upload (Supabase Storage)
  - [ ] Booking cards in bento layout

  Phase 5 — Checklist + Polish (Week 7)

  - [ ] Packing & preparation checklists
  - [ ] Shared checklist state (Supabase Realtime)
  - [ ] Mobile responsiveness across all views
  - [ ] Dark mode

  ---
  7. Day 1 Commands

  # Frontend
  npx create-next-app@latest frontend --typescript --tailwind --app
  cd frontend
  npx shadcn-ui@latest init
  npm install @tanstack/react-query zustand @dnd-kit/core @dnd-kit/sortable

  # Backend
  mkdir backend && cd backend
  python -m venv venv && source venv/bin/activate
  ---
  7. Day 1 Commands

  # Frontend
  npx create-next-app@latest frontend --typescript --tailwind --app
  cd frontend
  npx shadcn-ui@latest init
  npm install @tanstack/react-query zustand @dnd-kit/core @dnd-kit/sortable

  # Backend
  mkdir backend && cd backend
  python -m venv venv && source venv/bin/activate
  pip install fastapi uvicorn sqlalchemy alembic pydantic[email] python-jose supabase

  ---
  The single biggest decision that shapes everything else: Supabase as the data layer for MVP. It gives you a production-grade PostgreSQL database, auth with Google OAuth, file storage, and real-time
  subscriptions — all wired up in an afternoon. FastAPI sits in front of it for your business logic, and Next.js renders the Bento Grid UI on top. That is your complete starting point.