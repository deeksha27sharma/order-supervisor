"use client";
import { useState } from "react";
import { addInstruction } from "@/lib/api";

export default function InstructionAdder({
  runId,
  onAdded,
}: {
  runId: string;
  onAdded: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!text.trim()) return;
    setError("");
    setLoading(true);
    try {
      await addInstruction(runId, text.trim());
      setText("");
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add instruction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='e.g. "If shipment is delayed, escalate immediately."'
        rows={3}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleAdd}
        disabled={loading || !text.trim()}
        className="w-full bg-yellow-500 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Instruction"}
      </button>
    </div>
  );
}