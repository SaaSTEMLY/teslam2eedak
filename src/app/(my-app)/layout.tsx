import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TierIndicator } from "@/components/tier-indicator";
import { CartDrawerWrapper } from "@/components/cart/cart-drawer-wrapper";
import { baseMetadata } from "@/lib/seo";
import { getMessages } from "@/lib/i18n";
import { isGoogleAuthEnabled } from "@/lib/auth/options";
import { getGoogleFontsUrl } from "@/lib/color-scheme-fonts";
import { ColorSchemeName } from "@/components/ui/color-scheme-selector-modal";

export const metadata: Metadata = baseMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const darkMode = cookieStore.get("payload-theme")?.value;
  const locale = cookieStore.get("locale")?.value ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const headerMessages = await getMessages("header");
  const authUiMessages = await getMessages("auth-ui");
  const searchMessages = await getMessages("search");
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
          <Header
            hasSession={cookieStore.has("better-auth.session_token")}
            darkMode={darkMode}
            locale={locale}
            messages={headerMessages}
            searchMessages={searchMessages}
          />
          {children}
          <Footer />
          <TierIndicator />
          <CartDrawerWrapper />
        </Providers>
      </body>
    </html>
  );
}
