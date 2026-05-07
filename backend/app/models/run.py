import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    # FK to supervisors table (kept as plain string to avoid SQLAlchemy relationship complexity)
    supervisor_id: Mapped[str] = mapped_column(String(36), nullable=False)

    # Order info provided at run creation
    order_id: Mapped[str] = mapped_column(String(255), nullable=False)
    order_context: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Temporal identifiers
    temporal_workflow_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    temporal_run_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Run lifecycle status
    # pending | running | sleeping | interrupted | completed | terminated | failed
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")

    # Extra instructions added by the user after the run started
    extra_instructions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # Compact rolling memory summary maintained by the agent
    memory_summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # When the agent has scheduled its next wake-up (ISO string)
    next_wakeup_at: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Agent-generated wake-up guidance for the classifier
    wakeup_guidance: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Final output produced when the workflow completes
    final_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_actions_taken: Mapped[list | None] = mapped_column(JSON, nullable=True)
    final_learnings: Mapped[str | None] = mapped_column(Text, nullable=True)
    final_recommendations: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)