/**
 * Photos gallery section for landing page.
 *
 * Features:
 * - Link to Google Drive for photo gallery
 * - Decorative polaroid-style preview cards
 * - Fallback message when no URL configured
 * - Animated decorative elements
 *
 * @module components/landing/PhotosSection
 *
 * @example
 * const config = await prisma.config.findFirst();
 * <PhotosSection googleDriveUrl={config?.googleDriveUrl} />
 */
"use client";

import { Button } from "@/components/ui/button";
import { Camera, ExternalLink, Image as ImageIcon, FolderOpen } from "lucide-react";

/**
 * Props for the PhotosSection component.
 */
interface PhotosSectionProps {
  /** Google Drive folder URL for photo gallery (shows placeholder if null) */
  googleDriveUrl?: string | null;
}

/**
 * Photos section with Google Drive link.
 *
 * @component
 * @param props - Component props
 * @param props.googleDriveUrl - Link to photo gallery (optional)
 */
export function PhotosSection({ googleDriveUrl }: PhotosSectionProps) {
  return (
    <section id="photos" className="py-20 md:py-28 bg-gradient-to-b from-white via-kram-50/50 to-kram-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-kram-200/30 rounded-2xl rotate-12 opacity-50" />
        <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-cyan-200/30 rounded-2xl -rotate-12 opacity-50" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gold-200/20 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-cyan-200/20 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-kram-100 to-cyan-100 rounded-3xl mb-8 shadow-lg shadow-kram-200/50">
            <Camera className="w-12 h-12 text-kram-600" />
          </div>

          {/* Header */}
          <span className="inline-block px-4 py-1.5 bg-kram-100 text-kram-700 text-sm font-semibold rounded-full mb-4">
            <ImageIcon className="w-4 h-4 inline mr-1.5" />
            แกลเลอรี่
          </span>

          <h2 className="text-3xl md:text-5xl font-bold text-kram-900 mb-4 premium-underline">
            ภาพถ่ายกิจกรรม
          </h2>
          <p className="text-kram-600 mb-10 text-lg leading-relaxed mt-6">
            รวมภาพบรรยากาศการประชุมและกิจกรรมต่างๆ
            <br className="hidden md:block" />
            สามารถดูและดาวน์โหลดภาพได้จาก Google Drive
          </p>

          {googleDriveUrl ? (
            <div className="space-y-6">
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-kram-700 hover:bg-kram-800 text-white rounded-full font-semibold shadow-xl shadow-kram-700/25 group glow-effect btn-shine"
                asChild
              >
                <a
                  href={googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  เปิดดูภาพถ่าย
                  <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>

              {/* Polaroid preview cards */}
              <div className="flex justify-center items-end gap-6 mt-12">
                {[
                  { rotate: "-rotate-6", delay: "0ms", src: "/gallery_001.png" },
                  { rotate: "rotate-2", delay: "100ms", src: "/gallery_002.png" },
                  { rotate: "rotate-6", delay: "200ms", src: "/gallery_003.png" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`polaroid glow-effect ${item.rotate} cursor-pointer`}
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-kram-100 to-cyan-100 rounded-sm flex items-center justify-center overflow-hidden">
                      <Camera className="w-8 h-8 md:w-10 md:h-10 text-kram-400/60" />
                    </div>
                    <p className="text-[10px] md:text-xs text-kram-500 text-center mt-2 font-medium">
                      ภาพที่ {i + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 shadow-lg shadow-kram-900/5 border border-kram-100">
              <div className="w-16 h-16 bg-kram-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-kram-300" />
              </div>
              <p className="text-kram-500 text-lg">
                ภาพถ่ายจะอัปโหลดหลังจบงานประชุม
              </p>
              <p className="text-kram-400 text-sm mt-2">
                กรุณาติดตามข่าวสารเพิ่มเติม
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
