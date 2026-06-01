import { ImageResponse } from "next/og";

export const alt = "Kelly Laura — landscapes and vintage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image. Matches the dark editorial palette: deep
 * charcoal surface, warm cream type, italic Cormorant accent. Hex values are
 * hand-mirrored from app/globals.css because satori does not read tokens.
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
          background: "#0d0d0f",
          color: "#ebe4d6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#a8a094",
            fontFamily: "sans-serif",
          }}
        >
          kellylauraart.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 140,
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
            }}
          >
            <span>Kelly</span>
            <span style={{ fontStyle: "italic", color: "#ebe4d6" }}>&nbsp;Laura</span>
          </div>
          <div style={{ fontSize: 30, color: "#a8a094", maxWidth: 820, lineHeight: 1.35, fontFamily: "sans-serif" }}>
            Original paintings and one-of-a-kind vintage. Painted slowly, worn long after.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "1px solid #2a2a2e",
            paddingTop: 24,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Montreal painter
          </div>
          <div
            style={{
              fontSize: 26,
              fontStyle: "italic",
              color: "#ebe4d6",
              fontFamily: "Georgia, serif",
            }}
          >
            currently based in Ohio
          </div>
        </div>
      </div>
    ),
    size
  );
}
