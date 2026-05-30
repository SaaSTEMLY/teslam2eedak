"use client";

import { Suspense } from "react";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "@/components/Link/customLink";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  EcommerceProvider,
  USD,
} from "@payloadcms/plugin-ecommerce/client/react";
import { stripeAdapterClient } from "@payloadcms/plugin-ecommerce/payments/stripe";
import { CartDrawerProvider } from "@/contexts/cart-drawer-context";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/navigation-progress";
import { SmoothScroll } from "@/components/smooth-scroll";
import type authUiEn from "@/messages/auth-ui/en";

const stripeClient = stripeAdapterClient({
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
});

// Wrap useSession to inject createdAt (payload-auth strips it from the response,
// which breaks better-auth-ui's freshness check for delete account / passkeys)
function useSessionWithCreatedAt() {
  const result = authClient.useSession();
  if (result.data?.session && !result.data.session.createdAt) {
    result.data.session.createdAt = new Date();
  }
  return result;
}

// Custom toast handler for better-auth-ui
const renderToast = ({
  variant,
  message,
}: {
  variant?: "default" | "success" | "error" | "info" | "warning";
  message?: string;
}) => {
  if (!message) return;

  switch (variant) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    case "info":
      toast.info(message);
      break;
    default:
      toast(message);
  }
};

/** Wraps the custom Link so sign-out navigations carry the current path as redirectTo */
function AuthLink(props: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();

  if (typeof props.href === "string" && props.href.endsWith("/sign-out")) {
    return (
      <Link
        {...props}
        href={`${props.href}?redirectTo=${encodeURIComponent(pathname)}`}
      />
    );
  }

  return <Link {...props} />;
}

export function Providers({
  children,
  authUiLocalization,
  googleEnabled = false,
}: {
  children: React.ReactNode;
  locale?: string;
  authUiLocalization?: typeof authUiEn;
  googleEnabled?: boolean;
}) {
  const socialProviders = googleEnabled ? ["google"] : [];
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={AuthLink}
      toast={renderToast}
      emailVerification
      credentials={{
        confirmPassword: true,
        forgotPassword: true,
        rememberMe: true,
      }}
      signUp={{
        fields: ["name"],
      }}
      account={{
        basePath: "/account",
        fields: ["image", "name"],
      }}
      changeEmail
      deleteUser={{ verification: true }}
      hooks={{ useSession: useSessionWithCreatedAt }}
      passkey
      {...(socialProviders.length > 0 && {
        social: { providers: socialProviders as ["google"] },
      })}
      {...(authUiLocalization && { localization: authUiLocalization })}
    >
      <EcommerceProvider
        customersSlug="users"
        paymentMethods={[stripeClient]}
        currenciesConfig={{
          defaultCurrency: "USD",
          supportedCurrencies: [USD],
        }}
        api={{
          cartsFetchQuery: {
            depth: 2,
            populate: {
              products: {
                name: true,
                slug: true,
                images: true,
                priceInUSD: true,
              },
              variants: {
                title: true,
                images: true,
                options: true,
                priceInUSD: true,
              },
            },
            select: {
              items: true,
              subtotal: true,
              discountCode: true,
            },
          },
        }}
      >
        <CartDrawerProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </CartDrawerProvider>
      </EcommerceProvider>
      <Suspense>
        <NavigationProgress />
      </Suspense>
      <Toaster position="top-center" richColors closeButton />
    </AuthUIProvider>
  );
}
