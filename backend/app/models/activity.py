import uuid
from datetime import datetime

from sqlalchemy import DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )

    run_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)

    # Activity type — what kind of entry this is:
    # "event"            — incoming order event (signal received)
    # "wake"             — agent woke up (reason: start | signal | schedule)
    # "sleep"            — agent went to sleep
    # "action"           — agent executed a business action
    # "memory_update"    — agent updated its compact memory
    # "instruction"      — user added extra instructions
    # "classifier"       — classifier made a wake/sleep decision
    # "completion"       — workflow completed or terminated
    activity_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    # Human-readable title for the timeline
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    # Full detail — message body, reasoning, note content, etc.
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Arbitrary structured payload (event data, tool args, classifier output, etc.)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.utcnow, index=True
    )