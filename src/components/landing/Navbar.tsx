"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronRight } from "lucide-react";

const navItems = [
  { label: "หน้าแรก", href: "#hero" },
  { label: "ข่าวสาร", href: "#news" },
  { label: "กำหนดการ", href: "#schedule" },
  { label: "โรงแรม", href: "#hotels" },
  { label: "ท่องเที่ยว", href: "#attractions" },
  { label: "ภาพถ่าย", href: "#photos" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = navItems.map((item) => item.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offsetTop =
        element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-kram-900/5 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* White circle background for logo */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden",
                  isScrolled
                    ? "bg-white shadow-md ring-2 ring-kram-100"
                    : "bg-white shadow-lg"
                )}
              >
                <Image
                  src="/snlogo.png"
                  alt="โรงพยาบาลจังหวัดสกลนคร"
                  width={40}
                  height={40}
                  className="w-9 h-9 object-contain"
                />
              </div>
              {/* Subtle glow effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-opacity duration-300",
                  isScrolled ? "opacity-0" : "opacity-50 bg-white/20 blur-md"
                )}
              />
            </div>
            <div className="hidden sm:block">
              <span
                className={cn(
                  "font-bold text-lg tracking-tight transition-colors duration-300 block leading-tight",
                  isScrolled ? "text-kram-700" : "text-white"
                )}
              >
                โรงพยาบาลสกลนคร
              </span>
              <span
                className={cn(
                  "text-xs transition-colors duration-300",
                  isScrolled ? "text-kram-500" : "text-white/80"
                )}
              >
                Sakon Nakhon Hospital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace("#", "");
              return (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    isScrolled
                      ? isActive
                        ? "text-kram-700 bg-kram-50"
                        : "text-kram-600 hover:text-kram-700 hover:bg-kram-50"
                      : isActive
                      ? "text-white bg-white/20"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                        isScrolled ? "bg-kram-500" : "bg-white"
                      )}
                    />
                  )}
                </button>
              );
            })}
            <Link href="/login" className="ml-2">
              <Button
                className={cn(
                  "rounded-full font-semibold transition-all duration-300 group",
                  isScrolled
                    ? "bg-kram-700 hover:bg-kram-800 text-white shadow-lg shadow-kram-700/25"
                    : "bg-white text-kram-700 hover:bg-kram-50 shadow-lg"
                )}
              >
                เข้าสู่ระบบ
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "md:hidden p-2.5 rounded-full transition-all duration-300",
              isScrolled
                ? "text-kram-700 hover:bg-kram-50"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-kram-900/10 p-4 border border-kram-100">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace("#", "");
                return (
                  <button
                    key={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-left font-medium transition-all duration-200",
                      isActive
                        ? "bg-kram-50 text-kram-700"
                        : "text-kram-600 hover:bg-kram-50 hover:text-kram-700"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2 mt-2 border-t border-kram-100">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-kram-700 hover:bg-kram-800 text-white font-semibold py-6">
                    เข้าสู่ระบบ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
