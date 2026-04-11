import { useState, useRef, useCallback } from "react";
import { useSalonGallery, type GalleryImage } from "@/hooks/useSalonGallery";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type CategoryFilter = "all" | "portfolio" | "salon" | "team" | "before_after";

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "portfolio", label: "Portfolio" },
  { value: "salon", label: "Salon" },
  { value: "team", label: "Zespół" },
  { value: "before_after", label: "Przed/Po" },
];

const MAX_VISIBLE = 9;

interface SalonGalleryProps {
  salonId: string;
}

export function SalonGallery({ salonId }: SalonGalleryProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const dbCategory = category === "all" ? null : category;
  const { data: images = [], isLoading } = useSalonGallery(salonId, dbCategory as "portfolio" | "salon" | "team" | "before_after" | null);

  // Touch handling for swipe
  const touchStartX = useRef(0);

  const visibleImages = showAll ? images : images.slice(0, MAX_VISIBLE);
  const hasMore = images.length > MAX_VISIBLE;

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        if (delta > 0) goNext();
        else goPrev();
      }
    },
    [goNext, goPrev]
  );

  // Don't render section if no images and not loading
  if (!isLoading && images.length === 0) return null;

  if (isLoading) {
    return (
      <div className="px-4 pb-3">
        <Skeleton className="h-5 w-36 mb-3" />
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className={cn("aspect-square rounded-lg", i === 0 && "col-span-2 row-span-2")} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-2">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value);
              setShowAll(false);
            }}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              category === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry-like grid */}
      <div className="grid grid-cols-3 gap-1 px-4">
        {visibleImages.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => openLightbox(idx)}
            className={cn(
              "relative overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              idx === 0 && "col-span-2 row-span-2"
            )}
          >
            <img
              src={img.image_url}
              alt={img.caption || "Zdjęcie salonu"}
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Show all button */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mx-4 mt-2 w-[calc(100%-2rem)] py-2 rounded-xl bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Zobacz wszystkie ({images.length})
        </button>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            {lightboxIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next */}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={images[lightboxIndex].id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].caption || "Zdjęcie salonu"}
              className="max-h-[80vh] max-w-[95vw] object-contain rounded-lg"
            />

            {/* Caption */}
            {images[lightboxIndex].caption && (
              <p className="mt-3 text-white/80 text-sm text-center px-4 max-w-md">
                {images[lightboxIndex].caption}
              </p>
            )}

            {/* Counter */}
            <p className="mt-2 text-white/50 text-xs">
              {lightboxIndex + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
