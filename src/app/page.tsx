import { prisma } from "@/lib/prisma";
import {
  Navbar,
  Hero,
  NewsSection,
  ScheduleSection,
  HotelsSection,
  AttractionsSection,
  PhotosSection,
  Footer,
  ScrollProgress,
  BackToTop,
  WaveDivider,
} from "@/components/landing";

async function getLandingPageData() {
  const [slideshows, news, schedules, hotels, attractions, siteConfig, footerInfo] = await Promise.all([
    prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    prisma.schedule.findMany({
      orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.hotel.findMany({
      where: { status: "y" },
      orderBy: { id: "asc" },
    }),
    // Attractions - uses mock data in component when empty
    Promise.resolve([]),
    prisma.siteConfig.findFirst(),
    prisma.footerInfo.findMany(),
  ]);

  // Convert footer info array to object
  const footerData = footerInfo.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    slideshows,
    news,
    schedules,
    hotels,
    attractions,
    googleDriveUrl: siteConfig?.googleDriveUrl,
    footerInfo: {
      organizerName: footerData.organizer_name,
      address: footerData.address,
      phone: footerData.phone,
      email: footerData.email,
      fax: footerData.fax,
    },
  };
}

export default async function Home() {
  const { slideshows, news, schedules, hotels, attractions, googleDriveUrl, footerInfo } =
    await getLandingPageData();

  return (
    <main className="min-h-screen bg-background noise-overlay">
      <ScrollProgress />
      <Navbar />
      <Hero slides={slideshows} />

      <NewsSection news={news} />
      <ScheduleSection schedules={schedules} />
      <HotelsSection hotels={hotels} />
      <AttractionsSection attractions={attractions} />
      <PhotosSection googleDriveUrl={googleDriveUrl} />
      <WaveDivider fillColor="#040b56" />
      <Footer footerInfo={footerInfo} />
      <BackToTop />
    </main>
  );
}
