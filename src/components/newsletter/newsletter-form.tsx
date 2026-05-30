"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface NewsletterFormProps {
  translations: {
    newsletterPlaceholder: string;
    newsletterButton: string;
    newsletterSubscribing: string;
    newsletterSuccess: string;
    newsletterError: string;
    newsletterInvalidEmail: string;
  };
  className?: string;
  /** Compact mode for footer */
  compact?: boolean;
}

export function NewsletterForm({
  translations: m,
  className,
  compact,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg(m.newsletterInvalidEmail);
      return;
    }

    setStatus("loading");
    try {
      const { response } = await api.POST("/api/newsletter", {
        body: { email },
      });

      if (!response.ok) throw new Error("Failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg(m.newsletterError);
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400",
          className,
        )}
      >
        <CheckCircle2 className="size-4" />
        {m.newsletterSuccess}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2", className)}
    >
      <div
        className={cn(
          "flex gap-2",
          compact ? "flex-row" : "flex-col sm:flex-row",
        )}
      >
        <Input
          type="email"
          placeholder={m.newsletterPlaceholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className={cn("rounded-xl", compact ? "h-9 text-sm" : "h-10")}
          required
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          size={compact ? "sm" : "default"}
          className={cn(
            "rounded-xl gap-1.5 shrink-0",
            compact ? "h-9 px-3" : "h-10",
          )}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {m.newsletterSubscribing}
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              {m.newsletterButton}
            </>
          )}
        </Button>
      </div>
      {status === "error" && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </form>
  );
}
