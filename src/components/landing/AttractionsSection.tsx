"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Navigation,
  Compass,
  TreePine,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Attraction {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  mapUrl?: string | null;
  distance?: string | null;
  highlight?: string | null;
}

interface AttractionsSectionProps {
  attractions?: Attraction[];
}

// Mock data for Sakon Nakhon attractions
const defaultAttractions: Attraction[] = [
  {
    id: 1,
    name: "พระธาตุเชิงชุม",
    description:
      "พระธาตุคู่บ้านคู่เมืองสกลนคร สร้างในสมัยทวารวดี ภายในบรรจุพระบรมสารีริกธาตุ เป็นศูนย์รวมจิตใจของชาวสกลนคร",
    imageUrl: "/ThatChoengChum.jpg",
    category: "temple",
    mapUrl: "https://maps.google.com/?q=พระธาตุเชิงชุม+สกลนคร",
    distance: "2 กม.",
    highlight: "แหล่งท่องเที่ยวอันดับ 1",
  },
  {
    id: 2,
    name: "หนองหาร",
    description:
      "ทะเลสาบน้ำจืดขนาดใหญ่ที่สุดในภาคอีสาน มีเนื้อที่กว่า 123 ตารางกิโลเมตร เป็นแหล่งที่อยู่ของบัวแดงนานาพันธุ์",
    imageUrl: "/Nongharn.jpg",
    category: "nature",
    mapUrl: "https://maps.google.com/?q=หนองหาร+สกลนคร",
    distance: "5 กม.",
    highlight: "ทะเลบัวแดง",
  },
  {
    id: 3,
    name: "ภูพาน",
    description:
      "อุทยานแห่งชาติภูพาน ครอบคลุมพื้นที่ป่าเขาสูงสลับซับซ้อน เป็นแหล่งที่อยู่อาศัยของสัตว์ป่าหายากมากมาย",
    imageUrl: "/PhuPhan.jpg",
    category: "nature",
    mapUrl: "https://maps.google.com/?q=อุทยานแห่งชาติภูพาน",
    distance: "45 กม.",
    highlight: "พระตำหนักภูพานราชนิเวศน์",
  },
  {
    id: 4,
    name: "วัดพระธาตุนารายณ์เจงเวง",
    description:
      "พระธาตุเก่าแก่สมัยขอม อายุกว่า 1,000 ปี สร้างด้วยศิลาแลงและหินทราย มีลักษณะคล้ายปราสาทขอม",
    imageUrl: "/ChengWeng.jpg",
    category: "temple",
    mapUrl: "https://maps.google.com/?q=วัดพระธาตุนารายณ์เจงเวง",
    distance: "8 กม.",
    highlight: "สถาปัตยกรรมขอมโบราณ",
  },
  {
    id: 5,
    name: "สวนสมเด็จพระศรีนครินทร์",
    description:
      "สวนสาธารณะขนาดใหญ่ริมหนองหาร มีทางเดินเลียบริมน้ำ สวนดอกไม้ และลานออกกำลังกาย เหมาะแก่การพักผ่อน",
    imageUrl: "/Suan.jpg",
    category: "landmark",
    mapUrl: "https://maps.google.com/?q=สวนสมเด็จพระศรีนครินทร์+สกลนคร",
    distance: "3 กม.",
    highlight: "วิวพระอาทิตย์ตก",
  },
  {
    id: 6,
    name: "พิพิธภัณฑ์ภูพาน",
    description:
      "แหล่งเรียนรู้ประวัติศาสตร์และวัฒนธรรมของภาคอีสาน จัดแสดงโบราณวัตถุ เครื่องมือเครื่องใช้ และวิถีชีวิตชาวภูพาน",
    imageUrl: "/PhuPhanMuseum.jpg",
    category: "cultural",
    mapUrl: "https://maps.google.com/?q=พิพิธภัณฑ์ภูพาน",
    distance: "40 กม.",
    highlight: "เรียนรู้วัฒนธรรมอีสาน",
  },
];

const categories = [
  { id: "all", name: "ทั้งหมด", icon: Compass },
  { id: "temple", name: "วัด/พระธาตุ", icon: Building2 },
  { id: "nature", name: "ธรรมชาติ", icon: TreePine },
  { id: "cultural", name: "วัฒนธรรม", icon: Sparkles },
  { id: "landmark", name: "สถานที่สำคัญ", icon: MapPin },
];

const getCategoryStyle = (category: string | null | undefined) => {
  switch (category) {
    case "temple":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "nature":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    case "cultural":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "landmark":
      return {
        bg: "bg-cyan-100",
        text: "text-cyan-700",
        border: "border-cyan-200",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
};

const getCategoryName = (category: string | null | undefined) => {
  const cat = categories.find((c) => c.id === category);
  return cat?.name || "ทั่วไป";
};

export function AttractionsSection({ attractions }: AttractionsSectionProps) {
  const activeAttractions =
    attractions && attractions.length > 0 ? attractions : defaultAttractions;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredAttractions =
    selectedCategory === "all"
      ? activeAttractions
      : activeAttractions.filter((a) => a.category === selectedCategory);

  return (
    <section
      id="attractions"
      className="py-20 md:py-28 bg-gradient-to-b from-kram-50 via-white to-cyan-50/30 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200/30 to-gold-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
            <Compass className="w-4 h-4" />
            เที่ยวสกลนคร
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-kram-900 mb-4 premium-underline">
            สถานที่ท่องเที่ยว
          </h2>
          <p className="text-kram-600 max-w-2xl mx-auto text-lg mt-6">
            สำรวจสถานที่ท่องเที่ยวเด่นๆ ในจังหวัดสกลนคร
            <br className="hidden md:block" />
            ดินแดนแห่ง 3 ธรรม ธรรมะ ธรรมชาติ และวัฒนธรรม
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-kram-700 text-white shadow-lg shadow-kram-700/25 scale-105"
                    : "bg-white text-kram-600 hover:bg-kram-50 border border-kram-200 hover:border-kram-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Attractions Grid */}
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-16">
            <Compass className="w-16 h-16 text-kram-200 mx-auto mb-4" />
            <p className="text-kram-400 text-lg">
              ยังไม่มีสถานที่ท่องเที่ยวในหมวดนี้
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredAttractions.map((attraction, index) => {
              const catStyle = getCategoryStyle(attraction.category);
              const isHovered = hoveredId === attraction.id;
              const isFirst = index === 0;

              return (
                <div
                  key={attraction.id}
                  className={cn(
                    "group relative rounded-2xl overflow-hidden bg-white shadow-lg shadow-kram-900/5",
                    "transition-all duration-500 hover:shadow-2xl hover:shadow-kram-900/15",
                    isFirst && "md:col-span-2 md:row-span-2"
                  )}
                  onMouseEnter={() => setHoveredId(attraction.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image Container */}
                  <div
                    className={cn(
                      "relative overflow-hidden",
                      isFirst ? "aspect-[16/10]" : "aspect-[4/3]"
                    )}
                  >
                    {attraction.imageUrl ? (
                      <Image
                        src={attraction.imageUrl}
                        alt={attraction.name}
                        fill
                        className={cn(
                          "object-cover transition-all duration-700",
                          isHovered ? "scale-110" : "scale-100"
                        )}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                        <Compass className="w-16 h-16 text-kram-300" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
                        "transition-opacity duration-500",
                        isHovered ? "opacity-90" : "opacity-70"
                      )}
                    />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm",
                          catStyle.bg,
                          catStyle.text,
                          "border",
                          catStyle.border
                        )}
                      >
                        {getCategoryName(attraction.category)}
                      </span>
                    </div>

                    {/* Highlight Badge */}
                    {attraction.highlight && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold-500 text-white text-xs font-bold rounded-full shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          {attraction.highlight}
                        </span>
                      </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h3
                        className={cn(
                          "font-bold text-white mb-2 transition-all duration-300",
                          isFirst ? "text-2xl md:text-3xl" : "text-xl"
                        )}
                      >
                        {attraction.name}
                      </h3>

                      {/* Description - shows on hover or always for first item */}
                      <p
                        className={cn(
                          "text-white/90 text-sm leading-relaxed transition-all duration-500",
                          isFirst ? "line-clamp-3" : "line-clamp-2",
                          !isFirst && !isHovered && "opacity-0 translate-y-4",
                          (isFirst || isHovered) && "opacity-100 translate-y-0"
                        )}
                      >
                        {attraction.description}
                      </p>

                      {/* Actions */}
                      <div
                        className={cn(
                          "flex items-center gap-3 mt-4 transition-all duration-500",
                          !isFirst && !isHovered && "opacity-0 translate-y-4",
                          (isFirst || isHovered) && "opacity-100 translate-y-0"
                        )}
                      >
                        {attraction.distance && (
                          <span className="inline-flex items-center gap-1.5 text-white/80 text-xs">
                            <Navigation className="w-3.5 h-3.5" />
                            ห่าง {attraction.distance}
                          </span>
                        )}
                        {attraction.mapUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                            asChild
                          >
                            <a
                              href={attraction.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="w-3.5 h-3.5 mr-1.5" />
                              ดูแผนที่
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-kram-500 text-sm mb-4">
            มาร่วมประชุมวิชาการและสัมผัสเสน่ห์สกลนคร
          </p>
          <div className="inline-flex items-center gap-2 text-kram-600 text-sm">
            <MapPin className="w-4 h-4 text-cyan-500" />
            <span>
              ข้อมูลเพิ่มเติมจาก การท่องเที่ยวแห่งประเทศไทย สำนักงานสกลนคร
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
