import Link from "next/link";
import { getSupervisors } from "@/lib/api";
import SupervisorCard from "@/components/supervisors/SupervisorCard";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  const supervisors = await getSupervisors();

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ color: "var(--text-primary)", marginBottom: 4 }}>Supervisor Templates</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
            {supervisors.length} {supervisors.length === 1 ? "template" : "templates"} configured
          </p>
        </div>

        <Link
          href="/supervisors/new"
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#fff",
            background: "var(--accent)",
            textDecoration: "none",
            padding: "7px 16px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            letterSpacing: "0.01em",
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
          New Supervisor
        </Link>
      </div>

      {/* Empty state */}
      {supervisors.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 8 }}>
            No supervisor templates yet
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 24 }}>
            Create a template to define how the AI monitors your orders.
          </p>
          <Link
            href="/supervisors/new"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#fff",
              background: "var(--accent)",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: "var(--radius-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
            Create first template
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
            gap: 12,
          }}
        >
          {supervisors.map((s) => (
            <SupervisorCard key={s.id} supervisor={s} />
          ))}
        </div>
      )}
    </div>
  );
}