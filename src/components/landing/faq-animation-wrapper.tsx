"use client";

import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function FaqAnimationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimateOnScroll>{children}</AnimateOnScroll>;
}
