"use client";

import Link from "@/components/Link/customLink";
import type authEn from "@/messages/auth/en";

interface AuthLayoutProps {
  children: React.ReactNode;
  translations: typeof authEn;
}

export function AuthLayout({ children, translations }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left Panel - Big Typography */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12 text-background">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="font-serif text-lg font-semibold tracking-tight">
            SaaSTARTER
          </span>
        </Link>

        <div>
          <h1 className="font-serif text-[clamp(2.5rem,4vw,4rem)] font-bold leading-none tracking-tight">
            {translations.layoutHeading1}
            <br />
            <span className="text-background/40">
              {translations.layoutHeading2}
            </span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/50">
            {translations.layoutDescription}
          </p>
        </div>

        <p className="text-xs text-background/30">
          &copy; {new Date().getFullYear()} SaaSTARTER
        </p>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="relative w-full lg:w-1/2">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight text-foreground"
          >
            SaaSTARTER
          </Link>
        </div>

        <div className="flex min-h-screen items-center justify-center px-4 py-20 lg:py-12">
          <div className="w-full max-w-100">{children}</div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-muted-foreground">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            {translations.privacyLink}
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            {translations.termsLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
