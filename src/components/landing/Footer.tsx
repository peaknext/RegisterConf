/**
 * Landing page footer component with contact information and quick links.
 *
 * Features:
 * - Dynamic contact information from database (footerInfo prop)
 * - Fallback default values for address, phone, email
 * - Quick links with smooth scroll navigation
 * - Social media links (website, Facebook)
 * - Thai Buddhist year display (พ.ศ.)
 * - Decorative gradient background with blur effects
 *
 * Footer sections:
 * 1. Logo & About - Conference branding and description
 * 2. Quick Links - Navigation to page sections
 * 3. Contact - Address, phone, email from settings
 * 4. Bottom bar - Copyright and developer credit
 *
 * @module components/landing/Footer
 *
 * @example
 * // In landing page (fetches footer info from API)
 * const footerInfo = await fetch('/api/settings/footer').then(r => r.json());
 * <Footer footerInfo={footerInfo} />
 *
 * @example
 * // Without props (uses default values)
 * <Footer />
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, ChevronRight, Heart } from "lucide-react";

/**
 * Props for the Footer component.
 */
interface FooterProps {
  /** Dynamic footer information from database settings */
  footerInfo?: {
    /** Organizer/hospital name */
    organizerName?: string;
    /** Physical address for contact section */
    address?: string;
    /** Contact phone number */
    phone?: string;
    /** Contact email address */
    email?: string;
    /** Fax number (optional) */
    fax?: string;
  };
}

/**
 * Quick navigation links for footer section.
 * Uses anchor hrefs for smooth scroll to page sections.
 */
const quickLinks = [
  { label: "หน้าแรก", href: "#hero" },
  { label: "ข่าวสาร", href: "#news" },
  { label: "กำหนดการ", href: "#schedule" },
  { label: "โรงแรมที่พัก", href: "#hotels" },
  { label: "ท่องเที่ยว", href: "#attractions" },
  { label: "ภาพถ่าย", href: "#photos" },
];

/**
 * Landing page footer with contact info and navigation.
 *
 * @component
 * @param props - Component props
 * @param props.footerInfo - Dynamic contact information from settings
 */
export function Footer({ footerInfo }: FooterProps) {
  const currentYear = new Date().getFullYear();
  /** Thai Buddhist year (พ.ศ. = Gregorian year + 543) */
  const thaiYear = currentYear + 543;

  /**
   * Smooth scroll to a page section.
   * @param href - Section anchor (e.g., "#news")
   */
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-kram-900 text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-gold-500" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-kram-800/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-900/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & About */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Image
                  src="/snlogo.png"
                  alt="โรงพยาบาลสกลนคร"
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-xl">
                  งานประชุมวิชาการพัฒนาศักยภาพผู้บริหาร
                </h3>
                <p className="text-kram-300 text-sm">
                  โรงพยาบาลศูนย์ / โรงพยาบาลทั่วไป ประจำปี {thaiYear}
                </p>
              </div>
            </div>
            <p className="text-kram-300 leading-relaxed mb-6 max-w-md">
              งานประชุมวิชาการพัฒนาศักยภาพผู้บริหาร โรงพยาบาลศูนย์ /
              โรงพยาบาลทั่วไป ประจำปี 2569 จัดโดย
              ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป กระทรวงสาธารณสุข
              และโรงพยาบาลสกลนคร
            </p>
            <div className="flex gap-4">
              <a
                href="https://sknhospital.moph.go.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-kram-800 hover:bg-cyan-600 flex items-center justify-center transition-colors"
                aria-label="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/skn.hospital/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-kram-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-cyan-500 rounded-full" />
              ลิงก์ด่วน
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-kram-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-4 h-4 text-cyan-500 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-kram-300 hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-4 h-4 text-cyan-500 transition-transform group-hover:translate-x-1" />
                  เข้าสู่ระบบ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gold-500 rounded-full" />
              ติดต่อ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-kram-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-kram-300 text-sm leading-relaxed">
                  {footerInfo?.address ||
                    "โรงพยาบาลสกลนคร 1041 ถ.เจริญเมือง ต.ธาตุเชิงชุม อ.เมือง จ.สกลนคร 47000"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-kram-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-cyan-400" />
                </div>
                <a
                  href={`tel:${footerInfo?.phone || "042-176000"}`}
                  className="text-kram-300 hover:text-white transition-colors text-sm"
                >
                  {footerInfo?.phone || "042-176000"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-kram-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <a
                  href={`mailto:${
                    footerInfo?.email || "ict-sknhos@moph.go.th"
                  }`}
                  className="text-kram-300 hover:text-white transition-colors text-sm"
                >
                  {footerInfo?.email || "ict-sknhos@moph.go.th"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-kram-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-kram-400 text-sm text-center md:text-left">
              © {thaiYear} ระบบลงทะเบียนงานประชุมวิชาการ โรงพยาบาลสกลนคร
            </p>
            <p className="text-kram-500 text-sm flex items-center gap-1">
              พัฒนาด้วย <Heart className="w-4 h-4 text-red-500 fill-red-500" />{" "}
              โดย กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลสกลนคร
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
