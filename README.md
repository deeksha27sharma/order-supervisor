# Order Supervisor

A proof-of-concept for a long-running AI agent that oversees a single order from creation to completion. One Temporal workflow runs per order. As order events arrive they are delivered as signals. The AI decides when to act immediately, when to sleep, and when to schedule a future wake-up.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Python 3.11+, FastAPI |
| Orchestration | Temporal (`temporalio`) |
| Database | PostgreSQL 15 |
| LLM | Groq (`llama-3.3-70b-versatile`) |
| Infrastructure | Docker Compose |

---

## Prerequisites

- Docker and Docker Compose
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier works)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/deeksha27sharma/order-supervisor.git
cd order-supervisor
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your Groq API key:

```
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Temporal server on port `7233`
- Temporal UI on port `8080`

### 4. Set up the backend

```bash
cd backend
pip install -e .
```

Run database migrations:

```bash
alembic upgrade head
```

Seed supervisor templates:

```bash
python scripts/seed_supervisors.py
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

Start the Temporal worker (in a separate terminal):

```bash
python -m app.worker
```

### 5. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

---

## Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Temporal UI | http://localhost:8080 |

---

## Simulating Events

To send events into a running workflow:

```bash
cd backend
python scripts/simulate_events.py --run-id <run_id>
```

Or inject events directly from the UI on the run detail page.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/order_supervisor` |
| `TEMPORAL_HOST` | Temporal server host | `localhost` |
| `TEMPORAL_PORT` | Temporal server port | `7233` |
| `TEMPORAL_NAMESPACE` | Temporal namespace | `default` |
| `TEMPORAL_TASK_QUEUE` | Temporal task queue name | `order-supervisor` |
| `GROQ_API_KEY` | Groq API key | — |
| `GROQ_MAIN_MODEL` | Model for main agent | `llama-3.3-70b-versatile` |
| `GROQ_CLASSIFIER_MODEL` | Model for event classifier | `llama-3.1-8b-instant` |
| `DEFAULT_WAKEUP_INTERVAL_SECONDS` | Scheduled wake-up interval | `300` |
| `MAX_WORKFLOW_AGE_SECONDS` | Max workflow lifetime | `604800` (7 days) |

---

## Project Structure

```
order-supervisor/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Agent and classifier logic
│   │   └── temporal/     # Workflow and activity definitions
│   ├── scripts/          # Seed and simulation scripts
│   ├── .env.example
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # UI components
│   └── lib/              # API client and utilities
├── migrations/           # Alembic migrations
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```