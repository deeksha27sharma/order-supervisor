import json

from groq import Groq
from temporalio import activity

from app.config import settings


@activity.defn
async def compact_memory(
    current_summary: str | None,
    recent_events: list[dict],
    recent_actions: list[dict],
    order_context: dict,
) -> str:
    """
    Produces a new compact memory summary by asking the LLM to merge
    the current summary with recent events and actions.
    Keeps the output short (< 400 words) to control context size.
    """
    client = Groq(api_key=settings.groq_api_key)

    recent_text = json.dumps(
        {"recent_events": recent_events, "recent_actions": recent_actions},
        indent=2,
    )

    current_text = current_summary or "No prior summary."

    prompt = f"""You are a memory compactor for an AI order supervisor.

Order context:
{json.dumps(order_context, indent=2)}

Current memory summary:
{current_text}

Recent activity (events + actions):
{recent_text}

Task: Produce a new compact memory summary that:
- Merges the current summary with the recent activity
- Keeps only the most important facts
- Is under 300 words
- Uses plain prose, no bullet points
- Focuses on: order status, issues encountered, actions taken, what to watch for next

Respond with ONLY the new summary text, nothing else."""

    response = client.chat.completions.create(
        model=settings.groq_main_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()