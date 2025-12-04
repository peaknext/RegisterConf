import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CheckCircle, Clock, Plane, Bus, Train, Car, Utensils } from "lucide-react";

async function getDetailedStats(hospitalCode: string | null) {
  if (!hospitalCode) {
    return {
      total: 0,
      byStatus: {},
      byVehicle: {},
      byFood: {},
      byRegType: [],
    };
  }

  const attendees = await prisma.attendee.findMany({
    where: { hospitalCode },
    include: { regType: true },
  });

  const byStatus = attendees.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const byVehicle = attendees.reduce((acc, a) => {
    if (a.vehicleType) {
      acc[a.vehicleType] = (acc[a.vehicleType] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const byFood = attendees.reduce((acc, a) => {
    if (a.foodType) {
      acc[a.foodType] = (acc[a.foodType] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const byRegType = Object.entries(
    attendees.reduce((acc, a) => {
      const typeName = a.regType?.name || "ไม่ระบุ";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  return {
    total: attendees.length,
    byStatus,
    byVehicle,
    byFood,
    byRegType,
  };
}

const statusLabels: Record<number, string> = {
  1: "ค้างชำระ",
  2: "รอตรวจสอบ",
  3: "ยกเลิก",
  9: "ชำระแล้ว",
};

const vehicleLabels: Record<number, { label: string; icon: typeof Plane }> = {
  1: { label: "เครื่องบิน", icon: Plane },
  2: { label: "รถบัส", icon: Bus },
  3: { label: "รถไฟ", icon: Train },
  4: { label: "รถส่วนตัว", icon: Car },
};

const foodLabels: Record<number, string> = {
  1: "ปกติ",
  2: "มังสวิรัติ",
  3: "อิสลาม",
};

export default async function StatsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const stats = await getDetailedStats(session.user.hospitalCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500">สรุปข้อมูลการลงทะเบียน</p>
      </div>

      {/* Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            ผู้ลงทะเบียนทั้งหมด
          </CardTitle>
          <Users className="w-5 h-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{stats.total}</div>
          <p className="text-sm text-gray-500 mt-1">คน</p>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ค้างชำระ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.byStatus[1] || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">รอตรวจสอบ</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.byStatus[2] || 0}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ชำระแล้ว</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.byStatus[9] || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ยกเลิก</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.byStatus[3] || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Vehicle Type */}
        <Card>
          <CardHeader>
            <CardTitle>การเดินทาง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(vehicleLabels).map(([key, { label, icon: Icon }]) => {
                const count = stats.byVehicle[parseInt(key)] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="text-sm font-medium">{count} คน</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* By Food Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              ประเภทอาหาร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(foodLabels).map(([key, label]) => {
                const count = stats.byFood[parseInt(key)] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{label}</span>
                      <span className="text-sm font-medium">{count} คน</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* By Registration Type */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ประเภทการลงทะเบียน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.byRegType.map((item) => (
                <div
                  key={item.name}
                  className="p-4 border rounded-lg text-center"
                >
                  <p className="text-2xl font-bold text-primary">{item.count}</p>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
