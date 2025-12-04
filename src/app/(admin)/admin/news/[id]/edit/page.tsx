import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NewsForm } from "@/components/admin/NewsForm";

async function getNews(id: number) {
  return prisma.news.findUnique({ where: { id } });
}

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(parseInt(id));

  if (!news) {
    notFound();
  }

  return <NewsForm news={news} />;
}
