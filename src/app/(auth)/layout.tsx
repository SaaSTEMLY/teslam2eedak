import type { Metadata } from "next";
import "../(my-app)/globals.css";
import { Providers } from "../(my-app)/providers";
import { cookies } from "next/headers";
import { getMessages } from "@/lib/i18n";
import { isGoogleAuthEnabled } from "@/lib/auth/options";
import { TierIndicator } from "@/components/tier-indicator";
import { generatePageMetadata } from "@/lib/seo";
import { getGoogleFontsUrl } from "@/lib/color-scheme-fonts";
import { ColorSchemeName } from "@/components/ui/color-scheme-selector-modal";

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages("auth");

  return generatePageMetadata({
    title: messages.metaTitle,
    description: messages.metaDescription,
    path: "/auth",
    noIndex: true, // Auth pages shouldn't be indexed
  });
}

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const darkMode = cookieStore.get("payload-theme")?.value;
  const authUiMessages = await getMessages("auth-ui");
  const googleEnabled = isGoogleAuthEnabled();

  const colorShemeName =
    (cookieStore.get("colorScheme")?.value as ColorSchemeName) || "graphite";
  const googleFontsUrl = getGoogleFontsUrl(colorShemeName);

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={darkMode === "dark" ? "dark" : "light"}
      suppressHydrationWarning
    >
      <head>
        {googleFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={googleFontsUrl} />
          </>
        )}
        <link rel="stylesheet" href={`/colorSchemes/${colorShemeName}.css`} />
      </head>
      <body className="font-sans antialiased">
        <Providers
          locale={locale}
          authUiLocalization={authUiMessages}
          googleEnabled={googleEnabled}
        >
          {children}
          <TierIndicator />
        </Providers>
      </body>
    </html>
  );
}
