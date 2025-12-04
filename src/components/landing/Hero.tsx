"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
}

interface HeroProps {
  slides?: Slide[];
}

// Default slides using local images
const defaultSlides: Slide[] = [
  { id: 1, imageUrl: "/slideshow_001.png", title: null, linkUrl: null },
  { id: 2, imageUrl: "/slideshow_002.png", title: null, linkUrl: null },
  { id: 3, imageUrl: "/slideshow_003.png", title: null, linkUrl: null },
  { id: 4, imageUrl: "/slideshow_004.png", title: null, linkUrl: null },
  { id: 5, imageUrl: "/slideshow_005.png", title: null, linkUrl: null },
];

export function Hero({ slides }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoPlayInterval = 6000;

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [activeSlides.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
    );
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [activeSlides.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  // Auto-play
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, goToNext, activeSlides.length]);

  // Progress bar
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (autoPlayInterval / 50);
      });
    }, 50);
    return () => clearInterval(progressInterval);
  }, [autoPlayInterval, activeSlides.length, currentIndex]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Cinematic Slideshow Background with Ken Burns Effect */}
      <div className="absolute inset-0">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          const isPrev =
            index ===
            (currentIndex - 1 + activeSlides.length) % activeSlides.length;

          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-all duration-1500 ease-out",
                isActive
                  ? "opacity-100 z-10"
                  : isPrev
                  ? "opacity-0 z-5"
                  : "opacity-0 z-0"
              )}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title || `Slide ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-transform duration-8000 ease-out",
                  isActive ? "scale-110" : "scale-100"
                )}
                priority={index === 0}
              />
            </div>
          );
        })}
      </div>

      {/* Rising Horizon Gradient Overlay */}
      <div className="absolute inset-0 z-20">
        {/* Main gradient: dark at bottom (grounding), transparent at top (aspiration) */}
        <div className="absolute inset-0 bg-gradient-to-t from-kram-950 via-kram-900/80 to-transparent" />

        {/* Radial glow from center-bottom - the "horizon" */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_50%_at_50%_100%,rgba(6,18,138,0.9)_0%,transparent_70%)]" />

        {/* Subtle cyan accent at the horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cyan-900/20 to-transparent" />

        {/* Top vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,0,0,0.3)_0%,transparent_50%)]" />
      </div>

      {/* Animated Light Rays - Forward Motion */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        {/* Central ascending light beam */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[60%] bg-gradient-to-t from-cyan-400/40 via-cyan-400/20 to-transparent animate-pulse-soft" />

        {/* Diagonal rays */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[-15deg] w-[1px] h-[50%] bg-gradient-to-t from-white/20 to-transparent animate-pulse-soft animation-delay-300" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[15deg] w-[1px] h-[50%] bg-gradient-to-t from-white/20 to-transparent animate-pulse-soft animation-delay-500" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[-30deg] w-[1px] h-[40%] bg-gradient-to-t from-cyan-300/10 to-transparent animate-pulse-soft animation-delay-200" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom rotate-[30deg] w-[1px] h-[40%] bg-gradient-to-t from-cyan-300/10 to-transparent animate-pulse-soft animation-delay-400" />

        {/* Floating particles rising upward */}
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-cyan-400/60 rounded-full animate-float-up" />
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-float-up animation-delay-500" />
        <div className="absolute bottom-16 right-1/4 w-1 h-1 bg-cyan-300/50 rounded-full animate-float-up animation-delay-300" />
        <div className="absolute bottom-40 right-1/3 w-0.5 h-0.5 bg-white/60 rounded-full animate-float-up animation-delay-700" />
        <div className="absolute bottom-24 left-[45%] w-1 h-1 bg-gold-400/40 rounded-full animate-float-up animation-delay-200" />
      </div>

      {/* Geometric Accents */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Corner frames */}
        <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
        <div className="absolute bottom-32 left-8 w-20 h-20 border-l-2 border-b-2 border-white/10 rounded-bl-lg" />
        <div className="absolute bottom-32 right-8 w-20 h-20 border-r-2 border-b-2 border-white/10 rounded-br-lg" />
      </div>

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 opacity-0 animate-fade-in-down shadow-lg shadow-black/10">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              เปิดรับลงทะเบียนแล้ววันนี้
            </span>
          </div>

          {/* Main heading with glass card */}
          <div className="relative mb-8 opacity-0 animate-fade-in-up animation-delay-100">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur-xl" />
            <h1 className="relative text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl pb-3 overflow-visible">
              <span className="block">
                งานประชุมวิชาการพัฒนาศักยภาพผู้บริหาร
              </span>
              <span className="block mt-4 text-cyan-200 drop-shadow-lg">
                โรงพยาบาลศูนย์ / โรงพยาบาลทั่วไป ประจำปี 2569
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up animation-delay-200 drop-shadow-lg">
            ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป กระทรวงสาธารณสุข
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0 animate-fade-in-up animation-delay-300">
            <Link href="/login">
              <Button
                size="lg"
                className="text-lg px-8 py-7 bg-white text-kram-700 hover:bg-white/90 rounded-full font-semibold shadow-2xl shadow-black/30 group btn-shine transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/20"
              >
                ลงทะเบียนเข้าร่วมงาน
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-7 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 rounded-full font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105"
              onClick={() => {
                document
                  .querySelector("#schedule")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              ดูกำหนดการ
            </Button>
          </div>

          {/* Info cards - Glass morphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto opacity-0 animate-fade-in-up animation-delay-400">
            <div className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:border-white/30">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <Calendar className="w-6 h-6 text-cyan-300" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">วันที่จัดงาน</p>
                <p className="text-white font-semibold">8-10 ม.ค. 2569</p>
              </div>
            </div>
            <div className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:border-white/30">
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                <MapPin className="w-6 h-6 text-gold-300" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">สถานที่</p>
                <p className="text-white font-semibold">
                  โรงแรม MJ จังหวัดสกลนคร
                </p>
              </div>
            </div>
            <div className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-black/10 transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:border-white/30">
              <div className="w-12 h-12 rounded-xl bg-kram-400/20 flex items-center justify-center group-hover:bg-kram-400/30 transition-colors">
                <Users className="w-6 h-6 text-kram-200" />
              </div>
              <div className="text-left">
                <p className="text-white/60 text-xs">ผู้เข้าร่วม</p>
                <p className="text-white font-semibold">2,000+ คน</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slideshow Navigation - Elegant minimal */}
      {activeSlides.length > 1 && (
        <>
          {/* Side arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white/80 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white/80 group-hover:text-white transition-colors" />
          </button>

          {/* Bottom progress dots */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative h-1.5 rounded-full transition-all duration-500 overflow-hidden",
                  index === currentIndex
                    ? "w-12 bg-white/30"
                    : "w-1.5 bg-white/40 hover:bg-white/60 hover:scale-125"
                )}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-white rounded-full origin-left"
                    style={{
                      transform: `scaleX(${progress / 100})`,
                      transition: "transform 50ms linear",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-30" />
    </section>
  );
}
