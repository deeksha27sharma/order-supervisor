const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  pending:     { bg: "var(--bg-muted)",                    color: "var(--text-secondary)",        dot: "#9e9b96" },
  running:     { bg: "var(--status-running-bg)",           color: "var(--status-running-text)",   dot: "#185fa5" },
  sleeping:    { bg: "#eeedfe",                            color: "#534ab7",                      dot: "#7f77dd" },
  interrupted: { bg: "var(--status-moderate-bg)",          color: "var(--status-moderate-text)",  dot: "#ba7517" },
  completed:   { bg: "var(--status-completed-bg)",         color: "var(--status-completed-text)", dot: "#3b6d11" },
  terminated:  { bg: "var(--status-terminated-bg)",        color: "var(--status-terminated-text)",dot: "#a32d2d" },
  failed:      { bg: "var(--status-terminated-bg)",        color: "var(--status-terminated-text)",dot: "#a32d2d" },
};

export default function RunStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: "var(--radius-sm)",
        background: cfg.bg,
        fontSize: "0.7rem",
        fontWeight: 500,
        color: cfg.color,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}