"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

export function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            className={cn(
              "transition-colors",
              interactive
                ? "cursor-pointer hover:text-yellow-400"
                : "cursor-default",
            )}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
