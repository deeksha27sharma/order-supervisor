"use client";
import { useState } from "react";
import { interruptRun, resumeRun, terminateRun } from "@/lib/api";

export default function RunControls({
  runId,
  status,
  onAction,
}: {
  runId: string;
  status: string;
  onAction: () => void;
}) {
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
      setError("Action failed — the run may have already ended.");
    } finally {
      setLoading("");
    }
  }

  const isActive = !["completed", "terminated", "failed"].includes(status);

  if (!isActive) {
    return <p className="text-sm text-gray-400">This run has ended.</p>;
  }

  return (
    <div className="flex flex-col items-end gap-1">  {/*wrap for error display */}
      <div className="flex gap-2 flex-wrap">
        {status !== "interrupted" ? (
          <button
            onClick={() => handle("interrupt")}
            disabled={!!loading}
            className="bg-yellow-500 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === "interrupt" ? "..." : "Interrupt"}
          </button>
        ) : (
          <button
            onClick={() => handle("resume")}
            disabled={!!loading}
            className="bg-green-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "resume" ? "..." : "Resume"}
          </button>
        )}
        <button
          onClick={() => handle("terminate")}
          disabled={!!loading}
          className="bg-red-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "terminate" ? "..." : "Terminate"}
        </button>
      </div>
      {/* inline error instead of crash */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}