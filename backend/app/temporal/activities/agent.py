import json

from groq import Groq
from temporalio import activity

from app.config import settings

# Maps action name → display label
AVAILABLE_ACTIONS = {
    "message_fulfillment_team": "Message the fulfillment team",
    "message_payments_team": "Message the payments team",
    "message_logistics_team": "Message the logistics team",
    "message_customer": "Message the customer",
    "create_internal_note": "Create an internal note",
}

SYSTEM_PROMPT = """You are an AI order supervisor. Your job is to monitor an order's lifecycle, 
decide when to intervene, take actions, and update your memory.

You will be given:
- The order context
- Your current memory summary  
- Recent timeline events
- Extra instructions from the operator
- Available actions you can take

You must respond with a JSON object (no markdown, no explanation) with this exact structure:
{
  "reasoning": "brief explanation of your thinking",
  "actions": [
    {
      "action": "action_name",
      "message": "the message or note content"
    }
  ],
  "memory_update": "updated compact memory summary (under 300 words)",
  "sleep_seconds": 300,
  "wakeup_guidance": "guidance for the classifier about what events matter next"
}

Rules:
- actions list can be empty if no action is needed
- sleep_seconds must be a positive integer (minimum 60)
- Only use actions from the available_actions list
- Be concise in reasoning and memory_update
- wakeup_guidance helps the classifier decide what future events are important
"""


@activity.defn
async def run_agent_inference(
    run_id: str,
    order_context: dict,
    memory_summary: str | None,
    timeline: list[dict],
    extra_instructions: list[str],
    available_actions: list[str],
    supervisor_base_instruction: str,
    wake_reason: str,
) -> dict:
    """
    Core agent inference. Calls the LLM and returns structured output.

    Returns:
        {
            "reasoning": str,
            "actions": [{"action": str, "message": str}],
            "memory_update": str,
            "sleep_seconds": int,
            "wakeup_guidance": str,
        }
    """
    client = Groq(api_key=settings.groq_api_key)

    # Build available actions description
    actions_desc = "\n".join(
        f"- {name}: {AVAILABLE_ACTIONS[name]}"
        for name in available_actions
        if name in AVAILABLE_ACTIONS
    )

    # Build timeline summary (last 20 entries to stay within context)
    recent_timeline = timeline[-20:] if len(timeline) > 20 else timeline
    timeline_text = json.dumps(recent_timeline, indent=2)

    extra_text = (
        "\n".join(f"- {i}" for i in extra_instructions)
        if extra_instructions
        else "None"
    )

    user_prompt = f"""Supervisor instruction: {supervisor_base_instruction}

Wake reason: {wake_reason}

Order context:
{json.dumps(order_context, indent=2)}

Current memory summary:
{memory_summary or "No prior memory."}

Recent timeline (last 20 entries):
{timeline_text}

Extra operator instructions:
{extra_text}

Available actions:
{actions_desc}

Respond with JSON only."""

    response = client.chat.completions.create(
        model=settings.groq_main_model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=1000,
        temperature=0.2,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback safe response if LLM returns malformed JSON
        result = {
            "reasoning": "Failed to parse LLM response",
            "actions": [],
            "memory_update": memory_summary or "",
            "sleep_seconds": settings.default_wakeup_interval_seconds,
            "wakeup_guidance": "",
        }

    # Enforce minimum sleep
    if result.get("sleep_seconds", 0) < 60:
        result["sleep_seconds"] = 60

    return result