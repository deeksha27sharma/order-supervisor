import Link from "next/link";
import { getSupervisors } from "@/lib/api";
import SupervisorCard from "@/components/supervisors/SupervisorCard";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  const supervisors = await getSupervisors();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Supervisor Templates</h1>
        <Link
          href="/supervisors/new"
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-700"
        >
          + New Supervisor
        </Link>
      </div>

      {supervisors.length === 0 ? (
        <p className="text-gray-500 text-sm">No supervisors yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {supervisors.map((s) => (
            <SupervisorCard key={s.id} supervisor={s} />
          ))}
        </div>
      )}
    </div>
  );
}