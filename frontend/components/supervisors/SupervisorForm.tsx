"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupervisor } from "@/lib/api";

const ALL_ACTIONS = [
  "message_fulfillment_team",
  "message_payments_team",
  "message_logistics_team",
  "message_customer",
  "create_internal_note",
];

const AGGRESSIVENESS_OPTIONS = [
  { value: "conservative", label: "Conservative", desc: "Act only on critical events" },
  { value: "moderate",     label: "Moderate",     desc: "Balanced monitoring cadence" },
  { value: "aggressive",   label: "Aggressive",   desc: "Maximum urgency, escalate fast" },
];

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-mono)",
  letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)", padding: "9px 12px",
  fontSize: "0.85rem", color: "var(--text-primary)", fontFamily: "var(--font-sans)",
};

export default function SupervisorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [baseInstruction, setBaseInstruction] = useState("");
  const [actions, setActions] = useState<string[]>(ALL_ACTIONS);
  const [wakeupInterval, setWakeupInterval] = useState("300");
  const [aggressiveness, setAggressiveness] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleAction(action: string) {
    setActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !baseInstruction.trim()) {
      setError("Name and base instruction are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createSupervisor({
        name: name.trim(),
        base_instruction: baseInstruction.trim(),
        available_actions: actions,
        wakeup_interval_seconds: parseInt(wakeupInterval) || 300,
        wakeup_aggressiveness: aggressiveness,
      });
      router.push("/supervisors");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create supervisor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Standard Order Supervisor"
          style={inputStyle}
        />
      </div>

      {/* Base Instruction */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Base Instruction</label>
        <textarea
          value={baseInstruction}
          onChange={(e) => setBaseInstruction(e.target.value)}
          rows={5}
          placeholder="Describe how the agent should behave..."
          style={{ ...inputStyle, lineHeight: 1.6, resize: "vertical" }}
        />
      </div>

      {/* Available Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={labelStyle}>Available Actions</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ALL_ACTIONS.map((a) => {
            const checked = actions.includes(a);
            return (
              <label
                key={a}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px",
                  background: checked ? "var(--bg-muted)" : "var(--bg-card)",
                  border: `1px solid ${checked ? "var(--border-strong)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
                }}
              >
                {/* Custom checkbox */}
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  background: checked ? "var(--accent)" : "var(--bg-card)",
                  border: `1.5px solid ${checked ? "var(--accent)" : "var(--border-strong)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}>
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAction(a)}
                  style={{ display: "none" }}
                />
                <span style={{
                  fontSize: "0.78rem", fontFamily: "var(--font-mono)",
                  color: checked ? "var(--text-primary)" : "var(--text-secondary)",
                  letterSpacing: "0.02em",
                }}>
                  {a}
                </span>
              </label>
            );
          })}
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", margin: 0 }}>
          {actions.length} of {ALL_ACTIONS.length} actions enabled
        </p>
      </div>

      {/* Wake-up interval + aggressiveness side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Wake interval (s)</label>
          <input
            type="number"
            value={wakeupInterval}
            onChange={(e) => setWakeupInterval(e.target.value)}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Aggressiveness</label>
          <select
            value={aggressiveness}
            onChange={(e) => setAggressiveness(e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6860' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: 36,
              cursor: "pointer",
            }}
          >
            {AGGRESSIVENESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggressiveness description hint */}
      {(() => {
        const opt = AGGRESSIVENESS_OPTIONS.find((o) => o.value === aggressiveness);
        return opt ? (
          <p style={{
            fontSize: "0.75rem", color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)", marginTop: -14,
          }}>
            → {opt.desc}
          </p>
        ) : null;
      })()}

      {/* Error */}
      {error && (
        <div style={{
          padding: "9px 13px", borderRadius: "var(--radius-md)",
          background: "var(--status-terminated-bg)",
          border: "1px solid var(--status-terminated-text)",
          fontSize: "0.78rem", color: "var(--status-terminated-text)",
          fontFamily: "var(--font-mono)",
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "var(--bg-muted)" : "var(--accent)",
            color: loading ? "var(--text-tertiary)" : "#fff",
            border: "1px solid transparent",
            borderRadius: "var(--radius-sm)", padding: "9px 24px",
            fontSize: "0.82rem", fontWeight: 500,
            fontFamily: "var(--font-sans)",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {loading && (
            <span style={{
              width: 11, height: 11, border: "1.5px solid var(--text-tertiary)",
              borderTopColor: "transparent", borderRadius: "50%",
              display: "inline-block", animation: "spin 0.7s linear infinite",
            }} />
          )}
          {loading ? "Creating…" : "Create Supervisor"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}