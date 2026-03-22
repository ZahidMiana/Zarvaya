"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FallbackImage from "@/components/ui/FallbackImage";
import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  images: string[];
  alt: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const safeImages = useMemo(() => (images.length > 0 ? images : ["/placeholders/jewelry-fallback.svg"]), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const maxIndex = Math.max(0, safeImages.length - 1);

  const goTo = useCallback((index: number) => {
    if (index < 0) {
      setActiveIndex(maxIndex);
      return;
    }

    if (index > maxIndex) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex(index);
  }, [maxIndex]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        goTo(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        goTo(activeIndex - 1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, goTo, isLightboxOpen]);

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-white"
        onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX;
          const startX = touchStartX.current;
          touchStartX.current = null;

          if (typeof startX !== "number" || typeof endX !== "number") {
            return;
          }

          const delta = endX - startX;
          if (Math.abs(delta) < 45) {
            return;
          }

          if (delta < 0) {
            goTo(activeIndex + 1);
          } else {
            goTo(activeIndex - 1);
          }
        }}
      >
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute inset-0 z-20 cursor-zoom-in"
          aria-label="Open product image lightbox"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={safeImages[activeIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute inset-0"
          >
            <FallbackImage
              src={safeImages[activeIndex]}
              alt={`${alt} image ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 md:group-hover:scale-[1.3]"
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute right-3 top-3 z-30 rounded-full bg-charcoal/70 px-2.5 py-1 text-xs text-cream">
          {activeIndex + 1} / {safeImages.length}
        </div>

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-charcoal"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/85 px-2 py-1 text-charcoal"
              aria-label="Next image"
            >
              →
            </button>
          </>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-square min-h-[72px] min-w-[72px] overflow-hidden rounded-xl border",
              activeIndex === index ? "border-gold" : "border-stone-200",
            )}
          >
            <FallbackImage src={image} alt={`${alt} thumbnail ${index + 1}`} fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isLightboxOpen ? (
          <>
            <motion.button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="fixed inset-0 z-[90] bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE }}
              aria-label="Close lightbox"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="fixed left-1/2 top-1/2 z-[91] h-[85vh] w-[min(94vw,1000px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/20"
            >
              <FallbackImage
                src={safeImages[activeIndex]}
                alt={`${alt} lightbox image ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain bg-black"
              />

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-sm text-charcoal"
              >
                Close
              </button>

              {safeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-charcoal"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-charcoal"
                  >
                    →
                  </button>
                </>
              ) : null}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
