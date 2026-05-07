import Link from "next/link";
import type { Supervisor } from "@/lib/types";

export default function SupervisorCard({ supervisor }: { supervisor: Supervisor }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{supervisor.name}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {supervisor.wakeup_aggressiveness}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {supervisor.base_instruction}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {supervisor.available_actions.map((a) => (
          <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            {a}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Wake interval: {supervisor.wakeup_interval_seconds ?? "default"}s
      </p>
    </div>
  );
}