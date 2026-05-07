import type { Activity } from "@/lib/types";

const TYPE_STYLES: Record<string, { dot: string; label: string }> = {
  event:         { dot: "bg-blue-400",   label: "Event"    },
  wake:          { dot: "bg-green-400",  label: "Wake"     },
  sleep:         { dot: "bg-purple-400", label: "Sleep"    },
  action:        { dot: "bg-orange-400", label: "Action"   },
  memory_update: { dot: "bg-teal-400",   label: "Memory"   },
  instruction:   { dot: "bg-yellow-400", label: "Instruction" },
  classifier:    { dot: "bg-gray-400",   label: "Classifier" },
  completion:    { dot: "bg-red-400",    label: "Complete" },
};

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-400">No activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const style = TYPE_STYLES[a.activity_type] || { dot: "bg-gray-300", label: a.activity_type };
        return (
          <div key={a.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${style.dot}`} />
              <div className="w-px flex-1 bg-gray-200 mt-1" />
            </div>
            <div className="pb-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">{style.label}</span>
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-800">{a.title}</p>
              {a.detail && (
                <p className="text-xs text-gray-500 mt-0.5">{a.detail}</p>
              )}
              {a.payload && Object.keys(a.payload).length > 0 && (
                <pre className="text-xs bg-gray-50 border rounded p-2 mt-1 overflow-auto max-h-32">
                  {JSON.stringify(a.payload, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}