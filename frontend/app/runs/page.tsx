import Link from "next/link";
import { getRuns } from "@/lib/api";
import RunCard from "@/components/runs/RunCard";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const runs = await getRuns();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Runs</h1>
        <Link
          href="/runs/new"
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-700"
        >
          + New Run
        </Link>
      </div>

      {runs.length === 0 ? (
        <p className="text-gray-500 text-sm">No runs yet. Start one to begin supervising an order.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {runs.map((r) => (
            <RunCard key={r.id} run={r} />
          ))}
        </div>
      )}
    </div>
  );
}