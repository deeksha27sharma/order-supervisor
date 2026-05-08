"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getRuns } from "@/lib/api";
import type { Run } from "@/lib/types";
import RunCard from "@/components/runs/RunCard";

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    getRuns().then(setRuns);
  }, []);

  const handleDelete = (id: string) => {
    setRuns((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Runs</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
            {runs.length} {runs.length === 1 ? "run" : "runs"} total
          </p>
        </div>
        <Link
          href="/runs/new"
          style={{
            fontSize: "0.8rem", fontWeight: 500, color: "#fff",
            background: "var(--accent)", textDecoration: "none",
            padding: "7px 16px", borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", gap: 6,
            letterSpacing: "0.01em", transition: "opacity 0.15s",
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          New Run
        </Link>
      </div>

      {/* Empty state */}
      {runs.length === 0 ? (
        <div style={{ border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-lg)", padding: "48px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 16 }}>No runs yet</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 24 }}>
            Start a run to begin supervising an order lifecycle.
          </p>
          <Link
            href="/runs/new"
            style={{
              fontSize: "0.8rem", fontWeight: 500, color: "#fff",
              background: "var(--accent)", textDecoration: "none",
              padding: "7px 16px", borderRadius: "var(--radius-sm)",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
            Start your first run
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 12 }}>
          {runs.map((r) => (
            <RunCard key={r.id} run={r} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}