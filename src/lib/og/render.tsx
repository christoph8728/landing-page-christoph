import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

async function loadFonts() {
  const fontsDir = join(process.cwd(), "src/lib/og/fonts");
  const [outfitBold, outfitSemiBold, ibmPlexMono] = await Promise.all([
    readFile(join(fontsDir, "Outfit-Bold.ttf")),
    readFile(join(fontsDir, "Outfit-SemiBold.ttf")),
    readFile(join(fontsDir, "IBMPlexMono-Regular.ttf")),
  ]);
  return [
    { name: "Outfit Bold", data: outfitBold, weight: 700 as const, style: "normal" as const },
    { name: "Outfit SemiBold", data: outfitSemiBold, weight: 600 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: ibmPlexMono, weight: 400 as const, style: "normal" as const },
  ];
}

export async function renderOg({
  title,
  tags = [],
  domain = "christophhollauer.de",
}: {
  title: string;
  tags?: string[];
  domain?: string;
}) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F7F6F3",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#9F580A",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "48px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "4px",
            height: "55%",
            backgroundColor: "#115E59",
            borderRadius: "2px",
          }}
        />
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{ position: "absolute", right: "40px", top: "35%", opacity: 0.06 }}
        >
          <circle cx="60" cy="60" r="50" fill="none" stroke="#115E59" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="30" fill="none" stroke="#115E59" strokeWidth="1.5" />
          <circle cx="40" cy="50" r="20" fill="none" stroke="#9F580A" strokeWidth="1.5" />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 70px",
            height: "100%",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "3px",
              color: "#115E59",
              textTransform: "uppercase",
              marginBottom: "20px",
              fontFamily: "Outfit SemiBold",
            }}
          >
            CHRISTOPH · CLOUDSTAGE
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 700,
              color: "#1a1a1a",
              lineHeight: 1.2,
              marginBottom: "24px",
              maxWidth: "85%",
              fontFamily: "Outfit Bold",
            }}
          >
            {title}
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#9F580A",
                    border: "1.2px solid #9F580A",
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontFamily: "Outfit SemiBold",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "48px",
            fontFamily: "IBM Plex Mono",
            fontSize: "11px",
            color: "#aaa",
          }}
        >
          {domain}
        </div>
      </div>
    ),
    { ...ogSize, fonts }
  );
}
