"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav
      style={{
        height: "var(--nav-height)",
        background: "var(--text-primary)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "#ffffff",
          textDecoration: "none",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginRight: "32px",
          flexShrink: 0,
        }}
      >
        Order Supervisor
      </Link>

      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[
          { href: "/supervisors", label: "Supervisors" },
          { href: "/runs", label: "Runs" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#fff";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/runs/new"
        style={{
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "var(--text-primary)",
          background: "#ffffff",
          textDecoration: "none",
          padding: "6px 14px",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      >
        <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
        New Run
      </Link>
    </nav>
  );
}