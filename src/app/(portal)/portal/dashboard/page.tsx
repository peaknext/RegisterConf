import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

async function getDashboardStats(hospitalCode: string | null) {
  if (!hospitalCode) {
    return {
      totalAttendees: 0,
      pendingPayment: 0,
      confirmed: 0,
      pendingConfirmation: 0,
    };
  }

  const [totalAttendees, finances] = await Promise.all([
    prisma.attendee.count({
      where: { hospitalCode },
    }),
    prisma.finance.findMany({
      where: {
        member: { hospitalCode },
      },
      select: { status: true },
    }),
  ]);

  const pendingPayment = await prisma.attendee.count({
    where: {
      hospitalCode,
      status: 1, // ค้างชำระ
    },
  });

  const confirmed = finances.filter((f) => f.status === 2).length; // ผ่าน
  const pendingConfirmation = finances.filter((f) => f.status === 1).length; // รอตรวจสอบ

  return {
    totalAttendees,
    pendingPayment,
    confirmed,
    pendingConfirmation,
  };
}

const statsConfig = [
  {
    key: "totalAttendees",
    label: "ผู้ลงทะเบียนทั้งหมด",
    unit: "คน",
    icon: Users,
    gradient: "from-kram-500 to-kram-700",
    iconBg: "bg-kram-500/20",
    iconColor: "text-kram-600",
  },
  {
    key: "pendingPayment",
    label: "รอชำระเงิน",
    unit: "รายการ",
    icon: Clock,
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
  },
  {
    key: "pendingConfirmation",
    label: "รอตรวจสอบการชำระ",
    unit: "รายการ",
    icon: CreditCard,
    gradient: "from-orange-500 to-red-500",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-600",
  },
  {
    key: "confirmed",
    label: "ชำระแล้ว",
    unit: "รายการ",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-600",
  },
];

// Quick actions for regular users (memberType = 1)
const userQuickActions = [
  {
    href: "/portal/register",
    icon: Users,
    title: "ลงทะเบียนเข้าร่วมประชุม",
    description: "ลงทะเบียนผู้เข้าร่วมประชุม",
    gradient: "from-kram-500 to-cyan-500",
  },
  {
    href: "/portal/registration",
    icon: CheckCircle,
    title: "ตรวจสอบการลงทะเบียน",
    description: "ดูและแก้ไขรายการผู้ลงทะเบียน",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    href: "/portal/payment",
    icon: CreditCard,
    title: "แจ้งชำระเงิน",
    description: "อัปโหลดหลักฐานการชำระเงิน",
    gradient: "from-amber-500 to-orange-500",
  },
];

// Quick actions for admin (memberType = 99)
const adminQuickActions = [
  {
    href: "/portal/registration",
    icon: Users,
    title: "ตรวจสอบการลงทะเบียน",
    description: "ดูและแก้ไขรายการผู้ลงทะเบียน",
    gradient: "from-kram-500 to-cyan-500",
  },
  {
    href: "/portal/payment",
    icon: CreditCard,
    title: "แจ้งชำระเงิน",
    description: "อัปโหลดหลักฐานการชำระเงิน",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    href: "/portal/payment-status",
    icon: CheckCircle,
    title: "ตรวจสอบสถานะ",
    description: "ดูสถานะการชำระเงิน",
    gradient: "from-emerald-500 to-green-500",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.memberType === 99;
  const stats = await getDashboardStats(session?.user?.hospitalCode ?? null);
  const quickActions = isAdmin ? adminQuickActions : userQuickActions;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kram-100 text-kram-700 text-sm font-medium rounded-full mb-3">
            <Sparkles className="w-4 h-4" />
            ยินดีต้อนรับ
          </div>
          <h1 className="text-3xl font-bold text-kram-900">
            หน้าแรก
          </h1>
          <p className="text-kram-500 mt-1">
            {isAdmin ? "ภาพรวมการลงทะเบียนของโรงพยาบาล" : "ระบบลงทะเบียนงานประชุมวิชาการ"}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-kram-50 rounded-xl border border-cyan-200">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-medium text-kram-700">
            งานประชุมวิชาการ 2569
          </span>
        </div>
      </div>

      {/* Stats Grid - Only show for admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            const value = stats[stat.key as keyof typeof stats];
            return (
              <Card
                key={stat.key}
                className="relative overflow-hidden border-0 shadow-lg shadow-kram-900/5 hover:shadow-xl transition-shadow"
              >
                {/* Gradient accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                  <CardTitle className="text-sm font-medium text-kram-500">
                    {stat.label}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-kram-900">
                      {value}
                    </span>
                    <span className="text-sm text-kram-400">{stat.unit}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg shadow-kram-900/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-kram-900">
                {isAdmin ? "การดำเนินการด่วน" : "เมนูหลัก"}
              </CardTitle>
              <p className="text-sm text-kram-500 mt-1">
                {isAdmin ? "เข้าถึงฟังก์ชันหลักได้อย่างรวดเร็ว" : "เลือกเมนูที่ต้องการใช้งาน"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative p-5 rounded-xl bg-gradient-to-br from-kram-50/50 to-white border border-kram-100 hover:border-kram-200 transition-all hover:shadow-lg"
                >
                  {/* Icon with gradient background */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-kram-900 mb-1 group-hover:text-kram-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-kram-500">
                    {action.description}
                  </p>
                  {/* Arrow indicator */}
                  <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-kram-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-kram-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-0 bg-gradient-to-br from-kram-700 to-kram-900 text-white shadow-xl shadow-kram-900/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">
                ต้องการความช่วยเหลือ?
              </h3>
              <p className="text-kram-200 text-sm">
                ติดต่อทีมงานได้ที่ saraban_skonpho@moph.go.th หรือ 042-711157
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium"
            >
              กลับหน้าแรก
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
