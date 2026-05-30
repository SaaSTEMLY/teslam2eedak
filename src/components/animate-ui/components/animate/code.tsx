"use client";

import * as React from "react";

import {
  CodeBlock as CodeBlockPrimitive,
  type CodeBlockProps as CodeBlockPropsPrimitive,
} from "@/components/animate-ui/primitives/animate/code-block";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { getStrictContext } from "@/lib/get-strict-context";

type CodeContextType = {
  code: string;
};

const [CodeProvider, useCode] =
  getStrictContext<CodeContextType>("CodeContext");

type CodeProps = React.ComponentProps<"div"> & {
  code: string;
};

function Code({ className, code, ...props }: CodeProps) {
  return (
    <CodeProvider value={{ code }}>
      <div
        className={cn(
          "relative flex flex-col overflow-hidden border rounded-lg",
          className,
        )}
        {...props}
      />
    </CodeProvider>
  );
}

type CodeHeaderProps = React.ComponentProps<"div"> & {
  icon?: React.ElementType;
  copyButton?: boolean;
};

function CodeHeader({
  className,
  children,
  icon: Icon,
  copyButton = false,
  ...props
}: CodeHeaderProps) {
  const { code } = useCode();

  return (
    <div
      className={cn(
        "bg-accent shrink-0 gap-x-2 border-b border-border/75 dark:border-border/50 text-sm flex text-muted-foreground items-center px-4 w-full h-10",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4" />}
      {children}
      {copyButton && (
        <CopyButton
          content={code}
          size="xs"
          variant="ghost"
          className="ms-auto w-auto h-auto p-2 -me-2"
        />
      )}
    </div>
  );
}

type CodeBlockProps = Omit<CodeBlockPropsPrimitive, "code"> & {
  cursor?: boolean;
};

function CodeBlock({ cursor, className, ...props }: CodeBlockProps) {
  const [isDark, setIsDark] = React.useState(false);
  const { code } = useCode();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.dataset.theme === "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <CodeBlockPrimitive
      ref={scrollRef}
      theme={isDark ? "dark" : "light"}
      scrollContainerRef={scrollRef}
      className={cn(
        "relative text-sm",
        "[&>pre,&_code]:border-none [&_code]:text-[13px]! [&_code_.line]:px-0!",
        cursor &&
          "data-[done=false]:[&_.line:last-of-type::after]:content-['|'] data-[done=false]:[&_.line:last-of-type::after]:inline-block data-[done=false]:[&_.line:last-of-type::after]:w-[1ch] data-[done=false]:[&_.line:last-of-type::after]:-translate-px",
        className,
      )}
      code={code}
      {...props}
    />
  );
}

export {
  Code,
  CodeHeader,
  CodeBlock,
  type CodeProps,
  type CodeHeaderProps,
  type CodeBlockProps,
};
