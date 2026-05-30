import { Suspense } from "react";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandedAuthCard } from "@/components/auth/branded-auth-card";
import { getMessages } from "@/lib/i18n";

// /auth/sign-in - Sign in page
// /auth/sign-up - Sign up page
// /auth/forgot-password - Password reset request
// /auth/reset-password - Password reset form
// /auth/magic-link - Magic link authentication
// /auth/two-factor - Two-factor authentication
// /auth/sign-out - Sign out
// /auth/callback - OAuth callback handler

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const messages = await getMessages("auth");

  return (
    <AuthLayout translations={messages}>
      <Suspense>
        <BrandedAuthCard path={path} translations={messages} />
      </Suspense>
    </AuthLayout>
  );
}
