import { getConfig } from "@/lib/config";

export default function NotFound() {
  const config = getConfig();

  return (
    <main className="s" style={{ textAlign: "center", paddingTop: "8rem" }}>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          marginBottom: "0.75rem",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "0.95rem",
          color: "var(--color-text-mid)",
          marginBottom: "1.5rem",
        }}
      >
        This page doesn't exist.
      </p>
      <a
        href="/"
        className="btn"
        style={{
          display: "inline-block",
          textDecoration: "none",
        }}
      >
        ← Back to home
      </a>
    </main>
  );
}
