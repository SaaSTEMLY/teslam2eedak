"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const activeAnchorRef = useRef<HTMLAnchorElement | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Simulate progress: fast at first, then slows down asymptotically
    if (timerRef.current) clearInterval(timerRef.current);
    let current = 0;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      // Fast initial burst, then slow crawl
      if (elapsed < 300) {
        current = Math.min(current + 8, 30);
      } else if (elapsed < 1000) {
        current = Math.min(current + 3, 60);
      } else if (elapsed < 3000) {
        current = Math.min(current + 0.5, 80);
      } else {
        current = Math.min(current + 0.1, 90);
      }
      setProgress(current);
    }, 50);
  }, []);

  const clearActiveAnchor = useCallback(() => {
    if (activeAnchorRef.current) {
      activeAnchorRef.current.removeAttribute("data-navigating");
      activeAnchorRef.current = null;
    }
  }, []);

  const completeLoading = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    // Let the bar reach 100% visually before hiding
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      clearActiveAnchor();
    }, 300);
  }, [clearActiveAnchor]);

  // Detect navigation completion via pathname/searchParams change
  useEffect(() => {
    if (isLoading) {
      completeLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept internal link clicks to start loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, mailto, tel, download, new tab
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Skip if navigating to the same page
      const url = new URL(href, window.location.origin);
      if (url.pathname === pathname && url.search === window.location.search) {
        return;
      }

      clearActiveAnchor();
      anchor.setAttribute("data-navigating", "");
      activeAnchorRef.current = anchor;
      startLoading();
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, startLoading, clearActiveAnchor]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
        >
          {/* Background track (subtle) */}
          <div className="absolute inset-0 bg-primary/10" />

          {/* Progress bar */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            style={{
              width: `${progress}%`,
              backgroundImage:
                "linear-gradient(90deg, var(--color-primary), oklch(from var(--color-primary) calc(l * 1.3) c h), var(--color-primary))",
              backgroundSize: "200% 100%",
            }}
            initial={{ width: "0%" }}
            animate={{
              width: `${progress}%`,
              backgroundPosition: ["0% 0%", "200% 0%"],
            }}
            transition={{
              width: { duration: 0.3, ease: "easeOut" },
              backgroundPosition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {/* Glow effect at the leading edge */}
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/60 to-transparent blur-sm" />
            <div className="absolute top-0 right-0 h-[6px] w-12 -translate-y-[1.5px] bg-primary/40 blur-md" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
