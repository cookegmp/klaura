import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kelly Laaura — landscapes and vintage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image — used when a route doesn't supply its own.
 * Brand-matched: bone background, Fraunces-feeling display via the
 * ImageResponse default serif fall-back, ochre accent.
 */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#f4efe6",
          color: "#1a1d24",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#3a3d44",
          }}
        >
          kellylaaura.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 110, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em" }}>
            Kelly
            <span style={{ fontStyle: "italic", color: "#8a5424" }}> Laaura</span>
          </div>
          <div style={{ fontSize: 32, color: "#3a3d44", maxWidth: 800, lineHeight: 1.35 }}>
            Original paintings and one-of-a-kind vintage. Painted slowly, worn long after.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "1px solid #d9d1bf",
            paddingTop: 24,
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Montreal painter
          </div>
          <div style={{ fontSize: 22, fontStyle: "italic", color: "#8a5424" }}>
            currently based in Ohio
          </div>
        </div>
      </div>
    ),
    size
  );
}
