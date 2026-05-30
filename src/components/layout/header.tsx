"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/Link/customLink";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedDarkModeToggle } from "@/components/ui/animated-dark-mode-toggle";
import { LanguagePicker } from "@/components/ui/language-picker";
import { CartButton } from "@/components/cart/cart-button";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { UserButton } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client";
import type { Messages } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";
import { ColorSchemeSelectorModal } from "@/components/ui/color-scheme-selector-modal";
import { SearchTrigger } from "@/components/search/search-trigger";

function MobileCartButton({
  onClose,
  messages,
  locale,
}: {
  onClose: () => void;
  messages: Messages<"header">;
  locale?: string;
}) {
  const { cart } = useCart();
  const { openCart } = useCartDrawer();
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;

  const localizedCount = formatNumber(itemCount, locale);

  return (
    <Button
      variant="ghost"
      className="justify-start gap-2"
      onClick={() => {
        onClose();
        openCart();
      }}
    >
      <ShoppingBag className="size-4" />
      {messages.cartWithCount.replace("{count}", localizedCount)}
    </Button>
  );
}

export function Header({
  hasSession,
  darkMode,
  locale,
  messages,
  searchMessages,
}: {
  hasSession?: boolean;
  darkMode?: string;
  locale?: string;
  messages: Messages<"header">;
  searchMessages?: Messages<"search">;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: session } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mark as hydrated after first render to avoid hydration mismatches
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Use hasSession for SSR/initial render, then switch to actual session after hydration
  const isSignedIn = isHydrated ? !!session : (hasSession ?? false);

  // Check if locale is RTL
  const isRTL = locale?.startsWith("ar");

  const navLinks = [
    { href: "/", label: messages.home },
    { href: "/about", label: messages.about },
    { href: "/products", label: messages.products },
    { href: "/blogs", label: messages.blog },
    { href: "/contact", label: messages.contact },
    { href: "/api/docs", label: messages.apiDocs },
  ];

  // Check if a nav link is active based on current pathname
  const isLinkActive = (href: string) => {
    if (href === "/") {
      // Home link is only active on exact match
      return pathname === "/";
    }
    // Other links are active if pathname starts with the href
    return pathname?.startsWith(href) ?? false;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Skip to content */}
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        {messages.skipToContent}
      </Link>

      <header
        className="header-scroll fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl shadow-lg border-b border-border/50 transition-all"
        suppressHydrationWarning
      >
        <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            SaaSTARTER
          </Link>

          {/* Desktop Navigation - centered on the page */}
          <nav
            className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors group ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-3 -bottom-px h-px bg-primary scale-x-0 transition-transform duration-300 origin-left ${!isActive ? "group-hover:scale-x-100" : ""}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1">
            {searchMessages && (
              <SearchTrigger translations={searchMessages} locale={locale} />
            )}
            <LanguagePicker initialLocale={locale} />

            <ColorSchemeSelectorModal label={messages.chooseColorScheme} />

            <AnimatedDarkModeToggle
              initialMode={darkMode}
              className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            />

            <CartButton locale={locale} />

            {isSignedIn ? (
              <UserButton size="sm" className="ml-2 cursor-pointer!" />
            ) : (
              <Button variant="ghost" size="sm" className="gap-2 ml-2" asChild>
                <Link
                  href={`/auth/sign-in?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                >
                  <User className="size-4" />
                  <span>{messages.login}</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <LanguagePicker initialLocale={locale} />

            <ColorSchemeSelectorModal label={messages.chooseColorScheme} />

            <AnimatedDarkModeToggle
              initialMode={darkMode}
              className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label={
                isMobileMenuOpen ? messages.closeMenu : messages.openMenu
              }
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 z-50 w-72 bg-background/95 backdrop-blur-xl shadow-2xl lg:hidden ${
                isRTL
                  ? "left-0 border-r border-border"
                  : "right-0 border-l border-border"
              }`}
            >
              <div className="flex flex-col h-full p-6">
                {/* Close button */}
                <div className="flex items-center justify-end mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label={messages.closeMenu}
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                <nav
                  className="flex flex-col gap-1"
                  aria-label="Mobile navigation"
                >
                  {navLinks.map((link, i) => {
                    const isActive = isLinkActive(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive
                              ? "text-primary bg-accent"
                              : "text-foreground hover:text-primary hover:bg-accent"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border">
                  <MobileCartButton
                    onClose={() => setIsMobileMenuOpen(false)}
                    messages={messages}
                    locale={locale}
                  />

                  {isSignedIn ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        asChild
                      >
                        <Link
                          href="/account/settings"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="size-4" />
                          {messages.accountSettings}
                        </Link>
                      </Button>
                      <UserButton className="w-full justify-start cursor-pointer" />
                    </>
                  ) : (
                    <Button className="w-full gap-2" asChild>
                      <Link
                        href={`/auth/sign-in?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="size-4" />
                        {messages.login}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
