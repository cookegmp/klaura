import { ImageResponse } from "next/og";

export const alt = "Kelly Laura — landscapes and vintage";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image. Brand-matched: bone background, ochre italic
 * accent, generous Fraunces-feeling serif via Georgia fall-back.
 *
 * Note: Fraunces variable TTF was tried here but `next/og`'s satori renderer
 * has known issues with multi-axis variable fonts (opsz + SOFT + wght +
 * WONK). Static Fraunces cuts aren't published as TTF (only WOFF/WOFF2).
 * Georgia is the closest stock serif with good optical sizing; OG images
 * are small, viewed at thumbnail size on social, so the trade-off is fine.
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
              letterSpacing: "-0.03em",
            }}
          >
            <span>Kelly</span>
            <span style={{ fontStyle: "italic", color: "#8a5424" }}>&nbsp;Laura</span>
          </div>
          <div style={{ fontSize: 30, color: "#3a3d44", maxWidth: 820, lineHeight: 1.35, fontFamily: "sans-serif" }}>
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
              color: "#8a5424",
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
