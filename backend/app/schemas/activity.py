from datetime import datetime

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: str
    run_id: str
    activity_type: str
    title: str
    detail: str | None
    payload: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}