"use client";

import { StarRating } from "./star-rating";
import { cn } from "@/lib/utils";

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
  translations: {
    averageRating: string;
    basedOn: string;
    basedOnOne: string;
    outOf: string;
    stars: string;
    star: string;
  };
  className?: string;
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  breakdown,
  translations: t,
  className,
}: ReviewSummaryProps) {
  if (totalReviews === 0) return null;

  return (
    <div className={cn("flex flex-col sm:flex-row gap-8", className)}>
      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-sm text-muted-foreground">
          {totalReviews === 1
            ? t.basedOnOne
            : t.basedOn.replace("{count}", String(totalReviews))}
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star] ?? 0;
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-12 shrink-0 text-end">
                {star === 1 ? t.star : t.stars.replace("{count}", String(star))}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8 shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
