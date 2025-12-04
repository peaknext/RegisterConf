import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, CreditCard, Building2, Newspaper } from "lucide-react";
import Link from "next/link";

async function getAdminStats() {
  const [
    totalAttendees,
    pendingPayments,
    totalMembers,
    totalHospitals,
    totalNews,
    totalSchedules,
  ] = await Promise.all([
    prisma.attendee.count(),
    prisma.finance.count({ where: { status: 1 } }),
    prisma.member.count(),
    prisma.hospital.count(),
    prisma.news.count(),
    prisma.schedule.count(),
  ]);

  // Attendee status breakdown
  const byStatus = await prisma.attendee.groupBy({
    by: ["status"],
    _count: true,
  });

  return {
    totalAttendees,
    pendingPayments,
    totalMembers,
    totalHospitals,
    totalNews,
    totalSchedules,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<number, number>),
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      title: "ผู้ลงทะเบียนทั้งหมด",
      value: stats.totalAttendees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/attendees",
    },
    {
      title: "รอตรวจสอบชำระเงิน",
      value: stats.pendingPayments,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/admin/payments",
    },
    {
      title: "สมาชิก (ตัวแทน รพ.)",
      value: stats.totalMembers,
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/members",
    },
    {
      title: "โรงพยาบาล",
      value: stats.totalHospitals,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/hospitals",
    },
    {
      title: "ข่าวสาร",
      value: stats.totalNews,
      icon: Newspaper,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      href: "/admin/news",
    },
    {
      title: "กำหนดการ",
      value: stats.totalSchedules,
      icon: Calendar,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      href: "/admin/schedule",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">ภาพรวมระบบลงทะเบียนงานประชุม</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>สถานะผู้ลงทะเบียน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.byStatus[1] || 0}
              </p>
              <p className="text-sm text-yellow-700">ค้างชำระ</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {stats.byStatus[2] || 0}
              </p>
              <p className="text-sm text-orange-700">รอตรวจสอบ</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus[9] || 0}
              </p>
              <p className="text-sm text-green-700">ชำระแล้ว</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stats.byStatus[3] || 0}
              </p>
              <p className="text-sm text-red-700">ยกเลิก</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/payments"
              className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-center"
            >
              <CreditCard className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <h3 className="font-semibold">ตรวจสอบการชำระเงิน</h3>
              <p className="text-sm text-gray-500">
                {stats.pendingPayments} รายการรอตรวจสอบ
              </p>
            </Link>
            <Link
              href="/admin/news/new"
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-center"
            >
              <Newspaper className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-semibold">เพิ่มข่าวสาร</h3>
              <p className="text-sm text-gray-500">สร้างข่าวใหม่</p>
            </Link>
            <Link
              href="/admin/schedule/new"
              className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-semibold">เพิ่มกำหนดการ</h3>
              <p className="text-sm text-gray-500">สร้างกำหนดการใหม่</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
