"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            gap: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
            }}
          >
            Something went wrong
          </h2>
          <Button
            variant="ghost"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "0.375rem",
              border: "1px solid #ccc",
              background: "transparent",
            }}
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
