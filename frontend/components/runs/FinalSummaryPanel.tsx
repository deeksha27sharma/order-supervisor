import type { Run } from "@/lib/types";

export default function FinalSummaryPanel({ run }: { run: Run }) {
  if (!run.final_summary) return null;

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-green-50">
      <h3 className="font-semibold text-green-800">End-of-Run Report</h3>

      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1">Final Summary</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{run.final_summary}</p>
      </div>

      {run.final_actions_taken && run.final_actions_taken.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Actions Taken</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {run.final_actions_taken.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {run.final_learnings && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Key Learnings</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{run.final_learnings}</p>
        </div>
      )}

      {run.final_recommendations && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Recommendations</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{run.final_recommendations}</p>
        </div>
      )}
    </div>
  );
}