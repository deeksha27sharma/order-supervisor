-- Supervisors: reusable agent configuration templates
CREATE TABLE IF NOT EXISTS supervisors (
    id                      VARCHAR(36) PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    base_instruction        TEXT NOT NULL,
    available_actions       JSONB NOT NULL DEFAULT '[]',
    wakeup_interval_seconds INTEGER,
    wakeup_aggressiveness   VARCHAR(20) NOT NULL DEFAULT 'moderate',
    model                   VARCHAR(100),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Runs: one row per order workflow instance
CREATE TABLE IF NOT EXISTS runs (
    id                      VARCHAR(36) PRIMARY KEY,
    supervisor_id           VARCHAR(36) NOT NULL REFERENCES supervisors(id),
    order_id                VARCHAR(255) NOT NULL,
    order_context           JSONB NOT NULL DEFAULT '{}',
    temporal_workflow_id    VARCHAR(255),
    temporal_run_id         VARCHAR(255),
    status                  VARCHAR(30) NOT NULL DEFAULT 'pending',
    extra_instructions      JSONB NOT NULL DEFAULT '[]',
    memory_summary          TEXT,
    next_wakeup_at          VARCHAR(50),
    wakeup_guidance         TEXT,
    final_summary           TEXT,
    final_actions_taken     JSONB,
    final_learnings         TEXT,
    final_recommendations   TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMP
);

-- Activities: single unified log for everything that happens in a run
CREATE TABLE IF NOT EXISTS activities (
    id            VARCHAR(36) PRIMARY KEY,
    run_id        VARCHAR(36) NOT NULL REFERENCES runs(id),
    activity_type VARCHAR(30) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    detail        TEXT,
    payload       JSONB,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_runs_supervisor_id  ON runs (supervisor_id);
CREATE INDEX IF NOT EXISTS idx_runs_status         ON runs (status);
CREATE INDEX IF NOT EXISTS idx_runs_order_id       ON runs (order_id);
CREATE INDEX IF NOT EXISTS idx_activities_run_id   ON activities (run_id);
CREATE INDEX IF NOT EXISTS idx_activities_type     ON activities (activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created  ON activities (created_at);