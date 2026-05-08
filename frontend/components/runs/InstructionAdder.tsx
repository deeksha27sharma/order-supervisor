"use client";
import { useState } from "react";
import { addInstruction } from "@/lib/api";

export default function InstructionAdder({ runId, onAdded }: { runId: string; onAdded: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    if (!text.trim()) return;
    setError("");
    setLoading(true);
    try {
      await addInstruction(runId, text.trim());
      setText("");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add instruction.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
          New Instruction
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "If shipment is delayed, escalate immediately."'
          rows={3}
          style={{
            width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: "10px 12px",
            fontSize: "0.83rem", color: "var(--text-primary)", fontFamily: "var(--font-sans)",
            lineHeight: 1.6, resize: "vertical",
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
        onClick={handleAdd}
        disabled={loading || !text.trim()}
        style={{
          background: added ? "var(--status-completed-bg)" : loading || !text.trim() ? "var(--bg-muted)" : "var(--accent)",
          color: added ? "var(--status-completed-text)" : loading || !text.trim() ? "var(--text-tertiary)" : "#fff",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)", padding: "9px 20px",
          fontSize: "0.82rem", fontWeight: 500,
          cursor: loading || !text.trim() ? "not-allowed" : "pointer",
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
        {added ? "✓ Added" : loading ? "Adding…" : "Add Instruction"}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}