# BeanATrip — Future Features

Features intentionally deferred from the MVP. These are candidates for future implementation phases when BeanATrip evolves toward a multi-user SaaS product.

---

## Google Maps Integration

**Why deferred:** Requires a paid Google Cloud API key and billing setup.

**What it enables:**
- Place autocomplete search with real location data
- Embedded map view with pinned trip destinations
- Route planning between places
- Nearby attraction discovery

**Implementation notes:**
- Google Maps JavaScript API + Places API
- `@vis.gl/react-google-maps` or `@googlemaps/js-api-loader`
- Store `google_place_id`, `lat`, `lng` on the `places` table (columns already exist as nullable)
- Map embed on the trip overview page showing all pinned places

---

## Expense Split

**Why deferred:** Requires multi-user auth and relationship tracking between users.

**What it enables:**
- Group expense settlement between travelers
- Debt calculation (who owes whom and how much)
- Payment balancing (minimal transactions to settle)

**Implementation notes:**
- New table: `expense_splits` (expense_id, paid_by_user_id, owed_by_user_id, amount)
- Settlement algorithm: simplified debt reduction
- Requires auth system to identify individual users
- UI: split summary per trip, payment status tracking

---

## AI Features

**Why deferred:** Requires external LLM API integration and async job queue.

### AI Itinerary Generation
- Generate a full day-by-day itinerary from destination, trip duration, and travel style preferences
- Integration: Claude API or OpenAI GPT-4o with structured JSON output
- Backend: Celery + Redis for async processing (long-running LLM call)

### AI Budget Estimation
- Estimate trip budget by destination, duration, and travel style
- Integration: LLM with retrieval-augmented generation from travel cost databases

### Travel Recommendations
- Personalized place recommendations based on trip destination and past places visited
- Integration: LLM + Places API

### AI Travel Assistant Chatbot
- In-app chat assistant for travel planning questions
- Context-aware: knows the current trip's destination, dates, budget, existing itinerary
- Integration: Claude API with function calling to read/write trip data

**Implementation notes:**
- Backend: `POST /trips/{id}/ai/generate-itinerary`, `POST /trips/{id}/ai/estimate-budget`
- Anthropic Claude API recommended for structured output
- Frontend: chat widget component, async loading states
- Infrastructure: add `ANTHROPIC_API_KEY` to env, Celery + Redis for job queue

---

## Travel Journal — Timeline Replay

**Why deferred:** Requires rich media storage and a complex UI timeline component.

**What it enables:**
- Chronological replay of the trip: places visited, expenses, activities, notes, photos all on one timeline
- Export trip as a visual travel diary

**Implementation notes:**
- Aggregates data from all trip sections (itinerary, expenses, places, photos, notes) by date
- Frontend: vertical timeline component with media cards
- Could use `react-chrono` or custom CSS timeline

---

## Weather API Integration

**Why deferred:** Requires external API subscription and adds complexity to trip planning flow.

**What it enables:**
- Weather forecast for trip destination during travel dates
- Weather widget on trip overview page
- Packing recommendations based on forecast

**Implementation notes:**
- API: OpenWeatherMap or WeatherAPI.com (both have free tiers)
- Backend: `GET /trips/{id}/weather` proxies weather API using destination + dates
- Frontend: weather bento card on trip overview
- Cache responses in Redis to avoid API rate limits

---

## Google Calendar Sync

**Why deferred:** Requires OAuth integration and Google Calendar API.

**What it enables:**
- Sync trip dates and daily activities to Google Calendar
- Receive calendar reminders for activities
- Two-way sync: calendar events create activities

**Implementation notes:**
- Google Calendar API via OAuth2
- Backend: `POST /trips/{id}/sync-calendar`
- Scope: `https://www.googleapis.com/auth/calendar.events`
- Store calendar event IDs to enable updates/deletions

---

## Booking Platform Integration

**Why deferred:** Requires partnerships or screen-scraping (ToS concerns).

**What it enables:**
- Import booking confirmations directly from email (Gmail API)
- One-click import from Booking.com, Agoda, AirAsia links
- Automatic parsing of confirmation numbers, dates, amounts

**Implementation notes:**
- Gmail API with `gmail.readonly` scope to parse confirmation emails
- NLP/regex parsing of common booking email formats
- Frontend: "Import from email" button in Booking section

---

## Multi-User Real-Time Collaboration

**Why deferred:** Requires WebSocket infrastructure and auth system.

**What it enables:**
- Live updates: partner's changes appear instantly without refreshing
- Presence indicators: see when your partner is viewing the same page
- Conflict resolution for simultaneous edits

**Current behavior:** Both users share the same data (no auth). Changes appear after manual refresh. TanStack Query's `refetchInterval` provides 30-second auto-refresh as a workaround.

**Implementation notes:**
- FastAPI WebSockets + Redis pub/sub for broadcasting changes
- Frontend: `useWebSocket` hook subscribes to trip-specific channel
- On any mutation success, broadcast event to all subscribers
- Infrastructure: Redis required (not currently in stack)

---

## Cross-Trip Analytics

**Why deferred:** Requires aggregating data across multiple trips — useful once users have 3+ completed trips.

**What it enables:**
- Spending trends across trips (total spent per destination, category patterns)
- Most visited place types
- Average trip duration and budget
- Year-in-review summary

**Implementation notes:**
- Backend: `GET /analytics/summary` aggregates all trip data
- Charts: spending by destination, category distribution across trips
- Frontend: dedicated `/analytics` page accessible from sidebar

---

## Photo Album (Rich Media)

**Why deferred:** MinIO is running but rich photo management (albums, tagging, EXIF, compression) is complex.

**Current state:** Basic photo upload per trip is implemented. Photos can be uploaded and viewed in the Photos gallery.

**Future enhancements:**
- Photo albums / grouping by day
- EXIF data extraction (location, camera settings)
- Image compression on upload (Pillow)
- Face tagging and search
- Slideshow / timeline replay mode
- Export trip as photo book PDF
