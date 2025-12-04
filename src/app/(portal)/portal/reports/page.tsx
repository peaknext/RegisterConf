import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButtons } from "@/components/portal/ExportButtons";
import { FileText, Users, CreditCard, Plane } from "lucide-react";

async function getReportData(hospitalCode: string | null) {
  if (!hospitalCode) {
    return { attendees: [], finances: [] };
  }

  const [attendees, finances] = await Promise.all([
    prisma.attendee.findMany({
      where: { hospitalCode },
      include: {
        regType: true,
        position: true,
        level: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.finance.findMany({
      where: {
        member: { hospitalCode },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { attendees, finances };
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const { attendees, finances } = await getReportData(session.user.hospitalCode);

  const reportTypes = [
    {
      id: "attendees",
      title: "รายชื่อผู้ลงทะเบียน",
      description: "รายชื่อผู้ลงทะเบียนทั้งหมดพร้อมข้อมูลติดต่อ",
      icon: Users,
      count: attendees.length,
    },
    {
      id: "payment",
      title: "รายงานการชำระเงิน",
      description: "สรุปการชำระเงินและสถานะ",
      icon: CreditCard,
      count: finances.length,
    },
    {
      id: "travel",
      title: "รายงานการเดินทาง",
      description: "ข้อมูลการเดินทางของผู้ลงทะเบียน",
      icon: Plane,
      count: attendees.filter((a) => a.vehicleType).length,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงาน</h1>
        <p className="text-gray-500">ดาวน์โหลดรายงานข้อมูลการลงทะเบียน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <report.icon className="w-5 h-5" />
                    {report.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {report.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary mb-4">
                {report.count} <span className="text-sm font-normal text-gray-500">รายการ</span>
              </p>
              <ExportButtons
                reportType={report.id}
                hospitalCode={session.user.hospitalCode || ""}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            รายงานฉบับเต็ม
          </CardTitle>
          <CardDescription>
            ดาวน์โหลดข้อมูลทั้งหมดในรูปแบบ Excel หรือ CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButtons
            reportType="full"
            hospitalCode={session.user.hospitalCode || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
