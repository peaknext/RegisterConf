import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Admin only
  if (session.user.memberType !== 99) {
    redirect("/portal/dashboard");
  }

  // Fetch all data in parallel
  const [
    news,
    schedules,
    footerInfo,
    airlines,
    hospitals,
    hotels,
    zones,
    siteConfig,
    paymentSettings,
  ] = await Promise.all([
    prisma.news.findMany({ orderBy: { publishedAt: "desc" } }),
    prisma.schedule.findMany({
      orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.footerInfo.findMany(),
    prisma.airline.findMany({ orderBy: { name: "asc" } }),
    prisma.hospital.findMany({
      include: { zone: true },
      orderBy: { name: "asc" },
    }),
    prisma.hotel.findMany({ orderBy: { name: "asc" } }),
    prisma.zone.findMany({ orderBy: { code: "asc" } }),
    prisma.siteConfig.findFirst(),
    prisma.setting.findFirst(),
  ]);

  return (
    <SettingsClient
      news={news}
      schedules={schedules}
      footerInfo={footerInfo}
      airlines={airlines}
      hospitals={hospitals}
      hotels={hotels}
      zones={zones}
      siteConfig={siteConfig}
      paymentSettings={paymentSettings}
    />
  );
}
