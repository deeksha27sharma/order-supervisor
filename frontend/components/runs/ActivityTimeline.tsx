import type { Activity } from "@/lib/types";

const TYPE_CONFIG: Record<string, { dot: string; bg: string; color: string; label: string }> = {
  event:         { dot: "#378add", bg: "var(--status-running-bg)",    color: "var(--status-running-text)",   label: "Event"       },
  wake:          { dot: "#3b6d11", bg: "var(--status-completed-bg)",  color: "var(--status-completed-text)", label: "Wake"        },
  sleep:         { dot: "#7f77dd", bg: "#eeedfe",                     color: "#534ab7",                      label: "Sleep"       },
  action:        { dot: "#ba7517", bg: "var(--status-moderate-bg)",   color: "var(--status-moderate-text)",  label: "Action"      },
  memory_update: { dot: "#0f6e56", bg: "#e1f5ee",                     color: "#0f6e56",                      label: "Memory"      },
  instruction:   { dot: "#854f0b", bg: "var(--status-moderate-bg)",   color: "var(--status-moderate-text)",  label: "Instruction" },
  classifier:    { dot: "#5f5e5a", bg: "var(--bg-muted)",             color: "var(--text-secondary)",        label: "Classifier"  },
  completion:    { dot: "#a32d2d", bg: "var(--status-terminated-bg)", color: "var(--status-terminated-text)",label: "Complete"    },
};

const FALLBACK = { dot: "#9e9b96", bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "" };

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>No activity yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {activities.map((a, idx) => {
        const cfg = TYPE_CONFIG[a.activity_type] ?? { ...FALLBACK, label: a.activity_type };
        const isLast = idx === activities.length - 1;
        return (
          <div key={a.id} style={{ display: "flex", gap: 14 }}>
            {/* Timeline spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 16 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: cfg.dot, marginTop: 14, flexShrink: 0,
              }} />
              {!isLast && <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 4 }} />}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20, paddingTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 500, fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "2px 6px", borderRadius: "var(--radius-sm)",
                  background: cfg.bg, color: cfg.color,
                }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {new Date(a.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
                {a.title}
              </p>

              {a.detail && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "3px 0 0", lineHeight: 1.5 }}>
                  {a.detail}
                </p>
              )}

              {a.payload && Object.keys(a.payload).length > 0 && (
                <pre style={{
                  fontSize: "0.72rem", fontFamily: "var(--font-mono)",
                  background: "var(--bg-muted)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "8px 10px",
                  marginTop: 8, overflowX: "auto", maxHeight: 120,
                  color: "var(--text-secondary)", lineHeight: 1.6,
                }}>
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