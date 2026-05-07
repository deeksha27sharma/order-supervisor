"""
Seeds two default supervisor templates into the database.
Run from the backend/ folder:
    python scripts/seed_supervisors.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.supervisor import Supervisor


TEMPLATES = [
    {
        "name": "Standard Order Supervisor",
        "base_instruction": (
            "You are monitoring an e-commerce order from placement to delivery. "
            "Your goals are: ensure payment is confirmed promptly, track shipment progress, "
            "proactively communicate delays to the customer, escalate payment failures to the "
            "payments team immediately, and notify logistics of any shipment issues. "
            "Be proactive but not spammy — only message teams when genuinely needed."
        ),
        "available_actions": [
            "message_fulfillment_team",
            "message_payments_team",
            "message_logistics_team",
            "message_customer",
            "create_internal_note",
        ],
        "wakeup_interval_seconds": 300,
        "wakeup_aggressiveness": "moderate",
        "model": None,
    },
    {
        "name": "High Priority Order Supervisor",
        "base_instruction": (
            "You are monitoring a high-priority or large-value order. "
            "Apply maximum urgency: escalate any delay or issue immediately, "
            "message the customer proactively on every status change, "
            "alert the fulfillment team as soon as the order is confirmed, "
            "and create internal notes for every significant event. "
            "Speed and transparency are the top priorities."
        ),
        "available_actions": [
            "message_fulfillment_team",
            "message_payments_team",
            "message_logistics_team",
            "message_customer",
            "create_internal_note",
        ],
        "wakeup_interval_seconds": 120,
        "wakeup_aggressiveness": "aggressive",
        "model": None,
    },
]


def seed():
    db = SessionLocal()
    try:
        for template in TEMPLATES:
            existing = (
                db.query(Supervisor)
                .filter(Supervisor.name == template["name"])
                .first()
            )
            if existing:
                print(f"  Skipping '{template['name']}' — already exists")
                continue

            supervisor = Supervisor(**template)
            db.add(supervisor)
            db.commit()
            db.refresh(supervisor)
            print(f"  Created '{supervisor.name}' (id: {supervisor.id})")

        print("Seeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()