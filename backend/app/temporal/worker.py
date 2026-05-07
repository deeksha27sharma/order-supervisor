import asyncio

from temporalio.worker import Worker

from app.config import settings
from app.temporal.client import get_temporal_client
from app.temporal.workflows.order_supervisor import OrderSupervisorWorkflow
from app.temporal.activities.agent import run_agent_inference
from app.temporal.activities.classifier import classify_event
from app.temporal.activities.memory import compact_memory
from app.temporal.activities.persistence import save_activity, update_run_state
from app.temporal.activities.business_actions import (
    message_fulfillment_team,
    message_payments_team,
    message_logistics_team,
    message_customer,
    create_internal_note,
)


async def start_worker() -> None:
    client = await get_temporal_client()

    worker = Worker(
        client,
        task_queue=settings.temporal_task_queue,
        workflows=[OrderSupervisorWorkflow],
        activities=[
            run_agent_inference,
            classify_event,
            compact_memory,
            save_activity,
            update_run_state,
            message_fulfillment_team,
            message_payments_team,
            message_logistics_team,
            message_customer,
            create_internal_note,
        ],
    )

    print(f"Worker started on task queue: {settings.temporal_task_queue}")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(start_worker())