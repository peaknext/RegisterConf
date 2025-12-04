import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Edit, Eye, EyeOff, ArrowUpDown } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

async function getSlideshows() {
  return prisma.slideshow.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export default async function SlideshowPage() {
  const slideshows = await getSlideshows();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสไลด์โชว์</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข ลบสไลด์ภาพหน้าแรก</p>
        </div>
        <Link href="/admin/slideshow/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสไลด์
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสไลด์ ({slideshows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {slideshows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>ยังไม่มีสไลด์</p>
              <Link
                href="/admin/slideshow/new"
                className="text-primary hover:underline"
              >
                เพิ่มสไลด์แรก
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slideshows.map((slide) => (
                <div
                  key={slide.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || "Slide"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {slide.isActive ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          แสดง
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          ซ่อน
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="bg-white">
                        <ArrowUpDown className="w-3 h-3 mr-1" />
                        {slide.sortOrder}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">
                      {slide.title || "ไม่มีชื่อ"}
                    </h3>
                    {slide.linkUrl && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        Link: {slide.linkUrl}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      <Link href={`/admin/slideshow/${slide.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteButton
                        id={slide.id}
                        type="slideshow"
                        title={slide.title || `สไลด์ ${slide.id}`}
                      />
                    </div>
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
