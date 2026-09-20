# Shipment Tracker

A full-stack shipment tracking application. Users can view shipments in a grid or table, filter/search by status, drill into a shipment's full status history, create new shipments, and push status updates (e.g. `BOOKED → IN_TRANSIT → CUSTOMS_HOLD → OUT_FOR_DELIVERY → DELIVERED`, or `CANCELLED`).

## Live Deployment

- **Frontend:** https://shipment-tracker-vert-eight.vercel.app
- **Backend API:** https://shipment-tracker-xx8o.onrender.com/api

> Note: the backend is hosted on Render's free tier, so the first request after a period of inactivity may take 30–60s while the instance cold-starts.
  
## Tech Stack & Why

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React 19 + TypeScript + Vite** | Fast dev server/HMR, native ESM build, strong typing for shipment/status shapes shared with the API contract. |
| Styling | **Tailwind CSS v4** | Utility-first styling keeps status badges, cards, and modals consistent without hand-rolled CSS files; v4's Vite plugin needs no separate PostCSS config. |
| Icons | **lucide-react** | Lightweight, tree-shakeable icon set for UI affordances (refresh, empty-state, etc.). |
| Backend | **Node.js + Express 5 + TypeScript** | Minimal, well-understood REST framework; TypeScript keeps request/response shapes in sync with the frontend's `types.ts`. |
| Database | **PostgreSQL (`pg` driver)** | Shipments and their status history are inherently relational (one shipment → many history rows); Postgres gives transactional guarantees for status updates and is trivial to run locally via Docker or host managed (Render/Neon/Supabase). |
| Dev runtime | **tsx / nodemon** (dev), **tsc** build → plain `node` (prod) | Fast TS iteration locally, compiled JS in the production image (no runtime TS compilation cost). |
| Containerization | **Docker** (multi-stage builds for both apps) + **docker-compose** for Postgres | Reproducible builds; compose is used to spin up just the database locally without installing Postgres natively. |
| Frontend serving (prod) | **Nginx** (via frontend Dockerfile) | Serves the static Vite build; deployed instead to Vercel for the live demo, but the Dockerfile/Nginx path is there for container-based deployment. |

**API design:** A single REST resource, `/api/shipments`, keeps the surface area small:
- `GET /api/shipments` — list all shipments (with embedded history)
- `GET /api/shipments/:idOrReference` — fetch one shipment by internal ID or human-readable reference number
- `POST /api/shipments` — create a shipment
- `PATCH /api/shipments/:idOrReference/status` — append a status transition (writes a new `shipment_history` row and updates `current_status`)

Status updates are wrapped in a SQL transaction with a row lock (`FOR UPDATE`) so a shipment's status and its history entry are written atomically.

## Steps to Run Locally

### Prerequisites
- Node.js 22+
- Docker (for Postgres) — or a local/hosted Postgres instance

### 1. Start Postgres
From the project root:
```bash
# create a .env in the root with:
# POSTGRES_DB=shipment_tracker
# POSTGRES_USER=shipment_user
# POSTGRES_PASSWORD=shipment_pass
# POSTGRES_PORT=5432

docker compose up -d
```

### 2. Backend
```bash
cd backend
npm install

# create backend/.env:
# DATABASE_URL=postgresql://shipment_user:shipment_pass@localhost:5432/shipment_tracker
# PORT=5000
# FRONTEND_URL=http://localhost:5173

npm run dev
```
The API starts on `http://localhost:5000`, creates its tables on boot if they don't exist, and seeds 5 sample shipments on first run. Health check: `GET http://localhost:5000/api/health`.

### 3. Frontend
```bash
cd frontend
npm install

# create frontend/.env:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```
The app starts on `http://localhost:5173` (Vite default).

### Running with Docker only (backend + frontend as containers)
Both `backend/Dockerfile` and `frontend/Dockerfile` are multi-stage builds. Build/run each with the appropriate env vars (`DATABASE_URL` for the backend, `VITE_API_URL` build-arg for the frontend) if you want a fully containerized local setup instead of `npm run dev`.

## Assumptions

- **Status flow is linear with one branch:** `BOOKED → IN_TRANSIT → (CUSTOMS_HOLD) → OUT_FOR_DELIVERY → DELIVERED`, with `CANCELLED` reachable from any state (modeled as `step: 0`, outside the main progression). The API does not currently enforce valid transitions server-side — any status update to any of the 6 enum values is accepted regardless of the shipment's current state — so "no backward or skipped transitions" is a UI convention, not a hard constraint.
- **Reference numbers are optional on creation** and auto-generated (`NKG-<year>-<random 4 digits>`) if omitted; uniqueness is enforced at the DB level but collisions are not retried.
- **A shipment always has at least one history entry** — creation itself writes an initial history row so the timeline is never empty.
- **No authentication/authorization** — the API assumes a single trusted internal user base (e.g. an ops team); anyone who can reach the API can create shipments or change status. `updatedBy` on a status update is a free-text field, not tied to a logged-in identity.
- **Weight, carrier, package type, sender, recipient are optional on creation** and fall back to sensible defaults if omitted, since the core required fields are just origin, destination, expected delivery date, and an initial status.
- **IDs are treated as opaque strings** (`shp_<uuid>`), and lookups accept either the internal ID or the human-facing reference number interchangeably.

## Scaling to 10,000 Shipments & Multiple Concurrent Users

At that scale the current design would still mostly hold up structurally, but a few things would need to change. First, I'd add indexes and pagination — right now `GET /api/shipments` returns every row with its full history aggregated per request; that needs cursor- or offset-based pagination plus indexes on `current_status`, `expected_delivery_date`, and `reference_number` to keep filtering fast. Second, I'd move status updates toward an event-driven pattern (e.g. publish a `shipment.status_changed` event to a queue like SQS/Kafka) so downstream consumers — notifications, analytics, customer-facing tracking pages — don't couple directly to the write path, and so history writes don't block the request thread under load. Third, I'd introduce connection pooling limits and possibly read replicas, since `pg.Pool` defaults won't scale well against many concurrent API instances hitting one primary; read-heavy endpoints (list/search) could route to a replica. Fourth, I'd add caching (Redis) for the shipment list/detail views with short TTLs or cache invalidation on write, since shipment status doesn't change every second but is read constantly. Fifth, I'd enforce valid state transitions server-side (a status transition table) to prevent bad concurrent writes from corrupting the history, and add optimistic concurrency (a version column) rather than relying solely on row locks for every update. Finally, on the frontend, list rendering would need virtualization (e.g. `react-window`) once the shipment count grows past what's comfortable to render in a single grid/table pass, and the app would move from "fetch everything on load" to server-side filtering/pagination/search so the client never holds more than a page of shipments at a time.
