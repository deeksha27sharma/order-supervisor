"use client";
import type { Supervisor } from "@/lib/types";
import { deleteSupervisor } from "@/lib/api";

const AGGRESSIVENESS_CONFIG: Record<string, { bg: string; color: string }> = {
  moderate:   { bg: "var(--status-moderate-bg)",   color: "var(--status-moderate-text)" },
  aggressive: { bg: "var(--status-aggressive-bg)", color: "var(--status-aggressive-text)" },
  passive:    { bg: "var(--bg-muted)",              color: "var(--text-secondary)" },
};

export default function SupervisorCard({
  supervisor,
  onDelete,
}: {
  supervisor: Supervisor;
  onDelete: (id: string) => void;
}) {
  const agCfg = AGGRESSIVENESS_CONFIG[supervisor.wakeup_aggressiveness] ?? AGGRESSIVENESS_CONFIG.passive;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete supervisor "${supervisor.name}"?`)) return;
    await deleteSupervisor(supervisor.id);
    onDelete(supervisor.id);
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {supervisor.name}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              flexShrink: 0,
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              background: agCfg.bg,
              color: agCfg.color,
              fontSize: "0.7rem",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {supervisor.wakeup_aggressiveness}
          </span>
          <button
            onClick={handleDelete}
            title="Delete supervisor"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              fontSize: "0.85rem",
              padding: "2px 4px",
              borderRadius: "var(--radius-sm)",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Instruction */}
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          margin: 0,
        }}
      >
        {supervisor.base_instruction}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {supervisor.available_actions.map((a) => (
          <span
            key={a}
            style={{
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-muted)",
              color: "var(--text-secondary)",
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
              border: "1px solid var(--border)",
            }}
          >
            {a}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          wake interval
        </span>
        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
          {supervisor.wakeup_interval_seconds ?? "default"}s
        </span>
      </div>
    </div>
  );
}