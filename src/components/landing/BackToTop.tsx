"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
