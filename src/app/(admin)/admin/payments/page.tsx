import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { PaymentApprovalButtons } from "@/components/admin/PaymentApprovalButtons";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "รอตรวจสอบ", variant: "outline" },
  2: { label: "ผ่าน", variant: "default" },
  9: { label: "ไม่ผ่าน", variant: "destructive" },
};

async function getPendingPayments() {
  return prisma.finance.findMany({
    where: { status: 1 },
    include: {
      member: {
        include: { hospital: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getAllPayments() {
  return prisma.finance.findMany({
    include: {
      member: {
        include: { hospital: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export default async function PaymentsPage() {
  const [pendingPayments, allPayments] = await Promise.all([
    getPendingPayments(),
    getAllPayments(),
  ]);

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
        <h1 className="text-2xl font-bold text-gray-900">อนุมัติการชำระเงิน</h1>
        <p className="text-gray-500">ตรวจสอบและอนุมัติหลักฐานการชำระเงิน</p>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            รอตรวจสอบ ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-300" />
              <p>ไม่มีรายการรอตรวจสอบ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => {
                const attendeeCount = payment.attendeeIds?.split(",").length || 0;
                return (
                  <div
                    key={payment.id}
                    className="p-4 border rounded-lg bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">รายการ #{payment.id}</span>
                          <Badge variant="outline">รอตรวจสอบ</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          โรงพยาบาล: {payment.member?.hospital?.name || "-"}
                        </p>
                        <p className="text-sm text-gray-600">
                          จำนวน: {attendeeCount} คน
                        </p>
                        <p className="text-sm text-gray-500">
                          ส่งเมื่อ: {formatDate(payment.createdAt)}
                        </p>
                        {payment.fileName && (
                          <a
                            href={payment.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            ดูหลักฐาน
                          </a>
                        )}
                      </div>
                      <PaymentApprovalButtons paymentId={payment.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการชำระเงิน (50 รายการล่าสุด)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">#</th>
                  <th className="pb-3 font-medium text-gray-500">โรงพยาบาล</th>
                  <th className="pb-3 font-medium text-gray-500">จำนวน</th>
                  <th className="pb-3 font-medium text-gray-500">วันที่ส่ง</th>
                  <th className="pb-3 font-medium text-gray-500">สถานะ</th>
                  <th className="pb-3 font-medium text-gray-500">หลักฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allPayments.map((payment) => {
                  const status = statusMap[payment.status] || statusMap[1];
                  const attendeeCount = payment.attendeeIds?.split(",").length || 0;
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3">{payment.id}</td>
                      <td className="py-3">
                        {payment.member?.hospital?.name || "-"}
                      </td>
                      <td className="py-3">{attendeeCount} คน</td>
                      <td className="py-3 text-sm">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3">
                        {payment.fileName && (
                          <a
                            href={payment.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            ดู
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
