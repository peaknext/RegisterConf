import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  1: { label: "รอตรวจสอบ", variant: "outline", icon: Clock },
  2: { label: "ผ่าน", variant: "default", icon: CheckCircle },
  9: { label: "ไม่ผ่าน", variant: "destructive", icon: XCircle },
};

async function getFinances(memberId: number, hospitalCode: string | null) {
  if (!hospitalCode) return [];

  return prisma.finance.findMany({
    where: {
      member: {
        hospitalCode,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PaymentStatusPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const finances = await getFinances(
    parseInt(session.user.id),
    session.user.hospitalCode
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบการชำระเงิน</h1>
        <p className="text-gray-500">ดูสถานะการชำระเงินทั้งหมด</p>
      </div>

      {finances.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ยังไม่มีรายการแจ้งชำระเงิน</p>
              <Link
                href="/portal/payment"
                className="text-primary hover:underline mt-2 inline-block"
              >
                แจ้งชำระเงิน
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {finances.map((finance) => {
            const status = statusMap[finance.status] || statusMap[1];
            const StatusIcon = status.icon;
            const attendeeCount = finance.attendeeIds?.split(",").length || 0;

            return (
              <Card key={finance.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        รายการ #{finance.id}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        ส่งเมื่อ: {formatDate(finance.createdAt)}
                      </p>
                    </div>
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">จำนวนผู้ลงทะเบียน</p>
                      <p className="font-medium">{attendeeCount} คน</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">วันที่ยืนยัน</p>
                      <p className="font-medium">
                        {finance.confirmedAt ? formatDate(finance.confirmedAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">หลักฐานการชำระเงิน</p>
                      {finance.fileName ? (
                        <a
                          href={finance.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          ดูหลักฐาน
                        </a>
                      ) : (
                        <p className="font-medium">-</p>
                      )}
                    </div>
                  </div>

                  {finance.status === 9 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                      <p className="font-medium">หลักฐานไม่ผ่านการตรวจสอบ</p>
                      <p>กรุณาติดต่อผู้จัดงานเพื่อสอบถามรายละเอียดเพิ่มเติม</p>
                    </div>
                  )}

                  {finance.status === 2 && finance.paidDate && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
                      <p className="font-medium">ชำระเงินเรียบร้อยแล้ว</p>
                      <p>วันที่ชำระ: {formatDate(finance.paidDate)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
