"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center"
    >
      <p className="text-8xl font-bold text-muted-foreground/20 font-serif sm:text-[10rem]">
        500
      </p>
      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-8 h-11 rounded-xl px-6"
        variant="outline"
      >
        <RefreshCw className="me-2 size-4" />
        Try again
      </Button>
    </main>
  );
}
