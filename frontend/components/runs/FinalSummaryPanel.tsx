import type { Run } from "@/lib/types";

export default function FinalSummaryPanel({ run }: { run: Run }) {
  if (!run.final_summary) return null;

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{
        fontSize: "0.7rem", fontWeight: 500, fontFamily: "var(--font-mono)",
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: "var(--status-completed-text)", margin: 0,
      }}>
        {label}
      </p>
      {children}
    </div>
  );

  return (
    <div style={{
      background: "var(--status-completed-bg)", border: "1px solid var(--status-completed-text)",
      borderRadius: "var(--radius-lg)", padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "var(--status-completed-text)", flexShrink: 0,
        }} />
        <h3 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--status-completed-text)", margin: 0 }}>
          End-of-Run Report
        </h3>
      </div>

      <Section label="Final Summary">
        <p style={{ fontSize: "0.83rem", color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
          {run.final_summary}
        </p>
      </Section>

      {run.final_actions_taken && run.final_actions_taken.length > 0 && (
        <Section label="Actions Taken">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {run.final_actions_taken.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "var(--status-completed-text)", fontSize: "0.78rem", marginTop: 2, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {run.final_learnings && (
        <Section label="Key Learnings">
          <p style={{ fontSize: "0.83rem", color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
            {run.final_learnings}
          </p>
        </Section>
      )}

      {run.final_recommendations && (
        <Section label="Recommendations">
          <p style={{ fontSize: "0.83rem", color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
            {run.final_recommendations}
          </p>
        </Section>
      )}
    </div>
  );
}