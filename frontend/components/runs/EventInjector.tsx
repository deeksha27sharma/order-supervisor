"use client";
import { useState } from "react";
import { injectEvent } from "@/lib/api";

const EVENT_TYPES = [
  "order_created", "payment_confirmed", "payment_failed",
  "shipment_created", "shipment_delayed", "delivered",
  "refund_requested", "customer_message_received", "no_update_for_n_hours",
];

export default function EventInjector({ runId, onSent }: { runId: string; onSent: () => void }) {
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [payloadStr, setPayloadStr] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonValid, setJsonValid] = useState(true);
  const [sent, setSent] = useState(false);

  function handlePayloadChange(val: string) {
    setPayloadStr(val);
    try { JSON.parse(val); setJsonValid(true); } catch { setJsonValid(false); }
  }

  async function handleSend() {
    setError("");
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(payloadStr); } catch {
      setError("Payload must be valid JSON.");
      return;
    }
    setLoading(true);
    try {
      await injectEvent(runId, eventType, payload);
      setSent(true);
      setTimeout(() => setSent(false), 2000);
      onSent();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
      {/* Event type */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
          Event Type
        </label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          style={{
            width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "9px 12px",
            fontSize: "0.83rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6860' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36,
          }}
        >
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Payload */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            Payload
          </label>
          <span style={{
            fontSize: "0.65rem", fontFamily: "var(--font-mono)",
            color: jsonValid ? "var(--status-completed-text)" : "var(--status-terminated-text)",
            background: jsonValid ? "var(--status-completed-bg)" : "var(--status-terminated-bg)",
            padding: "2px 6px", borderRadius: "var(--radius-sm)",
          }}>
            {jsonValid ? "valid json" : "invalid json"}
          </span>
        </div>
        <textarea
          value={payloadStr}
          onChange={(e) => handlePayloadChange(e.target.value)}
          rows={3}
          spellCheck={false}
          style={{
            width: "100%", background: "var(--bg-card)",
            border: `1px solid ${jsonValid ? "var(--border)" : "var(--status-terminated-text)"}`,
            borderRadius: "var(--radius-md)", padding: "9px 12px",
            fontSize: "0.78rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)",
            lineHeight: 1.7, resize: "vertical", transition: "border-color 0.15s",
          }}
        />
      </div>

      {error && (
        <div style={{
          padding: "8px 12px", borderRadius: "var(--radius-md)",
          background: "var(--status-terminated-bg)", border: "1px solid var(--status-terminated-text)",
          fontSize: "0.78rem", color: "var(--status-terminated-text)", fontFamily: "var(--font-mono)",
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={loading || !jsonValid}
        style={{
          background: sent ? "var(--status-completed-bg)" : loading || !jsonValid ? "var(--bg-muted)" : "var(--accent)",
          color: sent ? "var(--status-completed-text)" : loading || !jsonValid ? "var(--text-tertiary)" : "#fff",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)", padding: "9px 20px",
          fontSize: "0.82rem", fontWeight: 500, cursor: loading || !jsonValid ? "not-allowed" : "pointer",
          transition: "background 0.2s, color 0.2s",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "var(--font-sans)",
        }}
      >
        {loading && (
          <span style={{
            width: 11, height: 11, border: "1.5px solid var(--text-tertiary)",
            borderTopColor: "transparent", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.7s linear infinite",
          }} />
        )}
        {sent ? "✓ Sent" : loading ? "Sending…" : "Send Event"}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}