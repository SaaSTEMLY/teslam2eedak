"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

export default function DeleteAccountConfirm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "idle" | "deleting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = useCallback(async () => {
    if (!token) return;
    setStatus("deleting");
    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setTimeout(() => router.push("/"), 3000);
      }
    } catch {
      setErrorMessage("Something went wrong.");
      setStatus("error");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-destructive">Invalid or missing token.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 text-center">
        {status === "idle" && (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Delete account
            </h1>
            <p className="text-muted-foreground">
              This action is permanent and cannot be undone. All your data will
              be removed.
            </p>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Deletion
            </Button>
          </>
        )}

        {status === "deleting" && (
          <p className="text-muted-foreground">Deleting your account...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Account deleted
            </h1>
            <p className="text-muted-foreground">
              Your account has been successfully deleted. Redirecting...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-destructive">
              Deletion failed
            </h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button variant="destructive" onClick={handleDelete}>
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
