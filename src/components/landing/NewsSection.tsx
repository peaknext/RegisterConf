/**
 * News section component for landing page.
 *
 * Features:
 * - Grid layout with featured first article (large)
 * - Card design with image, date, title, excerpt
 * - Fallback to mock data when no news provided
 * - Thai date formatting
 * - HTML tag stripping from content
 * - Hover effects and animations
 *
 * @module components/landing/NewsSection
 *
 * @example
 * const news = await prisma.news.findMany({ where: { isPublished: true } });
 * <NewsSection news={news} />
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * News article data structure.
 */
interface NewsItem {
  /** Database ID */
  id: number;
  /** Article title */
  title: string;
  /** Article content (may contain HTML) */
  content: string;
  /** Featured image URL (optional) */
  imageUrl?: string | null;
  /** Publication date */
  publishedAt: Date;
}

/**
 * Props for the NewsSection component.
 */
interface NewsSectionProps {
  /** News articles to display (falls back to mock data if empty) */
  news?: NewsItem[];
}

/**
 * Default mock news data for development/demo.
 */
const defaultNews: NewsItem[] = [
  {
    id: 1,
    title: "เปิดรับลงทะเบียนงานประชุมวิชาการพัฒนาศักยภาพผู้บริหาร ประจำปี 2569",
    content: "ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป กระทรวงสาธารณสุข ขอเชิญผู้บริหารโรงพยาบาลและบุคลากรทางการแพทย์ร่วมงานประชุมวิชาการประจำปี 2569 ณ โรงแรมพูลแมน ขอนแก่น ราชา ออคิด ระหว่างวันที่ 25-27 มิถุนายน 2569 พบกับวิทยากรผู้ทรงคุณวุฒิและการแลกเปลี่ยนประสบการณ์จากโรงพยาบาลชั้นนำทั่วประเทศ",
    imageUrl: "/news_001.png",
    publishedAt: new Date("2025-12-01"),
  },
  {
    id: 2,
    title: "ประกาศรายชื่อโรงแรมที่พักสำหรับผู้เข้าร่วมประชุม",
    content: "คณะผู้จัดงานได้ประสานงานจองห้องพักในราคาพิเศษสำหรับผู้ลงทะเบียนเข้าร่วมประชุม สามารถเลือกจองห้องพักได้หลายโรงแรมใกล้สถานที่จัดงาน กรุณาจองล่วงหน้าเนื่องจากห้องพักมีจำนวนจำกัด",
    imageUrl: "/news_002.png",
    publishedAt: new Date("2025-11-28"),
  },
  {
    id: 3,
    title: "กำหนดการส่งผลงานวิชาการและ Poster Presentation",
    content: "เปิดรับผลงานวิชาการเพื่อนำเสนอในรูปแบบ Oral และ Poster Presentation หมดเขตส่งผลงาน 31 มีนาคม 2569 ประกาศผลการพิจารณา 30 เมษายน 2569",
    imageUrl: "/news_003.png",
    publishedAt: new Date("2025-11-25"),
  },
];

/**
 * News section with grid layout.
 *
 * @component
 * @param props - Component props
 * @param props.news - News articles from database (optional)
 */
export function NewsSection({ news }: NewsSectionProps) {
  /** Use provided news or fall back to mock data */
  const activeNews = news && news.length > 0 ? news : defaultNews;

  /**
   * Format date in Thai locale.
   * @param date - Date to format
   * @returns Thai formatted date string
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section id="news" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-kram-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-kram-100 text-kram-700 text-sm font-semibold rounded-full mb-4">
            อัพเดทล่าสุด
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-kram-900 mb-4 premium-underline">
            ข่าวสารและประกาศ
          </h2>
          <p className="text-kram-600 max-w-2xl mx-auto text-lg mt-6">
            ติดตามข่าวสารและประกาศล่าสุดเกี่ยวกับงานประชุมวิชาการ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {activeNews.map((item, index) => (
              <Card
                key={item.id}
                className={cn(
                  "group overflow-hidden border-0 shadow-lg shadow-kram-900/5 hover:shadow-xl hover:shadow-kram-900/10 transition-all duration-500 hover:-translate-y-2 bg-white",
                  index === 0 && "lg:col-span-2 lg:row-span-2"
                )}
              >
                {item.imageUrl && (
                  <div className={cn(
                    "relative overflow-hidden bg-kram-100",
                    index === 0 ? "aspect-[16/9]" : "aspect-video"
                  )}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kram-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <CardContent className={cn("p-6", index === 0 && "lg:p-8")}>
                  <div className="flex items-center gap-2 text-sm text-kram-500 mb-3">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className={cn(
                    "font-bold text-kram-800 mb-3 line-clamp-2 group-hover:text-kram-600 transition-colors",
                    index === 0 ? "text-xl lg:text-2xl" : "text-lg"
                  )}>
                    {item.title}
                  </h3>
                  <p className={cn(
                    "text-kram-600 leading-relaxed",
                    index === 0 ? "line-clamp-4" : "line-clamp-2 text-sm"
                  )}>
                    {item.content.replace(/<[^>]*>/g, "")}
                  </p>
                  <div className="mt-4 flex items-center text-kram-500 text-sm font-medium group-hover:text-cyan-600 transition-colors">
                    <span>อ่านต่อ</span>
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
