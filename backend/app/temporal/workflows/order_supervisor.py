import asyncio
from datetime import timedelta

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from app.config import settings

with workflow.unsafe.imports_passed_through():
    from app.temporal.activities.agent import run_agent_inference
    from app.temporal.activities.business_actions import (
        create_internal_note,
        message_customer,
        message_fulfillment_team,
        message_logistics_team,
        message_payments_team,
    )
    from app.temporal.activities.classifier import classify_event
    from app.temporal.activities.persistence import save_activity, update_run_state

TERMINAL_EVENTS = {"delivered", "refund_requested", "payment_failed"}

ACTION_MAP = {
    "message_fulfillment_team": message_fulfillment_team,
    "message_payments_team": message_payments_team,
    "message_logistics_team": message_logistics_team,
    "message_customer": message_customer,
    "create_internal_note": create_internal_note,
}

ACTIVITY_RETRY = RetryPolicy(maximum_attempts=3, initial_interval=timedelta(seconds=2))
ACTIVITY_TIMEOUT = timedelta(seconds=60)


async def _update_state(run_id: str, **fields) -> None:
    """Helper — passes update_run_state args positionally as a dict."""
    await workflow.execute_activity(
        update_run_state,
        args=[
            run_id,
            fields.get("status"),
            fields.get("memory_summary"),
            fields.get("next_wakeup_at"),
            fields.get("wakeup_guidance"),
            fields.get("final_summary"),
            fields.get("final_actions_taken"),
            fields.get("final_learnings"),
            fields.get("final_recommendations"),
        ],
        start_to_close_timeout=ACTIVITY_TIMEOUT,
        retry_policy=ACTIVITY_RETRY,
    )


@workflow.defn
class OrderSupervisorWorkflow:

    def __init__(self) -> None:
        self._run_id: str = ""
        self._order_context: dict = {}
        self._supervisor_config: dict = {}
        self._memory_summary: str | None = None
        self._timeline: list[dict] = []
        self._extra_instructions: list[str] = []
        self._wakeup_guidance: str | None = None
        self._pending_events: list[dict] = []
        self._pending_instructions: list[str] = []
        self._should_terminate: bool = False
        self._is_interrupted: bool = False
        self._wake_now: bool = False
        self._terminal_event_received: bool = False

    @workflow.signal
    async def order_event(self, event_type: str, payload: dict) -> None:
        self._pending_events.append({"event_type": event_type, "payload": payload})
        if event_type in TERMINAL_EVENTS:
            self._terminal_event_received = True

    @workflow.signal
    async def add_instruction(self, instruction: str) -> None:
        self._pending_instructions.append(instruction)
        self._wake_now = True

    @workflow.signal
    async def interrupt(self) -> None:
        self._is_interrupted = True

    @workflow.signal
    async def resume(self) -> None:
        self._is_interrupted = False
        self._wake_now = True

    @workflow.signal
    async def terminate(self) -> None:
        self._should_terminate = True

    @workflow.run
    async def run(self, run_id: str, order_context: dict, supervisor_config: dict) -> dict:
        self._run_id = run_id
        self._order_context = order_context
        self._supervisor_config = supervisor_config

        start_time = workflow.now()
        max_age = timedelta(seconds=settings.max_workflow_age_seconds)

        await _update_state(run_id, status="running")
        await self._log_activity("wake", "Workflow started", {"reason": "start"})
        await self._run_agent_cycle(wake_reason="workflow_start")

        while not self._should_terminate:
            if workflow.now() - start_time >= max_age:
                await self._log_activity("completion", "Max workflow age reached")
                break

            sleep_seconds = (
                supervisor_config.get("wakeup_interval_seconds")
                or settings.default_wakeup_interval_seconds
            )

            await _update_state(run_id, status="sleeping")
            await self._log_activity("sleep", f"Agent sleeping for {sleep_seconds}s")

            await workflow.wait_condition(
                lambda: (
                    self._wake_now
                    or bool(self._pending_events)
                    or self._should_terminate
                    or self._terminal_event_received
                ),
                timeout=timedelta(seconds=sleep_seconds),
            )

            # Hard stop — no processing needed
            if self._should_terminate:
                break

            # Handle interrupted state before doing anything else
            if self._is_interrupted:
                await _update_state(run_id, status="interrupted")
                await workflow.wait_condition(lambda: not self._is_interrupted)

            self._wake_now = False

            if self._pending_instructions:
                self._extra_instructions.extend(self._pending_instructions)
                self._pending_instructions.clear()

            # Process pending events and add them to timeline BEFORE agent runs
            wake_reason = "scheduled_wakeup"
            if self._pending_events:
                wake_reason = await self._process_pending_events()

            # Always run agent cycle so LLM can react to the event
            # (e.g. message customer on payment_failed) before workflow ends
            await _update_state(run_id, status="running")
            await self._log_activity("wake", f"Agent woke up: {wake_reason}")
            await self._run_agent_cycle(wake_reason=wake_reason)

            # NOW check terminal — agent has already seen and acted on the event
            if self._terminal_event_received:
                break

        await self._run_final_agent(
            reason="terminated" if self._should_terminate else "completed"
        )

        final_status = "terminated" if self._should_terminate else "completed"
        await _update_state(run_id, status=final_status)
        await self._log_activity("completion", f"Workflow {final_status}")

        return {"status": final_status, "run_id": run_id}

    async def _process_pending_events(self) -> str:
        events = list(self._pending_events)
        self._pending_events.clear()
        wake_reason = "scheduled_wakeup"
        aggressiveness = self._supervisor_config.get("wakeup_aggressiveness", "moderate")

        for evt in events:
            event_type = evt["event_type"]
            payload = evt.get("payload", {})

            await self._log_activity("event", f"Event received: {event_type}", payload)

            classification = await workflow.execute_activity(
                classify_event,
                args=[event_type, payload, aggressiveness, self._wakeup_guidance],
                start_to_close_timeout=ACTIVITY_TIMEOUT,
                retry_policy=ACTIVITY_RETRY,
            )

            await self._log_activity(
                "classifier",
                f"Classifier: {'wake' if classification['should_wake'] else 'skip'} for {event_type}",
                classification,
            )

            # Always record event in timeline regardless of classifier decision
            # so the LLM always has full context
            self._timeline.append({
                "type": "event",
                "event_type": event_type,
                "payload": payload,
                "classifier": classification,
            })

            if classification["should_wake"]:
                wake_reason = f"signal:{event_type}"

        return wake_reason

    async def _run_agent_cycle(self, wake_reason: str) -> None:
        agent_result = await workflow.execute_activity(
            run_agent_inference,
            args=[
                self._run_id,
                self._order_context,
                self._memory_summary,
                self._timeline,
                self._extra_instructions,
                self._supervisor_config.get("available_actions", list(ACTION_MAP.keys())),
                self._supervisor_config.get("base_instruction", ""),
                wake_reason,
            ],
            start_to_close_timeout=timedelta(seconds=120),
            retry_policy=ACTIVITY_RETRY,
        )

        self._memory_summary = agent_result.get("memory_update", self._memory_summary)
        self._wakeup_guidance = agent_result.get("wakeup_guidance", self._wakeup_guidance)

        self._timeline.append({
            "type": "agent_reasoning",
            "reasoning": agent_result.get("reasoning", ""),
            "wake_reason": wake_reason,
        })

        await self._log_activity(
            "wake",
            f"Agent reasoning ({wake_reason})",
            {"reasoning": agent_result.get("reasoning", "")},
        )

        for action_item in agent_result.get("actions", []):
            action_name = action_item.get("action")
            message = action_item.get("message", "")
            if action_name in ACTION_MAP:
                await workflow.execute_activity(
                    ACTION_MAP[action_name],
                    args=[self._run_id, message],
                    start_to_close_timeout=ACTIVITY_TIMEOUT,
                    retry_policy=ACTIVITY_RETRY,
                )
                self._timeline.append({
                    "type": "action",
                    "action": action_name,
                    "message": message,
                })

        await _update_state(
            self._run_id,
            memory_summary=self._memory_summary,
            wakeup_guidance=self._wakeup_guidance,
        )

        if len(self._timeline) > 50:
            self._timeline = self._timeline[-50:]

    async def _run_final_agent(self, reason: str) -> None:
        agent_result = await workflow.execute_activity(
            run_agent_inference,
            args=[
                self._run_id,
                self._order_context,
                self._memory_summary,
                self._timeline,
                self._extra_instructions,
                self._supervisor_config.get("available_actions", list(ACTION_MAP.keys())),
                self._supervisor_config.get("base_instruction", ""),
                f"workflow_ending:{reason}",
            ],
            start_to_close_timeout=timedelta(seconds=120),
            retry_policy=ACTIVITY_RETRY,
        )

        await _update_state(
            self._run_id,
            final_summary=agent_result.get("reasoning", ""),
            final_actions_taken=[a.get("action") for a in agent_result.get("actions", [])],
            final_learnings=agent_result.get("memory_update", ""),
            final_recommendations=agent_result.get("wakeup_guidance", ""),
        )

    async def _log_activity(self, activity_type: str, title: str, payload: dict | None = None) -> None:
        await workflow.execute_activity(
            save_activity,
            args=[self._run_id, activity_type, title, None, payload],
            start_to_close_timeout=ACTIVITY_TIMEOUT,
            retry_policy=ACTIVITY_RETRY,
        )