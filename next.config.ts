import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

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
};

export default withPayload(nextConfig);
