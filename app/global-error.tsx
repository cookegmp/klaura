"use client";

/**
 * Top-level error boundary. Wraps the entire app — used when a layout
 * itself throws. Keeps the brand voice intact even when nothing else is
 * loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          background: "#f4efe6",
          color: "#1a1d24",
          fontFamily: "Georgia, serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "32rem", padding: "2.5rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "0.82rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#3a3d44",
              marginBottom: "1.5rem",
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            The site couldn&apos;t load.
          </h1>
          <p
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#3a3d44",
              marginTop: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Please try again. If this keeps happening, write to hello@kellylaaura.com.
          </p>
          {error.digest && (
            <p
              style={{
                fontStyle: "italic",
                fontSize: "0.78rem",
                color: "rgba(58, 61, 68, 0.7)",
                marginTop: "1.5rem",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "1rem 1.75rem",
              background: "#1a1d24",
              color: "#f4efe6",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: "0.82rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
