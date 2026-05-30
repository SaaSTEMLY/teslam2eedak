"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { Button } from "./button";

type ThemeMode = "light" | "dark" | "system";

function getSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  return theme === "system" ? getSystemPreference() : theme;
}

function applyTheme(theme: ThemeMode) {
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem("theme", theme);
  document.cookie = `payload-theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

const cycleOrder: ThemeMode[] = ["light", "dark", "system"];

interface AnimatedDarkModeToggleProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  initialMode?: string;
}

export const AnimatedDarkModeToggle = ({
  className,
  duration = 400,
  initialMode,
  ...props
}: AnimatedDarkModeToggleProps) => {
  const [theme, setTheme] = useState<ThemeMode>(
    initialMode === "dark" ? "dark" : "light",
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync with stored theme on mount + listen for system preference changes
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    if (stored && cycleOrder.includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
      applyTheme(stored);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      const current = localStorage.getItem("theme") as ThemeMode | null;
      if (current === "system") {
        document.documentElement.dataset.theme = getSystemPreference();
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    const nextTheme =
      cycleOrder[(cycleOrder.indexOf(theme) + 1) % cycleOrder.length] ??
      cycleOrder[0]!;

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, [theme, duration]);

  const icon =
    theme === "light" ? <Sun /> : theme === "dark" ? <Moon /> : <Monitor />;
  const label =
    theme === "light"
      ? "Switch to dark mode"
      : theme === "dark"
        ? "Switch to system mode"
        : "Switch to light mode";

  return (
    <Button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      variant="ghost"
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
};
