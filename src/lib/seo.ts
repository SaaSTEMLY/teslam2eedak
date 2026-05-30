import type { Metadata } from "next";

export const SITE_NAME = "Koffee Kulture";

export const SITE_DESCRIPTION =
  "Sip into the Kulture. Scan the table QR or order ahead — house-roasted koffee, all-day breakfast, and the bagels Kairo whispers about. Maadi, Egypt.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

export const TWITTER_HANDLE = "@koffeekulture";

// Base metadata configuration shared across all layouts
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Scan. Sip. Repeat.`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo/main/favicon.ico", sizes: "48x48" },
      { url: "/logo/main/pwa-64x64.png", sizes: "64x64", type: "image/png" },
      {
        url: "/logo/main/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/logo/main/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logo/main/apple-touch-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Scan. Sip. Repeat.`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/logo/main/pwa-512x512.png",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — Scan. Sip. Repeat.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: `${SITE_NAME} — Scan. Sip. Repeat.`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo/main/pwa-512x512.png",
        width: 512,
        height: 512,
        alt: `${SITE_NAME} — Scan. Sip. Repeat.`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "og:locale": "en_US",
    "og:site_name": SITE_NAME,
  },
};

// Helper function to generate page-specific metadata
// Merges with baseMetadata to inherit icons, manifest, etc.
export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    ...baseMetadata,
    title,
    description: description || SITE_DESCRIPTION,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description: description || SITE_DESCRIPTION,
      url,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description: description || SITE_DESCRIPTION,
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
