"use client";
import Link from "next/link";
import type { Run } from "@/lib/types";
import { deleteRun } from "@/lib/api";
import RunStatusBadge from "./RunStatusBadge";

export default function RunCard({
  run,
  onDelete,
}: {
  run: Run;
  onDelete: (id: string) => void;
}) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete run ${run.order_id}?`)) return;
    await deleteRun(run.id);
    onDelete(run.id);
  };

  return (
    <Link href={`/runs/${run.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-strong)";
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "0.03em",
            }}
          >
            {run.order_id}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RunStatusBadge status={run.status} />
            <button
              onClick={handleDelete}
              title="Delete run"
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

        {/* Meta row */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-tertiary)", letterSpacing: "0.02em" }}>
            {run.id.slice(0, 8)}…
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            {new Date(run.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Summary */}
        {run.memory_summary && (
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
              paddingTop: 4,
              borderTop: "1px solid var(--border)",
            }}
          >
            {run.memory_summary}
          </p>
        )}
      </div>
    </Link>
  );
}