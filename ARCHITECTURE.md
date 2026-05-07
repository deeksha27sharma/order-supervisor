# Architecture

Order Supervisor is a proof-of-concept for a long-running AI agent that oversees a single order from creation to completion. One Temporal workflow runs per order. As order events arrive they are delivered into the workflow as signals. The AI decides when to act immediately, when to sleep, and when to schedule a future wake-up.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Python 3.11+, FastAPI |
| Orchestration | Temporal `1.24.2` (`temporalio` SDK) |
| Database | PostgreSQL 15 |
| LLM | Groq — `llama-3.3-70b-versatile` (main agent), `llama-3.1-8b-instant` (classifier) |
| Infrastructure | Docker Compose |

---

## High-Level Design

```
Browser (Next.js)
      │
      ▼
FastAPI Backend  (:8000)
      │
      ├── Reads/writes ──► PostgreSQL (:5432)
      │                    (supervisors, runs, activities)
      │
      └── Signals/queries ► Temporal Server (:7233)
                                │
                                └── Temporal Worker
                                        │
                                        ├── OrderSupervisorWorkflow
                                        │     ├── signal: order_event
                                        │     ├── signal: add_instructions
                                        │     ├── signal: interrupt / resume / terminate
                                        │     └── timer: scheduled_wakeup
                                        │
                                        ├── Main Agent (activity)
                                        │     └── Groq LLM + tools
                                        │
                                        └── Event Classifier (activity)
                                              └── Groq LLM (fast model)
```

---

## Core Components

### 1. Temporal Workflow (`backend/app/temporal/`)

One `OrderSupervisorWorkflow` runs per order. It is the source of truth for workflow lifecycle.

Three wake triggers are supported:

- **Workflow start** — agent runs immediately when the workflow is created.
- **Incoming signal** — every `order_event` signal is first evaluated by the classifier. If important, the main agent wakes immediately. Otherwise the workflow stays asleep.
- **Scheduled wake-up** — after each agent run, the agent sets a sleep duration. The workflow uses `workflow.sleep` to pause and resume at that time. Default interval is `300s` (configurable via `DEFAULT_WAKEUP_INTERVAL_SECONDS`).

Workflow completion is governed by explicit lifecycle rules only — a terminal order event, a manual terminate signal from the UI, or `MAX_WORKFLOW_AGE_SECONDS` being reached. The agent may recommend completion but cannot end the workflow itself.

### 2. Main Agent (`backend/app/services/agent.py`)

Invoked as a Temporal activity. On each wake cycle it:

1. Receives full run context: order details, compact memory summary, recent timeline, and any additional instructions.
2. Calls Groq (`llama-3.3-70b-versatile`) with context and available tools.
3. Executes tool calls — business actions or runtime actions.
4. Writes activity records to PostgreSQL.
5. Returns a sleep decision for the workflow.

**Business actions** (stored as activity records, no external calls):
- `message_fulfillment_team`
- `message_payments_team`
- `message_logistics_team`
- `message_customer`
- `create_internal_note`

**Runtime actions:**
- `sleep` — sets the next wake-up duration.
- `update_memory` — rewrites the compact memory summary.
- `record_reasoning` — saves reasoning outcome to workflow state.

### 3. Event Classifier (`backend/app/services/classifier.py`)

A lightweight policy running inside the workflow signal handler. Uses Groq (`llama-3.1-8b-instant`) to decide whether an incoming event is important enough to wake the main agent immediately. Low-importance events are queued; high-importance events (e.g. `payment_failed`, `shipment_delayed`) trigger an immediate wake.

### 4. FastAPI Backend (`backend/app/api/`)

```
POST   /api/supervisors                    create supervisor config
GET    /api/supervisors/{id}               get supervisor config

POST   /api/runs                           start a new order run
GET    /api/runs                           list all runs
GET    /api/runs/{run_id}                  get run detail
GET    /api/runs/{run_id}/activities       get activity log

POST   /api/runs/{run_id}/events           inject an order event
POST   /api/runs/{run_id}/instructions     add run-specific instructions
POST   /api/runs/{run_id}/interrupt        pause the workflow
POST   /api/runs/{run_id}/resume           resume a paused workflow
POST   /api/runs/{run_id}/terminate        terminate the workflow
```

### 5. Database (`migrations/`)

Managed with Alembic against PostgreSQL 15.

- **supervisors** — name, base instruction, available tools, model config, wake aggressiveness.
- **runs** — order id, supervisor id, status, memory summary, next wake-up time, final summary.
- **activities** — unified log per run. Stores incoming events, wake/sleep decisions, agent actions, manual instructions, and final output. Each record has a `type`, `payload` (JSON), and `timestamp`.

### 6. Frontend (`frontend/`)

Next.js 14 App Router with Tailwind CSS.

- **Supervisors page** — create and view supervisor configurations.
- **Runs page** — list active and completed runs, start a new run.
- **Run detail page** — timeline, activity history, memory summary, sleep state, final summary. Controls to inject events, add instructions, interrupt, resume, or terminate.

---

## Memory and Context Compaction

Each run maintains a **compact memory summary** — a short prose blob rewritten by the agent after significant events. Older timeline entries remain in the database but are not sent to the LLM once the summary covers them. This keeps the context window bounded without losing history.

---

## Workflow Lifecycle

```
POST /api/runs
      │
      ▼
Temporal: start OrderSupervisorWorkflow
      │
      ▼
Agent wakes (start trigger)
Reasons → may act → sets sleep duration
      │
      ├─── signal: order_event arrives
      │         │
      │    classifier runs
      │         │
      │    important? ──yes──► agent wakes immediately
      │         │
      │        no ──► event queued, stay asleep
      │
      └─── sleep duration reached (scheduled wake-up)
                │
           agent wakes → reasons → may act → sets new sleep
                │
      terminal event OR manual terminate OR max age reached
                │
                ▼
      agent runs final step: summary + learnings + feedback
                │
                ▼
      workflow completes
```

---

## Configuration

Key environment variables in `backend/.env`:

| Variable | Description | Default |
|---|---|---|
| `GROQ_MAIN_MODEL` | Main agent model | `llama-3.3-70b-versatile` |
| `GROQ_CLASSIFIER_MODEL` | Classifier model | `llama-3.1-8b-instant` |
| `DEFAULT_WAKEUP_INTERVAL_SECONDS` | Scheduled wake-up interval | `300` |
| `MAX_WORKFLOW_AGE_SECONDS` | Max workflow lifetime | `604800` (7 days) |
| `TEMPORAL_TASK_QUEUE` | Temporal task queue | `order-supervisor` |