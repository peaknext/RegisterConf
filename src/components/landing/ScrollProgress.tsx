/**
 * Scroll progress indicator bar for landing page.
 *
 * Features:
 * - Fixed position progress bar at top of page
 * - Width represents scroll percentage (0-100%)
 * - Passive scroll listener for performance
 * - Accessible progressbar role
 *
 * CSS styling expected in globals.css:
 * ```css
 * .scroll-progress {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   height: 3px;
 *   background: linear-gradient(...);
 *   z-index: 9999;
 * }
 * ```
 *
 * @module components/landing/ScrollProgress
 *
 * @example
 * // In layout or page
 * <ScrollProgress />
 */
"use client";

import { useEffect, useState } from "react";

/**
 * Scroll progress bar component.
 *
 * @component
 */
export function ScrollProgress() {
  /** Scroll progress percentage (0-100) */
  const [progress, setProgress] = useState(0);

  /**
   * Set up scroll listener to track progress.
   * Uses passive listener for better scroll performance.
   */
  useEffect(() => {
    /**
     * Calculate and update scroll progress.
     * Progress = (scrollTop / scrollableHeight) * 100
     */
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
