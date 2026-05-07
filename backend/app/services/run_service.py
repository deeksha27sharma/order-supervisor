from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.run import Run
from app.schemas.run import RunCreate


def create_run(db: Session, data: RunCreate) -> Run:
    run = Run(
        supervisor_id=data.supervisor_id,
        order_id=data.order_id,
        order_context=data.order_context,
        status="pending",
        extra_instructions=[],
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def get_run(db: Session, run_id: str) -> Run | None:
    return db.query(Run).filter(Run.id == run_id).first()


def list_runs(db: Session) -> list[Run]:
    return db.query(Run).order_by(Run.created_at.desc()).all()


def get_run_activities(db: Session, run_id: str) -> list[Activity]:
    return (
        db.query(Activity)
        .filter(Activity.run_id == run_id)
        .order_by(Activity.created_at.asc())
        .all()
    )