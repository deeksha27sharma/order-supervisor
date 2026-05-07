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

export default function RunDetailPage() {
  const { run_id } = useParams<{ run_id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<"timeline" | "memory" | "inject" | "instructions">("timeline");

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

  if (!run) return <p className="text-gray-500 text-sm">Loading...</p>;


  const isEnded = ["completed", "terminated"].includes(run.status);

  const tabs = [
    { key: "timeline",     label: "Timeline" },
    { key: "memory",       label: "Memory" },
    { key: "inject",       label: "Inject Event" },
    { key: "instructions", label: "Instructions" },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Order: {run.order_id}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Run ID: {run.id}</p>
          <div className="mt-1">
            <RunStatusBadge status={run.status} />
          </div>
        </div>
        <RunControls runId={run.id} status={run.status} onAction={refresh} />
      </div>

      {/* Final summary if completed */}
      {run.final_summary && (
        <div className="mb-6">
          <FinalSummaryPanel run={run} />
        </div>
      )}

      {/* Extra instructions list */}
      {run.extra_instructions.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-xs font-semibold text-yellow-800 mb-1">Active Instructions</p>
          <ul className="text-xs text-yellow-900 space-y-0.5">
            {run.extra_instructions.map((i, idx) => (
              <li key={idx}>• {i}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => !isEnded || t.key !== "inject" ? setActiveTab(t.key) : undefined}
            //visually dim the inject tab on ended runs
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } ${isEnded && t.key === "inject" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "timeline" && <ActivityTimeline activities={activities} />}
        {activeTab === "memory" && (
          <MemorySummaryPanel
            summary={run.memory_summary}
            guidance={run.wakeup_guidance}
          />
        )}
        {/*show disabled state instead of EventInjector on ended runs */}
        {activeTab === "inject" && (
          isEnded ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                This run has ended — events cannot be injected.
              </p>
            </div>
          ) : (
            <EventInjector runId={run.id} onSent={refresh} />
          )
        )}
        {activeTab === "instructions" && (
          <InstructionAdder runId={run.id} onAdded={refresh} />
        )}
      </div>
    </div>
  );
}