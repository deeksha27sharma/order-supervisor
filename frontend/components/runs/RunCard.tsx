import Link from "next/link";
import type { Run } from "@/lib/types";
import RunStatusBadge from "./RunStatusBadge";

export default function RunCard({ run }: { run: Run }) {
  return (
    <Link href={`/runs/${run.id}`}>
      <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-sm text-gray-500">Order: {run.order_id}</span>
          <RunStatusBadge status={run.status} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Run ID: {run.id.slice(0, 8)}...
        </p>
        <p className="text-xs text-gray-400">
          Started: {new Date(run.created_at).toLocaleString()}
        </p>
        {run.memory_summary && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{run.memory_summary}</p>
        )}
      </div>
    </Link>
  );
}