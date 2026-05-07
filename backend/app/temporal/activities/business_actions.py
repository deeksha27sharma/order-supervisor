from temporalio import activity

from app.database import SessionLocal
from app.models.activity import Activity


async def _record_action(
    run_id: str,
    action_name: str,
    recipient: str,
    message: str,
    extra_payload: dict | None = None,
) -> str:
    """Internal helper: writes an action activity record to the DB."""
    db = SessionLocal()
    try:
        payload = {"recipient": recipient, "message": message}
        if extra_payload:
            payload.update(extra_payload)

        entry = Activity(
            run_id=run_id,
            activity_type="action",
            title=f"{action_name} → {recipient}",
            detail=message,
            payload=payload,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry.id
    finally:
        db.close()


@activity.defn
async def message_fulfillment_team(run_id: str, message: str) -> str:
    """Send a message to the fulfillment team (mocked — logs to activity table)."""
    return await _record_action(
        run_id=run_id,
        action_name="message_fulfillment_team",
        recipient="fulfillment_team",
        message=message,
    )


@activity.defn
async def message_payments_team(run_id: str, message: str) -> str:
    """Send a message to the payments team (mocked — logs to activity table)."""
    return await _record_action(
        run_id=run_id,
        action_name="message_payments_team",
        recipient="payments_team",
        message=message,
    )


@activity.defn
async def message_logistics_team(run_id: str, message: str) -> str:
    """Send a message to the logistics team (mocked — logs to activity table)."""
    return await _record_action(
        run_id=run_id,
        action_name="message_logistics_team",
        recipient="logistics_team",
        message=message,
    )


@activity.defn
async def message_customer(run_id: str, message: str) -> str:
    """Send a message to the customer (mocked — logs to activity table)."""
    return await _record_action(
        run_id=run_id,
        action_name="message_customer",
        recipient="customer",
        message=message,
    )


@activity.defn
async def create_internal_note(run_id: str, note: str) -> str:
    """Create an internal note (mocked — logs to activity table)."""
    return await _record_action(
        run_id=run_id,
        action_name="create_internal_note",
        recipient="internal",
        message=note,
    )