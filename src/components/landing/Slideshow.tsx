/**
 * Auto-playing slideshow/carousel component for landing page.
 *
 * Features:
 * - Automatic slide advancement with configurable interval
 * - Progress bar showing time until next slide
 * - Pause on hover, resume on mouse leave
 * - Manual navigation (prev/next arrows, dot indicators)
 * - Play/pause toggle button
 * - Optional click-through links on slides
 * - Optional title overlay
 * - Smooth slide transitions with scale/translate effects
 * - Fallback to default slides when none provided
 *
 * @module components/landing/Slideshow
 *
 * @example
 * const slides = await prisma.slideshow.findMany({ where: { isActive: true } });
 * <Slideshow slides={slides} autoPlayInterval={5000} />
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/**
 * Slide data structure.
 */
interface Slide {
  /** Database ID */
  id: number;
  /** Optional title/caption overlay */
  title?: string | null;
  /** Image URL (required) */
  imageUrl: string;
  /** Optional click-through URL */
  linkUrl?: string | null;
}

/**
 * Props for the Slideshow component.
 */
interface SlideshowProps {
  /** Slides to display (falls back to defaults if empty) */
  slides?: Slide[];
  /** Auto-advance interval in milliseconds (default: 5000) */
  autoPlayInterval?: number;
}

/**
 * Default slides for development/demo.
 */
const defaultSlides: Slide[] = [
  { id: 1, imageUrl: "/slideshow_001.png", title: null, linkUrl: null },
  { id: 2, imageUrl: "/slideshow_002.png", title: null, linkUrl: null },
  { id: 3, imageUrl: "/slideshow_003.png", title: null, linkUrl: null },
];

/**
 * Auto-playing slideshow with manual controls.
 *
 * @component
 * @param props - Component props
 */
export function Slideshow({ slides, autoPlayInterval = 5000 }: SlideshowProps) {
  /** Current slide index (0-based) */
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Whether auto-play is active */
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  /** Whether a slide transition is in progress */
  const [isTransitioning, setIsTransitioning] = useState(false);
  /** Progress bar value (0-100) */
  const [progress, setProgress] = useState(0);

  /** Use provided slides or fall back to defaults */
  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  /**
   * Navigate to next slide with transition lock.
   */
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activeSlides.length, isTransitioning]);

  /**
   * Navigate to previous slide with transition lock.
   */
  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [activeSlides.length, isTransitioning]);

  /**
   * Navigate to specific slide index.
   * @param index - Target slide index
   */
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || activeSlides.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, goToNext, activeSlides.length]);

  // Progress bar
  useEffect(() => {
    if (!isAutoPlaying || activeSlides.length <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (autoPlayInterval / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isAutoPlaying, autoPlayInterval, activeSlides.length, currentIndex]);

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];

  return (
    <section id="slideshow" className="relative bg-kram-50">
      {/* Section header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-kram-800 mb-3">
            ภาพกิจกรรม
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-kram-500 to-cyan-500 mx-auto rounded-full" />
        </div>
      </div>

      {/* Slideshow container */}
      <div
        className="relative w-full max-w-6xl mx-auto aspect-[16/9] md:aspect-[21/9] bg-kram-100 overflow-hidden rounded-none md:rounded-2xl shadow-2xl shadow-kram-900/20 group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        <div className="relative w-full h-full">
          {activeSlides.map((slide, index) => {
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + activeSlides.length) % activeSlides.length;
            const isNext = index === (currentIndex + 1) % activeSlides.length;

            return (
              <div
                key={slide.id}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-out",
                  isActive
                    ? "opacity-100 scale-100 z-10"
                    : isPrev
                      ? "opacity-0 scale-105 -translate-x-full z-0"
                      : isNext
                        ? "opacity-0 scale-105 translate-x-full z-0"
                        : "opacity-0 scale-95 z-0"
                )}
              >
                {slide.linkUrl ? (
                  <a
                    href={slide.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title || `Slide ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </a>
                ) : (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || `Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                )}

                {/* Title Overlay */}
                {slide.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-kram-900/90 via-kram-900/50 to-transparent p-8 md:p-12">
                    <h3 className="text-white text-xl md:text-3xl font-bold max-w-2xl">
                      {slide.title}
                    </h3>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

        {/* Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-kram-500"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-kram-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-kram-500"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-kram-700" />
            </button>
          </>
        )}

        {/* Bottom controls */}
        {activeSlides.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
            {/* Play/Pause button */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "relative h-2 rounded-full transition-all duration-300 overflow-hidden",
                    index === currentIndex ? "w-8 bg-white/30" : "w-2 bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === currentIndex && (
                    <span
                      className="absolute inset-0 bg-white rounded-full origin-left"
                      style={{
                        transform: `scaleX(${progress / 100})`,
                        transition: "transform 50ms linear",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Slide counter */}
            <span className="text-white/80 text-sm font-medium tabular-nums">
              {currentIndex + 1}/{activeSlides.length}
            </span>
          </div>
        )}
      </div>

      {/* Bottom padding */}
      <div className="h-12 md:h-16" />
    </section>
  );
}
