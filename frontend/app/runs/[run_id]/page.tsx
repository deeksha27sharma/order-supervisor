"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getRun, getActivities } from "@/lib/api";
import type { Run, Activity } from "@/lib/types";
import RunStatusBadge from "@/components/runs/RunStatusBadge";
import ActivityTimeline from "@/components/runs/ActivityTimeline";
import MemorySummaryPanel from "@/components/runs/MemorySummaryPanel";
import EventInjector from "@/components/runs/EventInjector";
import InstructionAdder from "@/components/runs/InstructionAdder";
import RunControls from "@/components/runs/RunControls";
import FinalSummaryPanel from "@/components/runs/FinalSummaryPanel";

const TABS = [
  { key: "timeline",     label: "Timeline"     },
  { key: "memory",       label: "Memory"       },
  { key: "inject",       label: "Inject Event" },
  { key: "instructions", label: "Instructions" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function RunDetailPage() {
  const { run_id } = useParams<{ run_id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("timeline");

  const refresh = useCallback(async () => {
    const [r, a] = await Promise.all([getRun(run_id), getActivities(run_id)]);
    setRun(r);
    setActivities(a);
  }, [run_id]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  if (!run) return (
    <div style={{ padding: "60px 0", textAlign: "center" }}>
      <div style={{
        width: 20, height: 20, border: "2px solid var(--border-strong)",
        borderTopColor: "var(--text-primary)", borderRadius: "50%",
        animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
      }} />
      <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>Loading run…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const isEnded = ["completed", "terminated", "failed"].includes(run.status);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ color: "var(--text-primary)" }}>{run.order_id}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RunStatusBadge status={run.status} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {run.id.slice(0, 12)}…
            </span>
          </div>
        </div>
        <RunControls runId={run.id} status={run.status} onAction={refresh} />
      </div>

      {/* Final summary */}
      {run.final_summary && (
        <div style={{ marginBottom: 24 }}>
          <FinalSummaryPanel run={run} />
        </div>
      )}

      {/* Active instructions */}
      {run.extra_instructions.length > 0 && (
        <div style={{
          marginBottom: 20, padding: "12px 16px",
          background: "var(--status-moderate-bg)", border: "1px solid var(--status-moderate-text)",
          borderRadius: "var(--radius-md)",
        }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 500, fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--status-moderate-text)", marginBottom: 8,
          }}>
            Active Instructions
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {run.extra_instructions.map((inst, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "var(--status-moderate-text)", fontSize: "0.75rem", flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ fontSize: "0.8rem", color: "var(--status-moderate-text)", lineHeight: 1.5 }}>{inst}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid var(--border)",
        marginBottom: 24,
      }}>
        {TABS.map((t) => {
          const disabled = isEnded && t.key === "inject";
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => !disabled && setActiveTab(t.key)}
              style={{
                padding: "8px 16px",
                fontSize: "0.8rem",
                fontWeight: active ? 500 : 400,
                fontFamily: "var(--font-sans)",
                color: active ? "var(--text-primary)" : disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--text-primary)" : "transparent"}`,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
                transition: "color 0.15s, border-color 0.15s",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "timeline" && <ActivityTimeline activities={activities} />}
        {activeTab === "memory" && <MemorySummaryPanel summary={run.memory_summary} guidance={run.wakeup_guidance} />}
        {activeTab === "inject" && (
          isEnded ? (
            <div style={{
              padding: "40px 32px", textAlign: "center",
              border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-lg)",
            }}>
              <p style={{ fontSize: "0.83rem", color: "var(--text-tertiary)" }}>
                This run has ended — events cannot be injected.
              </p>
            </div>
          ) : (
            <EventInjector runId={run.id} onSent={refresh} />
          )
        )}
        {activeTab === "instructions" && <InstructionAdder runId={run.id} onAdded={refresh} />}
      </div>
    </div>
  );
}