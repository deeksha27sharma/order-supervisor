"use client";
import { useState } from "react";
import { injectEvent } from "@/lib/api";

const EVENT_TYPES = [
  "order_created",
  "payment_confirmed",
  "payment_failed",
  "shipment_created",
  "shipment_delayed",
  "delivered",
  "refund_requested",
  "customer_message_received",
  "no_update_for_n_hours",
];

export default function EventInjector({
  runId,
  onSent,
}: {
  runId: string;
  onSent: () => void;
}) {
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [payloadStr, setPayloadStr] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      setError("Payload must be valid JSON");
      return;
    }
    setLoading(true);
    try {
      await injectEvent(runId, eventType, payload);
      onSent();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Event Type</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Payload (JSON)
        </label>
        <textarea
          value={payloadStr}
          onChange={(e) => setPayloadStr(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm font-mono"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Event"}
      </button>
    </div>
  );
}