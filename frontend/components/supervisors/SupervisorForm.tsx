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
      setError("Name and base instruction are required");
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
      setError(e instanceof Error ? e.message : "Failed to create supervisor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="e.g. Standard Order Supervisor"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Base Instruction
        </label>
        <textarea
          value={baseInstruction}
          onChange={(e) => setBaseInstruction(e.target.value)}
          rows={5}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Describe how the agent should behave..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Available Actions
        </label>
        <div className="space-y-1">
          {ALL_ACTIONS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actions.includes(a)}
                onChange={() => toggleAction(a)}
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Wake-up Interval (seconds)
        </label>
        <input
          type="number"
          value={wakeupInterval}
          onChange={(e) => setWakeupInterval(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Wake-up Aggressiveness
        </label>
        <select
          value={aggressiveness}
          onChange={(e) => setAggressiveness(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Supervisor"}
      </button>
    </div>
  );
}