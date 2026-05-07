from datetime import datetime

from temporalio import activity

from app.database import SessionLocal
from app.models.activity import Activity
from app.models.run import Run


@activity.defn
async def save_activity(
    run_id: str,
    activity_type: str,
    title: str,
    detail: str | None = None,
    payload: dict | None = None,
) -> str:
    """Persist an activity log entry. Returns the new activity id."""
    db = SessionLocal()
    try:
        entry = Activity(
            run_id=run_id,
            activity_type=activity_type,
            title=title,
            detail=detail,
            payload=payload,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry.id
    finally:
        db.close()


@activity.defn
async def update_run_state(
    run_id: str,
    status: str | None = None,
    memory_summary: str | None = None,
    next_wakeup_at: str | None = None,
    wakeup_guidance: str | None = None,
    final_summary: str | None = None,
    final_actions_taken: list | None = None,
    final_learnings: str | None = None,
    final_recommendations: str | None = None,
) -> None:
    """Update mutable fields on a Run row."""
    db = SessionLocal()
    try:
        run = db.query(Run).filter(Run.id == run_id).first()
        if not run:
            return

        if status is not None:
            run.status = status
        if memory_summary is not None:
            run.memory_summary = memory_summary
        if next_wakeup_at is not None:
            run.next_wakeup_at = next_wakeup_at
        if wakeup_guidance is not None:
            run.wakeup_guidance = wakeup_guidance
        if final_summary is not None:
            run.final_summary = final_summary
        if final_actions_taken is not None:
            run.final_actions_taken = final_actions_taken
        if final_learnings is not None:
            run.final_learnings = final_learnings
        if final_recommendations is not None:
            run.final_recommendations = final_recommendations

        if status in ("completed", "terminated", "failed"):
            run.completed_at = datetime.utcnow()

        run.updated_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()