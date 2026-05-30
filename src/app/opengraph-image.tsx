import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Koffee Kulture — Scan. Sip. Repeat.";
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
          "linear-gradient(135deg, #f2ead0 0%, #e8dfc2 50%, #f2ead0 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#2a2418",
      }}
    >
      {/* Logo — next/image is not supported inside ImageResponse (Satori) */}
      <img
        src={logoUrl.toString()}
        alt="Koffee Kulture Logo"
        width={180}
        height={180}
        style={{
          marginBottom: "28px",
          borderRadius: "32px",
        }}
      />
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#7a8f4f",
        }}
      >
        Koffee Kulture
      </div>
      <div
        style={{
          fontSize: 28,
          marginTop: 12,
          color: "#5a4838",
          letterSpacing: "0.04em",
        }}
      >
        Scan. Sip. Repeat.
      </div>
    </div>,
    {
      ...size,
    },
  );
}
