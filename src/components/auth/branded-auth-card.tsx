"use client";

import { AuthView, useAuthenticate } from "@daveyplate/better-auth-ui";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface BrandedAuthCardProps {
  path: string;
  translations: {
    signInTitle: string;
    signInDescription: string;
    signUpTitle: string;
    signUpDescription: string;
    forgotPasswordTitle: string;
    forgotPasswordDescription: string;
    resetPasswordTitle: string;
    resetPasswordDescription: string;
    magicLinkTitle: string;
    magicLinkDescription: string;
    twoFactorTitle: string;
    twoFactorDescription: string;
    defaultTitle: string;
    defaultDescription: string;
    redirecting: string;
    loading: string;
  };
}

const PROTECTED_FROM_AUTH = [
  "sign-in",
  "sign-up",
  "magic-link",
  "forgot-password",
];

export function BrandedAuthCard({
  path,
  translations: t,
}: BrandedAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useAuthenticate({ enabled: false });

  // Redirect back to the page the user came from (e.g. checkout → sign-in → checkout)
  const redirectTo = searchParams.get("redirectTo") || undefined;

  const getViewInfo = () => {
    switch (path) {
      case "sign-in":
        return { title: t.signInTitle, description: t.signInDescription };
      case "sign-up":
        return { title: t.signUpTitle, description: t.signUpDescription };
      case "forgot-password":
        return {
          title: t.forgotPasswordTitle,
          description: t.forgotPasswordDescription,
        };
      case "reset-password":
        return {
          title: t.resetPasswordTitle,
          description: t.resetPasswordDescription,
        };
      case "magic-link":
        return { title: t.magicLinkTitle, description: t.magicLinkDescription };
      case "two-factor":
        return { title: t.twoFactorTitle, description: t.twoFactorDescription };
      default:
        return { title: t.defaultTitle, description: t.defaultDescription };
    }
  };

  const viewInfo = getViewInfo();

  useEffect(() => {
    if (!isPending && session && PROTECTED_FROM_AUTH.includes(path)) {
      router.replace(redirectTo || "/");
    }
  }, [session, isPending, path, router, redirectTo]);

  useEffect(() => {
    const wrapper = document.querySelector(".auth-card-wrapper");
    if (!wrapper) return;

    const passwordInputs = wrapper.querySelectorAll('input[type="password"]');
    passwordInputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement;
      const name = htmlInput.name?.toLowerCase() || "";
      const placeholder = htmlInput.placeholder?.toLowerCase() || "";

      if (path === "sign-in") {
        htmlInput.setAttribute("autocomplete", "current-password");
      } else if (path === "sign-up" || path === "reset-password") {
        htmlInput.setAttribute("autocomplete", "new-password");
      } else if (name.includes("confirm") || placeholder.includes("confirm")) {
        htmlInput.setAttribute("autocomplete", "new-password");
      }
    });
  }, [path]);

  if (isPending || (session && PROTECTED_FROM_AUTH.includes(path))) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {session ? t.redirecting : t.loading}
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card-wrapper">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          {viewInfo.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {viewInfo.description}
        </p>
      </div>

      <AuthView
        path={path}
        redirectTo={redirectTo}
        socialLayout="vertical"
        classNames={{
          base: "border-0 shadow-none bg-transparent p-0",
          content: "p-0 space-y-4",
          header: "hidden",
          title: "hidden",
          description: "hidden",
          footer: "p-0 pt-4",
          footerLink:
            "text-foreground font-medium hover:text-muted-foreground transition-colors cursor-pointer",
          separator: "my-6",
          continueWith:
            "text-muted-foreground text-xs uppercase tracking-wider",
          form: {
            base: "space-y-4",
            input:
              "h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-colors",
            label: "text-sm font-medium text-foreground/80 mb-1.5",
            primaryButton:
              "h-11 w-full rounded-lg font-semibold text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors",
            secondaryButton:
              "h-11 w-full rounded-lg font-medium text-sm border-border bg-background hover:bg-muted transition-colors",
            outlineButton:
              "h-11 w-full rounded-lg font-medium text-sm border-border bg-background hover:bg-muted transition-colors",
            providerButton:
              "h-11 w-full rounded-lg font-medium text-sm border-border bg-background hover:bg-muted transition-colors",
            error:
              "text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3",
            forgotPasswordLink:
              "text-sm text-muted-foreground hover:text-foreground transition-colors",
            button: "cursor-pointer",
          },
        }}
      />
    </div>
  );
}
