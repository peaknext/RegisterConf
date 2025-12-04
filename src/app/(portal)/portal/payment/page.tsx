import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PaymentForm } from "@/components/portal/PaymentForm";

async function getPendingAttendees(hospitalCode: string | null) {
  if (!hospitalCode) return [];

  return prisma.attendee.findMany({
    where: {
      hospitalCode,
      status: 1, // ค้างชำระ
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getSettings() {
  return prisma.setting.findFirst();
}

export default async function PaymentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [attendees, settings] = await Promise.all([
    getPendingAttendees(session.user.hospitalCode),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แจ้งชำระเงิน</h1>
        <p className="text-gray-500">อัปโหลดหลักฐานการชำระเงินสำหรับผู้ลงทะเบียน</p>
      </div>

      {/* Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการชำระเงิน</CardTitle>
          <CardDescription>โอนเงินเข้าบัญชีด้านล่าง</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">ธนาคาร</p>
              <p className="font-medium">{settings?.accountBank || "ธนาคารกรุงไทย"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">ชื่อบัญชี</p>
              <p className="font-medium">{settings?.accountName || "กองบริหารการสาธารณสุข"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">เลขที่บัญชี</p>
              <p className="font-medium text-lg">{settings?.accountNo || "xxx-x-xxxxx-x"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">ค่าลงทะเบียน</p>
              <p className="font-medium text-lg text-primary">
                {settings?.meetPrice ? `${settings.meetPrice.toLocaleString()} บาท/คน` : "ติดต่อผู้จัด"}
              </p>
            </div>
          </div>
          {settings?.condition1 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
              <p className="font-medium text-yellow-800 mb-1">เงื่อนไขการชำระเงิน</p>
              <div className="text-yellow-700" dangerouslySetInnerHTML={{ __html: settings.condition1 }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form */}
      <PaymentForm attendees={attendees} memberId={parseInt(session.user.id)} />
    </div>
  );
}
