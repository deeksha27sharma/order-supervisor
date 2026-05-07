from sqlalchemy.orm import Session

from app.models.supervisor import Supervisor
from app.schemas.supervisor import SupervisorCreate


def create_supervisor(db: Session, data: SupervisorCreate) -> Supervisor:
    supervisor = Supervisor(
        name=data.name,
        base_instruction=data.base_instruction,
        available_actions=data.available_actions,
        wakeup_interval_seconds=data.wakeup_interval_seconds,
        wakeup_aggressiveness=data.wakeup_aggressiveness,
        model=data.model,
    )
    db.add(supervisor)
    db.commit()
    db.refresh(supervisor)
    return supervisor


def get_supervisor(db: Session, supervisor_id: str) -> Supervisor | None:
    return db.query(Supervisor).filter(Supervisor.id == supervisor_id).first()


def list_supervisors(db: Session) -> list[Supervisor]:
    return db.query(Supervisor).order_by(Supervisor.created_at.desc()).all()