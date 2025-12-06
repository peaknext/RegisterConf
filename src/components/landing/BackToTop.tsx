/**
 * Back-to-top floating action button for landing page.
 *
 * Features:
 * - Appears after scrolling 500px down
 * - Smooth scroll to top on click
 * - Animated entrance/exit with translate + opacity
 * - Floating animation when visible
 * - Ripple ping effect
 * - Gradient background styling
 *
 * @module components/landing/BackToTop
 *
 * @example
 * // In landing page layout
 * <BackToTop />
 */
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating back-to-top button component.
 *
 * @component
 */
export function BackToTop() {
  /** Whether button is visible (scrollY > 500px) */
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Set up scroll listener to show/hide button.
   * Uses passive listener for better scroll performance.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Smooth scroll to page top.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full",
        "bg-gradient-to-br from-kram-600 to-kram-800 text-white",
        "shadow-xl shadow-kram-700/30",
        "flex items-center justify-center",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-kram-600/40 hover:scale-110",
        "active:scale-95",
        isVisible
          ? "opacity-100 translate-y-0 float-animation"
          : "opacity-0 translate-y-16 pointer-events-none"
      )}
      aria-label="กลับขึ้นด้านบน"
    >
      <ArrowUp className="w-6 h-6" />
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75" />
    </button>
  );
}
