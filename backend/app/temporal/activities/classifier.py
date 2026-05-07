from temporalio import activity

from app.config import settings

# Events that always wake the agent immediately regardless of aggressiveness
ALWAYS_WAKE_EVENTS = {
    "payment_failed",
    "refund_requested",
    "customer_message_received",
}

# Events that never need to wake the agent immediately
NEVER_WAKE_EVENTS = {
    "no_update_for_n_hours",
}

# Priority score per event type (higher = more likely to wake)
EVENT_PRIORITY: dict[str, int] = {
    "payment_failed": 10,
    "refund_requested": 9,
    "customer_message_received": 8,
    "shipment_delayed": 7,
    "delivered": 6,
    "payment_confirmed": 5,
    "shipment_created": 4,
    "order_created": 3,
    "no_update_for_n_hours": 1,
}

# Minimum priority score needed to wake, per aggressiveness level
WAKE_THRESHOLD: dict[str, int] = {
    "aggressive": 3,
    "moderate": 5,
    "conservative": 7,
}


@activity.defn
async def classify_event(
    event_type: str,
    event_payload: dict,
    aggressiveness: str,
    wakeup_guidance: str | None,
) -> dict:
    """
    Lightweight classifier that decides whether an incoming event
    is important enough to wake the main agent immediately.

    Returns:
        {
            "should_wake": bool,
            "reason": str,
            "priority": int,
        }
    """
    # Hard overrides first
    if event_type in ALWAYS_WAKE_EVENTS:
        return {
            "should_wake": True,
            "reason": f"{event_type} always triggers immediate wake",
            "priority": EVENT_PRIORITY.get(event_type, 5),
        }

    if event_type in NEVER_WAKE_EVENTS:
        return {
            "should_wake": False,
            "reason": f"{event_type} never triggers immediate wake",
            "priority": EVENT_PRIORITY.get(event_type, 1),
        }

    priority = EVENT_PRIORITY.get(event_type, 5)
    threshold = WAKE_THRESHOLD.get(aggressiveness, 5)

    # Apply agent-generated wake-up guidance if present
    if wakeup_guidance:
        guidance_lower = wakeup_guidance.lower()
        event_lower = event_type.lower().replace("_", " ")
        if event_lower in guidance_lower or "all events" in guidance_lower:
            priority = max(priority, threshold)

    should_wake = priority >= threshold

    return {
        "should_wake": should_wake,
        "reason": (
            f"priority {priority} {'≥' if should_wake else '<'} "
            f"threshold {threshold} for aggressiveness='{aggressiveness}'"
        ),
        "priority": priority,
    }