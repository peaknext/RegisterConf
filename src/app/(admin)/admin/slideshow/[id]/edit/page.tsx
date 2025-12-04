import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SlideshowForm } from "@/components/admin/SlideshowForm";

async function getSlideshow(id: number) {
  return prisma.slideshow.findUnique({ where: { id } });
}

export default async function EditSlideshowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slideshow = await getSlideshow(parseInt(id));

  if (!slideshow) {
    notFound();
  }

  return <SlideshowForm slideshow={slideshow} />;
}
