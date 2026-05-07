import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Supervisor(Base):
    __tablename__ = "supervisors"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base_instruction: Mapped[str] = mapped_column(Text, nullable=False)

    # List of action names the agent is allowed to use e.g. ["message_customer", "create_internal_note"]
    available_actions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # How often to wake up on schedule (seconds). None means use app default.
    wakeup_interval_seconds: Mapped[int | None] = mapped_column(nullable=True)

    # "conservative" | "moderate" | "aggressive" — how eagerly the classifier wakes the agent
    wakeup_aggressiveness: Mapped[str] = mapped_column(
        String(20), nullable=False, default="moderate"
    )

   
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )