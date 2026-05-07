"""
CLI script to simulate order events into a running workflow.
Run from the backend/ folder:
    python scripts/simulate_events.py <run_id> <event_type> [--payload '{"key": "value"}']

Examples:
    python scripts/simulate_events.py abc-123 payment_confirmed
    python scripts/simulate_events.py abc-123 shipment_delayed --payload '{"reason": "weather"}'
    python scripts/simulate_events.py abc-123 --scenario full
"""
import argparse
import asyncio
import json
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.temporal.client import get_temporal_client
from app.temporal.workflows.order_supervisor import OrderSupervisorWorkflow

VALID_EVENTS = [
    "order_created",
    "payment_confirmed",
    "payment_failed",
    "shipment_created",
    "shipment_delayed",
    "delivered",
    "refund_requested",
    "customer_message_received",
    "no_update_for_n_hours",
]

# A full happy-path scenario for demo purposes
HAPPY_PATH_SCENARIO = [
    ("order_created",       {"customer": "Jane Doe", "amount": 149.99, "items": ["Sneakers x1"]}),
    ("payment_confirmed",   {"method": "credit_card", "transaction_id": "txn_001"}),
    ("shipment_created",    {"carrier": "FedEx", "tracking": "FX123456789", "eta": "2 days"}),
    ("delivered",           {"signed_by": "Jane Doe", "timestamp": "2024-01-15T14:30:00Z"}),
]

# A problem scenario — payment fails then refund
PROBLEM_SCENARIO = [
    ("order_created",           {"customer": "Bob Smith", "amount": 299.99, "items": ["Laptop Stand x1"]}),
    ("payment_failed",          {"reason": "insufficient_funds", "attempt": 1}),
    ("customer_message_received", {"message": "I tried a different card, please retry"}),
    ("payment_confirmed",       {"method": "credit_card", "transaction_id": "txn_002"}),
    ("shipment_created",        {"carrier": "UPS", "tracking": "UP987654321", "eta": "3 days"}),
    ("shipment_delayed",        {"reason": "weather_disruption", "new_eta": "5 days"}),
    ("delivered",               {"signed_by": "Bob Smith", "timestamp": "2024-01-17T10:00:00Z"}),
]


async def send_event(workflow_id: str, event_type: str, payload: dict) -> None:
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    await handle.signal(OrderSupervisorWorkflow.order_event, event_type, payload)
    print(f"  ✓ Sent: {event_type} {json.dumps(payload)}")


async def run_scenario(workflow_id: str, scenario: list, delay_seconds: float = 2.0) -> None:
    print(f"Running scenario with {len(scenario)} events (delay: {delay_seconds}s between events)\n")
    for event_type, payload in scenario:
        await send_event(workflow_id, event_type, payload)
        if delay_seconds > 0:
            print(f"  Waiting {delay_seconds}s...")
            await asyncio.sleep(delay_seconds)
    print("\nScenario complete.")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Simulate order events into a workflow")
    parser.add_argument("run_id", help="The run ID (workflow ID will be derived from it)")
    parser.add_argument("event_type", nargs="?", help="Event type to send")
    parser.add_argument("--payload", default="{}", help="JSON payload string")
    parser.add_argument(
        "--scenario",
        choices=["happy", "problem"],
        help="Run a pre-built scenario instead of a single event",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=2.0,
        help="Seconds between events in a scenario (default: 2.0)",
    )

    args = parser.parse_args()

    workflow_id = f"order-supervisor-{args.run_id}"
    print(f"Target workflow: {workflow_id}\n")

    if args.scenario:
        scenario = HAPPY_PATH_SCENARIO if args.scenario == "happy" else PROBLEM_SCENARIO
        await run_scenario(workflow_id, scenario, delay_seconds=args.delay)
    elif args.event_type:
        if args.event_type not in VALID_EVENTS:
            print(f"Unknown event type: {args.event_type}")
            print(f"Valid events: {', '.join(VALID_EVENTS)}")
            sys.exit(1)
        payload = json.loads(args.payload)
        await send_event(workflow_id, args.event_type, payload)
    else:
        print("Error: provide either an event_type or --scenario flag")
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())