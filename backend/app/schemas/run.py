from datetime import datetime

from pydantic import BaseModel


class RunCreate(BaseModel):
    supervisor_id: str
    order_id: str
    order_context: dict = {}


class RunResponse(BaseModel):
    id: str
    supervisor_id: str
    order_id: str
    order_context: dict
    temporal_workflow_id: str | None
    temporal_run_id: str | None
    status: str
    extra_instructions: list[str]
    memory_summary: str | None
    next_wakeup_at: str | None
    wakeup_guidance: str | None
    final_summary: str | None
    final_actions_taken: list | None
    final_learnings: str | None
    final_recommendations: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}


class EventInject(BaseModel):
    event_type: str
    payload: dict = {}


class InstructionAdd(BaseModel):
    instruction: str