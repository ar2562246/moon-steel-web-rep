import { ImageResponse } from "next/og";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Moon Steel Fabricators — commercial stainless steel fabrication in Karachi, Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function resolveLogoPath() {
  const candidates = [
    join(process.cwd(), "public/og-logo.png"),
    join(process.cwd(), "src/app/og-logo.png"),
    join(process.cwd(), "artifacts/moonsteel/public/og-logo.png"),
    join(process.cwd(), "artifacts/moonsteel/src/app/og-logo.png"),
  ];
  const match = candidates.find((path) => existsSync(path));
  if (!match) {
    throw new Error(`OG logo not found. cwd=${process.cwd()}`);
  }
  return match;
}

export default async function OpenGraphImage() {
  const logoBytes = await readFile(resolveLogoPath());
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f1419",
          color: "#f4f6f8",
          padding: "56px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 18,
              backgroundColor: "#ffffff",
            }}
          >
            <img src={logoSrc} width={74} height={79} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Moon Steel Fabricators
            </div>
            <div style={{ fontSize: 20, color: "#8ea0b5" }}>Karachi, Pakistan</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: 980,
            }}
          >
            Engineering-grade stainless steel fabrication
          </div>
          <div style={{ fontSize: 26, color: "#c5d0dc", maxWidth: 860, lineHeight: 1.35 }}>
            Commercial kitchen equipment for hotels, restaurants, hospitals, and industry.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 22,
            color: "#9aabc0",
          }}
        >
          <span>AISI 304 / 316</span>
          <span>Custom fabrication</span>
          <span>moonsteelfab.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "content-type": "image/png",
        "content-disposition": "inline; filename=\"opengraph-image.png\"",
      },
    },
  );
}
