import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { LEGACY_REDIRECTS } from "./src/lib/site/legacy-redirects";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
          ? new URL(process.env.NEXT_PUBLIC_BETTER_AUTH_URL).hostname
          : "",
      },
      // OAuth provider avatars
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatars
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub avatars
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.discord.com", // Discord avatars
      },
    ],
  },
  reactCompiler: false,
  transpilePackages: [
    "payload-auth",
    "@payloadcms/richtext-lexical",
    "@payloadcms/plugin-ecommerce",
  ],
  // Legacy SaaS surfaces are mapped to consumer-facing destinations in
  // src/lib/site/legacy-redirects.ts so the runtime redirects share a
  // single source of truth with the unit tests that verify the map.
  redirects: async () => LEGACY_REDIRECTS.map((r) => ({ ...r })),
};

export default withPayload(nextConfig);
