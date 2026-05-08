"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupervisors, createRun } from "@/lib/api";
import type { Supervisor } from "@/lib/types";

export default function NewRunPage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorId, setSupervisorId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [contextStr, setContextStr] = useState(
    '{\n  "customer": "Jane Doe",\n  "amount": 99.99,\n  "items": ["Product x1"]\n}'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonValid, setJsonValid] = useState(true);

  useEffect(() => {
    getSupervisors().then((s) => {
      setSupervisors(s);
      if (s.length > 0) setSupervisorId(s[0].id);
    });
  }, []);

  function handleContextChange(val: string) {
    setContextStr(val);
    try { JSON.parse(val); setJsonValid(true); } catch { setJsonValid(false); }
  }

  async function handleStart() {
    if (!supervisorId || !orderId.trim()) {
      setError("Supervisor and Order ID are required.");
      return;
    }
    let orderContext: Record<string, unknown> = {};
    try {
      orderContext = JSON.parse(contextStr);
    } catch {
      setError("Order context must be valid JSON.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const run = await createRun({
        supervisor_id: supervisorId,
        order_id: orderId.trim(),
        order_context: orderContext,
      });
      router.push(`/runs/${run.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start run.");
    } finally {
      setLoading(false);
    }
  }

  const selectedSupervisor = supervisors.find((s) => s.id === supervisorId);

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: 6 }}>Start New Run</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
          Configure a supervisor and order to begin lifecycle monitoring.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Supervisor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Supervisor
          </label>
          <select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "9px 12px",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6860' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: 36,
              cursor: "pointer",
            }}
          >
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Supervisor preview pill */}
          {selectedSupervisor && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 2 }}>
              <span style={{
                fontSize: "0.7rem",
                fontFamily: "var(--font-mono)",
                padding: "2px 7px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-muted)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}>
                {selectedSupervisor.wakeup_aggressiveness}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                {selectedSupervisor.wakeup_interval_seconds ?? "default"}s interval
              </span>
            </div>
          )}
        </div>

        {/* Order ID */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Order ID
          </label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-20240115-001"
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "9px 12px",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
          />
        </div>

        {/* Order Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Order Context
            </label>
            <span style={{
              fontSize: "0.68rem",
              fontFamily: "var(--font-mono)",
              color: jsonValid ? "var(--status-completed-text)" : "var(--status-terminated-text)",
              background: jsonValid ? "var(--status-completed-bg)" : "var(--status-terminated-bg)",
              padding: "2px 7px",
              borderRadius: "var(--radius-sm)",
            }}>
              {jsonValid ? "valid json" : "invalid json"}
            </span>
          </div>
          <textarea
            value={contextStr}
            onChange={(e) => handleContextChange(e.target.value)}
            rows={6}
            spellCheck={false}
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: `1px solid ${jsonValid ? "var(--border)" : "var(--status-terminated-text)"}`,
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              fontSize: "0.78rem",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              lineHeight: 1.7,
              resize: "vertical",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--status-terminated-bg)",
            border: "1px solid var(--status-terminated-text)",
            fontSize: "0.8rem",
            color: "var(--status-terminated-text)",
            fontFamily: "var(--font-mono)",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ paddingTop: 4 }}>
          <button
            onClick={handleStart}
            disabled={loading || !jsonValid}
            style={{
              background: loading || !jsonValid ? "var(--bg-muted)" : "var(--accent)",
              color: loading || !jsonValid ? "var(--text-tertiary)" : "#fff",
              border: "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              padding: "9px 24px",
              fontSize: "0.82rem",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              cursor: loading || !jsonValid ? "not-allowed" : "pointer",
              transition: "opacity 0.15s, background 0.15s",
              letterSpacing: "0.01em",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading && (
              <span style={{
                width: 12,
                height: 12,
                border: "1.5px solid var(--text-tertiary)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
            )}
            {loading ? "Starting…" : "Start Run"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}