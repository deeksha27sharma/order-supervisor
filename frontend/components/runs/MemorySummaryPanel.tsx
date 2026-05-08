export default function MemorySummaryPanel({
  summary,
  guidance,
}: {
  summary: string | null;
  guidance: string | null;
}) {
  const Block = ({ label, content }: { label: string; content: string | null }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{
        fontSize: "0.72rem", fontWeight: 500, fontFamily: "var(--font-mono)",
        letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)",
        margin: 0,
      }}>
        {label}
      </p>
      {content ? (
        <p style={{
          fontSize: "0.83rem", color: "var(--text-primary)", lineHeight: 1.7,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "12px 14px",
          whiteSpace: "pre-wrap", margin: 0,
        }}>
          {content}
        </p>
      ) : (
        <p style={{
          fontSize: "0.83rem", color: "var(--text-tertiary)", fontStyle: "italic",
          background: "var(--bg-muted)", border: "1px dashed var(--border-strong)",
          borderRadius: "var(--radius-md)", padding: "12px 14px", margin: 0,
        }}>
          Not yet populated.
        </p>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Block label="Memory Summary" content={summary} />
      <Block label="Wake-up Guidance" content={guidance} />
    </div>
  );
}