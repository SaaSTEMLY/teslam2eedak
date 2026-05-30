"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Shield,
  CreditCard,
  Package,
  Heart,
  Code,
  Loader2,
  Settings,
} from "lucide-react";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import {
  AccountSettingsCards,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BillingSettingsCard } from "./billing-settings-card";
import { OrdersCard } from "./orders-card";
import { WishlistCard } from "./wishlist-card";
import { DeveloperCard } from "./developer-card";
import { OrderStatusListener } from "./order-status-listener";
import type accountEn from "@/messages/account/en";
import type addCardDialogEn from "@/messages/add-card-dialog/en";
import type wishlistEn from "@/messages/wishlist/en";
import type developerEn from "@/messages/developer/en";
import type { SupportedLocale } from "@/lib/locale";

type NavItem = {
  key: string;
  labelKey: keyof typeof accountEn;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const navItemsConfig: NavItem[] = [
  {
    key: "settings",
    labelKey: "navSettings",
    icon: User,
    href: "/account/settings",
  },
  {
    key: "security",
    labelKey: "navSecurity",
    icon: Shield,
    href: "/account/security",
  },
  {
    key: "billing",
    labelKey: "navBilling",
    icon: CreditCard,
    href: "/account/billing",
  },
  {
    key: "orders",
    labelKey: "navOrders",
    icon: Package,
    href: "/account/orders",
  },
  {
    key: "wishlist",
    labelKey: "navWishlist" as keyof typeof accountEn,
    icon: Heart,
    href: "/account/wishlist",
  },
  {
    key: "developer",
    labelKey: "navDeveloper" as keyof typeof accountEn,
    icon: Code,
    href: "/account/developer",
  },
];

function getTabFromPath(pathname: string) {
  const segment = pathname.split("/").pop() || "settings";
  return navItemsConfig.find((item) => item.key === segment)
    ? segment
    : "settings";
}

export function AccountPageContent({
  translations,
  addCardTranslations,
  wishlistTranslations,
  developerTranslations,
  locale,
}: {
  translations: typeof accountEn;
  addCardTranslations: typeof addCardDialogEn;
  wishlistTranslations?: typeof wishlistEn;
  developerTranslations?: typeof developerEn;
  locale: SupportedLocale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useAuthenticate({ enabled: false });

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(pathname));

  const switchTab = useCallback((key: string, href: string) => {
    setActiveTab(key);
    window.history.pushState(null, "", href);
  }, []);

  // Sync tab state when user navigates with browser back/forward
  useEffect(() => {
    const onPopState = () =>
      setActiveTab(getTabFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [session, isPending, router]);

  const isReady = !isPending && !!session;

  return (
    <div className="min-h-screen pt-28 pb-16">
      {session?.user?.id && <OrderStatusListener userId={session.user.id} />}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Settings className="size-5 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
              {translations.pageTitle}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-13">
            {translations.pageDescription}
          </p>
        </div>

        {/* Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Sidebar Navigation */}
          <nav
            className="md:w-52 lg:w-60 shrink-0"
            aria-label={translations.ariaNavigation}
          >
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {navItemsConfig.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <Button
                    key={item.key}
                    variant="ghost"
                    size="clear"
                    onClick={() => switchTab(item.key, item.href)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    {translations[item.labelKey]}
                  </Button>
                );
              })}
            </div>

            {/* Desktop: vertical sidebar */}
            <div className="hidden md:flex flex-col gap-1">
              {navItemsConfig.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <Button
                    key={item.key}
                    variant="ghost"
                    size="clear"
                    onClick={() => switchTab(item.key, item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="size-4" />
                    {translations[item.labelKey]}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {!isReady ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {!session && !isPending
                    ? translations.redirecting
                    : translations.loading}
                </p>
              </div>
            ) : (
              <div>
                {activeTab === "settings" && (
                  <AccountSettingsCards
                    classNames={{
                      cards: "gap-6",
                      card: {
                        base: "rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm",
                        input:
                          "h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200",
                        primaryButton:
                          "rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200",
                        footer: "bg-muted/30 rounded-b-xl",
                        title: "font-serif text-lg",
                        button: "cursor-pointer",
                      },
                    }}
                  />
                )}

                {activeTab === "security" && (
                  <SecuritySettingsCards
                    classNames={{
                      cards: "gap-6",
                      card: {
                        base: "rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm",
                        input:
                          "h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200",
                        primaryButton:
                          "rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200",
                        destructiveButton: "rounded-xl font-semibold",
                        footer: "bg-muted/30 rounded-b-xl",
                        title: "font-serif text-lg",
                        button: "cursor-pointer",
                      },
                    }}
                  />
                )}

                {activeTab === "billing" && (
                  <BillingSettingsCard
                    translations={translations}
                    addCardTranslations={addCardTranslations}
                    locale={locale}
                  />
                )}

                {activeTab === "orders" && (
                  <OrdersCard translations={translations} locale={locale} />
                )}

                {activeTab === "wishlist" && wishlistTranslations && (
                  <WishlistCard
                    translations={{
                      ...wishlistTranslations,
                      addToCart: "Add to Cart",
                      added: "Added!",
                    }}
                  />
                )}
                {activeTab === "developer" && developerTranslations && (
                  <DeveloperCard translations={developerTranslations} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
