"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupervisors, createRun } from "@/lib/api";
import type { Supervisor } from "@/lib/types";

export default function NewRunPage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorId, setSupervisorId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [contextStr, setContextStr] = useState('{"customer": "Jane Doe", "amount": 99.99, "items": ["Product x1"]}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSupervisors().then((s) => {
      setSupervisors(s);
      if (s.length > 0) setSupervisorId(s[0].id);
    });
  }, []);

  async function handleStart() {
    if (!supervisorId || !orderId.trim()) {
      setError("Supervisor and Order ID are required");
      return;
    }
    let orderContext: Record<string, unknown> = {};
    try {
      orderContext = JSON.parse(contextStr);
    } catch {
      setError("Order context must be valid JSON");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const run = await createRun({
        supervisor_id: supervisorId,
        order_id: orderId.trim(),
        order_context: orderContext,
      });
      router.push(`/runs/${run.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Start New Run</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Supervisor</label>
          <select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. ORD-20240115-001"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Order Context (JSON)
          </label>
          <textarea
            value={contextStr}
            onChange={(e) => setContextStr(e.target.value)}
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleStart}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-6 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start Run"}
        </button>
      </div>
    </div>
  );
}