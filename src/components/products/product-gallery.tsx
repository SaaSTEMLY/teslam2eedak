"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ProductImage {
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset to first image when the images array changes (e.g. variant switch)
  const [prevImages, setPrevImages] = useState(images);
  if (images !== prevImages) {
    setPrevImages(images);
    setSelectedIndex(0);
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-muted flex items-center justify-center">
        <ShoppingBag className="size-24 text-muted-foreground/30" />
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted group">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={selectedImage!.url}
              alt={selectedImage!.alt || productName}
              fill
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (only show if multiple images) */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="absolute start-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur-sm border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="absolute end-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur-sm border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="clear"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    index === selectedIndex
                      ? "bg-primary w-6"
                      : "bg-background/80 hover:bg-background",
                  )}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Grid (only show if multiple images) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <Button
              key={index}
              variant="ghost"
              size="clear"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden bg-muted border-2 transition-all",
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
