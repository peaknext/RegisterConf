import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Clock, MapPin, User } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

async function getSchedules() {
  return prisma.schedule.findMany({
    orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
  });
}

export default async function SchedulePage() {
  const schedules = await getSchedules();

  // Group by day
  const byDay = schedules.reduce((acc, s) => {
    if (!acc[s.dayNumber]) acc[s.dayNumber] = [];
    acc[s.dayNumber].push(s);
    return acc;
  }, {} as Record<number, typeof schedules>);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการกำหนดการ</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข ลบกำหนดการ</p>
        </div>
        <Link href="/admin/schedule/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มกำหนดการ
          </Button>
        </Link>
      </div>

      {Object.keys(byDay).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p>ยังไม่มีกำหนดการ</p>
              <Link
                href="/admin/schedule/new"
                className="text-primary hover:underline"
              >
                เพิ่มกำหนดการแรก
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(byDay).map(([day, items]) => (
          <Card key={day}>
            <CardHeader>
              <CardTitle>
                วันที่ {day}
                {items[0]?.date && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({formatDate(items[0].date)})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        {item.startTime} - {item.endTime}
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        )}
                        {item.speaker && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/schedule/${item.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteButton
                        id={item.id}
                        type="schedule"
                        title={item.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
