"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, BadgeCheck } from "lucide-react";
import { StarRating } from "./star-rating";
import { ReviewSummary } from "./review-summary";
import { ReviewForm } from "./review-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface Review {
  id: string | number;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  customer?: { name?: string; email?: string } | number;
}

interface ProductReviewsProps {
  productId: string | number;
  isAuthenticated: boolean;
  translations: {
    reviewsTitle: string;
    writeReview: string;
    noReviews: string;
    noReviewsDescription: string;
    averageRating: string;
    basedOn: string;
    basedOnOne: string;
    verifiedPurchase: string;
    helpful: string;
    helpfulCount: string;
    reviewSubmitted: string;
    reviewTitle: string;
    reviewTitlePlaceholder: string;
    reviewBody: string;
    reviewBodyPlaceholder: string;
    rating: string;
    submitReview: string;
    submitting: string;
    loginToReview: string;
    sortNewest: string;
    sortHelpful: string;
    sortHighest: string;
    sortLowest: string;
    stars: string;
    star: string;
    outOf: string;
    showMore: string;
  };
  className?: string;
}

export function ProductReviews({
  productId,
  isAuthenticated,
  translations: t,
  className,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.GET("/api/reviews", {
        params: {
          query: {
            productId: String(productId),
            sort: sort as "-createdAt" | "helpful" | "highest" | "lowest",
            page: String(page),
            limit: "5",
          },
        },
      });
      if (!data) return;
      if (page === 1) {
        setReviews((data.reviews as Review[]) ?? []);
      } else {
        setReviews((prev) => [...prev, ...((data.reviews as Review[]) ?? [])]);
      }
      setTotalPages(data.totalPages ?? 1);
      setAverageRating(data.averageRating ?? 0);
      setTotalDocs(data.totalDocs ?? 0);
      setBreakdown((data.breakdown as Record<number, number>) ?? {});
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [productId, sort, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId: string | number) => {
    try {
      await api.POST("/api/reviews/{reviewId}/helpful", {
        params: { path: { reviewId: String(reviewId) } },
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r,
        ),
      );
    } catch {
      // fail silently
    }
  };

  const sortOptions = [
    { value: "-createdAt", label: t.sortNewest },
    { value: "helpful", label: t.sortHelpful },
    { value: "highest", label: t.sortHighest },
    { value: "lowest", label: t.sortLowest },
  ] as const;

  return (
    <section className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {t.reviewsTitle}
        </h2>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {t.writeReview}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl border border-border p-6 bg-card">
          <ReviewForm
            productId={productId}
            translations={t}
            isAuthenticated={isAuthenticated}
            onSubmitted={() => {
              setShowForm(false);
              setPage(1);
              fetchReviews();
            }}
          />
        </div>
      )}

      <ReviewSummary
        averageRating={averageRating}
        totalReviews={totalDocs}
        breakdown={breakdown}
        translations={t}
      />

      {totalDocs > 0 && (
        <div className="flex items-center gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSort(option.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                sort === option.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => {
            const customerName =
              typeof review.customer === "object" && review.customer
                ? (review.customer.name ?? "Customer")
                : "Customer";

            return (
              <article
                key={review.id}
                className="rounded-xl border border-border/50 p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <BadgeCheck className="size-3.5" />
                          {t.verifiedPurchase}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-medium text-foreground">
                      {review.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.body}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{customerName}</span>
                  <div className="flex items-center gap-3">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <ThumbsUp className="size-3.5" />
                      {t.helpful}
                      {review.helpfulCount > 0 && ` (${review.helpfulCount})`}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.noReviews}</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {t.noReviewsDescription}
            </p>
          </div>
        )
      )}

      {page < totalPages && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
          >
            {t.showMore}
          </Button>
        </div>
      )}
    </section>
  );
}
