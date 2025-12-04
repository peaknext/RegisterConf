"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, ChevronRight, Heart } from "lucide-react";

interface FooterProps {
  footerInfo?: {
    organizerName?: string;
    address?: string;
    phone?: string;
    email?: string;
    fax?: string;
  };
}

const quickLinks = [
  { label: "หน้าแรก", href: "#hero" },
  { label: "ข่าวสาร", href: "#news" },
  { label: "กำหนดการ", href: "#schedule" },
  { label: "โรงแรมที่พัก", href: "#hotels" },
  { label: "ท่องเที่ยว", href: "#attractions" },
  { label: "ภาพถ่าย", href: "#photos" },
];

export function Footer({ footerInfo }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const thaiYear = currentYear + 543;

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
                  alt="สำนักงานสาธารณสุขจังหวัดสกลนคร"
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
                href="#"
                className="w-10 h-10 rounded-full bg-kram-800 hover:bg-kram-700 flex items-center justify-center transition-colors"
                aria-label="Website"
              >
                <Globe className="w-5 h-5" />
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
                  {footerInfo?.phone || "042-711157"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-kram-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <a
                  href={`mailto:${
                    footerInfo?.email || "saraban_skonpho@moph.go.th"
                  }`}
                  className="text-kram-300 hover:text-white transition-colors text-sm"
                >
                  {footerInfo?.email || "saraban_skonpho@moph.go.th"}
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
