const STATUS_STYLES: Record<string, string> = {
    pending:     "bg-gray-100 text-gray-700",
    running:     "bg-blue-100 text-blue-700",
    sleeping:    "bg-purple-100 text-purple-700",
    interrupted: "bg-yellow-100 text-yellow-700",
    completed:   "bg-green-100 text-green-700",
    terminated:  "bg-red-100 text-red-700",
    failed:      "bg-red-100 text-red-700",
  };
  
  export default function RunStatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${style}`}>
        {status}
      </span>
    );
  }