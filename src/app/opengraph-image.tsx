import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SaaSTARTER - Ship Your SaaS in Days, Not Months";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Fetch the logo
  const logoUrl = new URL(
    "/logo/main/pwa-512x512.png",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Logo — next/image is not supported inside ImageResponse (Satori) */}
      <img
        src={logoUrl.toString()}
        alt="SaaSTARTER Logo"
        width={200}
        height={200}
        style={{
          marginBottom: "40px",
        }}
      />
    </div>,
    {
      ...size,
    },
  );
}
