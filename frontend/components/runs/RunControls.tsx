"use client";
import { useState } from "react";
import { interruptRun, resumeRun, terminateRun } from "@/lib/api";

export default function RunControls({ runId, status, onAction }: { runId: string; status: string; onAction: () => void }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function handle(action: "interrupt" | "resume" | "terminate") {
    setLoading(action);
    setError("");
    try {
      if (action === "interrupt") await interruptRun(runId);
      if (action === "resume") await resumeRun(runId);
      if (action === "terminate") await terminateRun(runId);
      onAction();
    } catch {
      setError("Action failed — run may have already ended.");
    } finally {
      setLoading("");
    }
  }

  const isActive = !["completed", "terminated", "failed"].includes(status);

  if (!isActive) {
    return (
      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", paddingTop: 4 }}>
        run ended
      </span>
    );
  }

  const btn = (
    label: string,
    action: "interrupt" | "resume" | "terminate",
    style: { bg: string; color: string; border: string }
  ) => (
    <button
      onClick={() => handle(action)}
      disabled={!!loading}
      style={{
        background: style.bg, color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: "var(--radius-sm)", padding: "6px 14px",
        fontSize: "0.78rem", fontWeight: 500, fontFamily: "var(--font-sans)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== action ? 0.5 : 1,
        transition: "opacity 0.15s",
        display: "flex", alignItems: "center", gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {loading === action && (
        <span style={{
          width: 10, height: 10, border: "1.5px solid currentColor",
          borderTopColor: "transparent", borderRadius: "50%",
          display: "inline-block", animation: "spin 0.7s linear infinite",
        }} />
      )}
      {loading === action ? "…" : label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {status !== "interrupted"
          ? btn("Interrupt", "interrupt", { bg: "var(--status-moderate-bg)", color: "var(--status-moderate-text)", border: "var(--status-moderate-text)" })
          : btn("Resume", "resume", { bg: "var(--status-completed-bg)", color: "var(--status-completed-text)", border: "var(--status-completed-text)" })
        }
        {btn("Terminate", "terminate", { bg: "var(--status-terminated-bg)", color: "var(--status-terminated-text)", border: "var(--status-terminated-text)" })}
      </div>
      {error && (
        <p style={{ fontSize: "0.72rem", color: "var(--status-terminated-text)", fontFamily: "var(--font-mono)", margin: 0 }}>
          {error}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}