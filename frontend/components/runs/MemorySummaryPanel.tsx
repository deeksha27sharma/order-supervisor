export default function MemorySummaryPanel({
    summary,
    guidance,
  }: {
    summary: string | null;
    guidance: string | null;
  }) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Memory Summary</h3>
          {summary ? (
            <p className="text-sm text-gray-700 bg-gray-50 border rounded p-3 whitespace-pre-wrap">
              {summary}
            </p>
          ) : (
            <p className="text-sm text-gray-400">No memory yet.</p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Wake-up Guidance</h3>
          {guidance ? (
            <p className="text-sm text-gray-700 bg-gray-50 border rounded p-3 whitespace-pre-wrap">
              {guidance}
            </p>
          ) : (
            <p className="text-sm text-gray-400">No guidance yet.</p>
          )}
        </div>
      </div>
    );
  }