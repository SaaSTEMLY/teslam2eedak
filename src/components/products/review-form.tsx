"use client";

import { useState } from "react";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface ReviewFormProps {
  productId: string | number;
  translations: {
    reviewTitle: string;
    reviewTitlePlaceholder: string;
    reviewBody: string;
    reviewBodyPlaceholder: string;
    rating: string;
    submitReview: string;
    submitting: string;
    reviewSubmitted: string;
    loginToReview: string;
  };
  isAuthenticated: boolean;
  onSubmitted?: () => void;
}

export function ReviewForm({
  productId,
  translations: t,
  isAuthenticated,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted-foreground italic">{t.loginToReview}</p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const { error, response } = await api.POST("/api/reviews", {
        body: { productId: Number(productId), rating, title, body },
      });

      if (!response.ok) {
        toast.error(
          (error as { error?: string } | undefined)?.error ||
            "Failed to submit review",
        );
        return;
      }

      toast.success(t.reviewSubmitted);
      setRating(0);
      setTitle("");
      setBody("");
      onSubmitted?.();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">
          {t.rating}
        </label>
        <StarRating
          rating={rating}
          interactive
          onRate={setRating}
          size="lg"
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="text-sm font-medium text-foreground"
        >
          {t.reviewTitle}
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.reviewTitlePlaceholder}
          maxLength={200}
          required
          className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
        />
      </div>

      <div>
        <label
          htmlFor="review-body"
          className="text-sm font-medium text-foreground"
        >
          {t.reviewBody}
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.reviewBodyPlaceholder}
          maxLength={2000}
          required
          rows={4}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-y"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || !title.trim() || !body.trim()}
      >
        {isSubmitting ? t.submitting : t.submitReview}
      </Button>
    </form>
  );
}
