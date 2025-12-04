import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

async function getNews() {
  return prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
  });
}

export default async function NewsPage() {
  const news = await getNews();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการข่าวสาร</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข ลบข่าวสาร</p>
        </div>
        <Link href="/admin/news/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มข่าวสาร
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการข่าวสาร ({news.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>ยังไม่มีข่าวสาร</p>
              <Link
                href="/admin/news/new"
                className="text-primary hover:underline"
              >
                เพิ่มข่าวสารแรก
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      {item.isPublished ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          เผยแพร่
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          ซ่อน
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(item.publishedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/news/${item.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton
                      id={item.id}
                      type="news"
                      title={item.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
