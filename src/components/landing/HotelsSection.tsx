"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Bus, Building2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Hotel {
  id: number;
  name: string;
  phone?: string | null;
  website?: string | null;
  mapUrl?: string | null;
  busFlag: string;
  imageUrl?: string | null;
  rating?: number | null;
  priceRange?: string | null;
}

interface HotelsSectionProps {
  hotels?: Hotel[];
}

// Default mock hotels data
const defaultHotels: Hotel[] = [
  {
    id: 1,
    name: "โรงแรมพูลแมน ขอนแก่น ราชา ออคิด",
    phone: "043-322-155",
    website: "https://www.pullmankhonkaen.com",
    mapUrl: "https://maps.google.com/?q=Pullman+Khon+Kaen",
    busFlag: "Y",
    imageUrl: "/hotel_001.png",
    rating: 5,
    priceRange: "฿฿฿฿",
  },
  {
    id: 2,
    name: "โรงแรมอวานี ขอนแก่น",
    phone: "043-390-888",
    website: "https://www.avanihotels.com/khonkaen",
    mapUrl: "https://maps.google.com/?q=Avani+Khon+Kaen",
    busFlag: "Y",
    imageUrl: "/hotel_002.png",
    rating: 5,
    priceRange: "฿฿฿฿",
  },
  {
    id: 3,
    name: "โรงแรมเซ็นทารา ขอนแก่น",
    phone: "043-284-999",
    website: "https://www.centarahotelsresorts.com",
    mapUrl: "https://maps.google.com/?q=Centara+Khon+Kaen",
    busFlag: "Y",
    imageUrl: "/hotel_003.png",
    rating: 4,
    priceRange: "฿฿฿",
  },
  {
    id: 4,
    name: "โรงแรมโฆษะ ขอนแก่น",
    phone: "043-225-014",
    website: "https://www.kosahotel.com",
    mapUrl: "https://maps.google.com/?q=Kosa+Hotel+Khon+Kaen",
    busFlag: "N",
    imageUrl: "/hotel_004.png",
    rating: 4,
    priceRange: "฿฿฿",
  },
  {
    id: 5,
    name: "โรงแรมเจริญธานี ขอนแก่น",
    phone: "043-220-400",
    website: "https://www.charoenthani.com",
    mapUrl: "https://maps.google.com/?q=Charoen+Thani+Khon+Kaen",
    busFlag: "N",
    imageUrl: "/hotel_005.png",
    rating: 4,
    priceRange: "฿฿",
  },
  {
    id: 6,
    name: "โรงแรมราชาวดี รีสอร์ท",
    phone: "043-393-222",
    website: null,
    mapUrl: "https://maps.google.com/?q=Rachawadee+Resort+Khon+Kaen",
    busFlag: "N",
    imageUrl: "/hotel_006.png",
    rating: 3,
    priceRange: "฿฿",
  },
];

export function HotelsSection({ hotels }: HotelsSectionProps) {
  const activeHotels = hotels && hotels.length > 0 ? hotels : defaultHotels;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section id="hotels" className="py-16 md:py-20 bg-gradient-to-b from-white to-kram-50/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Section Header - Compact */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full mb-3">
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              ที่พัก
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-kram-900 premium-underline">โรงแรมที่พัก</h2>
            <p className="text-kram-600 text-sm mt-4">รายการโรงแรมที่พักสำหรับผู้เข้าร่วมงานประชุม</p>
          </div>

          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                canScrollLeft
                  ? "bg-white shadow-md hover:shadow-lg text-kram-700 hover:bg-kram-50"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                canScrollRight
                  ? "bg-white shadow-md hover:shadow-lg text-kram-700 hover:bg-kram-50"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeHotels.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-kram-300 mx-auto mb-3" />
            <p className="text-kram-400">ยังไม่มีข้อมูลโรงแรม</p>
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {activeHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
                >
                  <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    {/* Hotel Image */}
                    <div className="relative h-40 bg-kram-100 overflow-hidden">
                      {hotel.imageUrl ? (
                        <Image
                          src={hotel.imageUrl}
                          alt={hotel.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-kram-300" />
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Rating & Price */}
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                        {hotel.rating && (
                          <div className="flex items-center gap-0.5">
                            {[...Array(hotel.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                            ))}
                          </div>
                        )}
                        {hotel.priceRange && (
                          <span className="text-xs text-white/90 font-medium">{hotel.priceRange}</span>
                        )}
                      </div>

                      {/* Shuttle badge */}
                      {hotel.busFlag === "Y" && (
                        <div className="absolute top-2 right-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-[10px] font-medium rounded-full shadow-md">
                            <Bus className="w-3 h-3" />
                            รถรับ-ส่ง
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hotel Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-kram-800 text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-kram-600 transition-colors">
                        {hotel.name}
                      </h3>

                      {hotel.phone && (
                        <a
                          href={`tel:${hotel.phone}`}
                          className="flex items-center gap-2 text-xs text-kram-500 hover:text-kram-700 mb-3"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{hotel.phone}</span>
                        </a>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {hotel.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-kram-200 text-kram-600 hover:bg-kram-50"
                            asChild
                          >
                            <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-3.5 h-3.5 mr-1" />
                              เว็บไซต์
                            </a>
                          </Button>
                        )}
                        {hotel.mapUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                            asChild
                          >
                            <a href={hotel.mapUrl} target="_blank" rel="noopener noreferrer">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              แผนที่
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile scroll indicator */}
            <div className="flex justify-center gap-1.5 mt-4 md:hidden">
              {activeHotels.map((_, idx) => (
                <div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-kram-200"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
