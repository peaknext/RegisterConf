import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ScheduleForm } from "@/components/admin/ScheduleForm";

async function getSchedule(id: number) {
  return prisma.schedule.findUnique({ where: { id } });
}

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = await getSchedule(parseInt(id));

  if (!schedule) {
    notFound();
  }

  return <ScheduleForm schedule={schedule} />;
}
