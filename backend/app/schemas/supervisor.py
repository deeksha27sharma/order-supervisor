from datetime import datetime

from pydantic import BaseModel


class SupervisorCreate(BaseModel):
    name: str
    base_instruction: str
    available_actions: list[str] = [
        "message_fulfillment_team",
        "message_payments_team",
        "message_logistics_team",
        "message_customer",
        "create_internal_note",
    ]
    wakeup_interval_seconds: int | None = None
    wakeup_aggressiveness: str = "moderate"
    model: str | None = None


class SupervisorResponse(BaseModel):
    id: str
    name: str
    base_instruction: str
    available_actions: list[str]
    wakeup_interval_seconds: int | None
    wakeup_aggressiveness: str
    model: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}