/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";
import { cookies } from "next/headers";
import { importMap } from "./admin/importMap.js";
import "./custom.scss";
import { TierIndicator } from "@/components/tier-indicator";
import { getGoogleFontsUrl } from "@/lib/color-scheme-fonts";
import { ColorSchemeName } from "@/components/ui/color-scheme-selector-modal.js";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = async ({ children }: Args) => {
  const cookieStore = await cookies();
  const colorShemeName =
    (cookieStore.get("colorScheme")?.value as ColorSchemeName) || "graphite";
  const googleFontsUrl = getGoogleFontsUrl(colorShemeName);

  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
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
      {children}
      <TierIndicator />
    </RootLayout>
  );
};

export default Layout;
