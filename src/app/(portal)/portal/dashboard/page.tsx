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
  Zap,
} from "lucide-react";
import Link from "next/link";

// Animation delay classes for staggered reveals
const staggerDelay = [
  "animate-fade-in [animation-delay:0ms]",
  "animate-fade-in [animation-delay:100ms]",
  "animate-fade-in [animation-delay:200ms]",
  "animate-fade-in [animation-delay:300ms]",
];

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
    gradient: "from-kram-500 via-kram-600 to-cyan-600",
    iconBg: "bg-gradient-to-br from-kram-100 to-cyan-100",
    iconColor: "text-kram-600",
    glowColor: "shadow-kram-500/20",
    accentLine: "from-kram-500 to-cyan-500",
  },
  {
    key: "pendingPayment",
    label: "รอชำระเงิน",
    unit: "รายการ",
    icon: Clock,
    gradient: "from-amber-400 via-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    glowColor: "shadow-amber-500/20",
    accentLine: "from-amber-400 to-orange-500",
  },
  {
    key: "pendingConfirmation",
    label: "รอตรวจสอบการชำระ",
    unit: "รายการ",
    icon: CreditCard,
    gradient: "from-cyan-400 via-cyan-500 to-teal-500",
    iconBg: "bg-gradient-to-br from-cyan-100 to-teal-100",
    iconColor: "text-cyan-600",
    glowColor: "shadow-cyan-500/20",
    accentLine: "from-cyan-400 to-teal-500",
  },
  {
    key: "confirmed",
    label: "ชำระแล้ว",
    unit: "รายการ",
    icon: CheckCircle,
    gradient: "from-emerald-400 via-emerald-500 to-cyan-500",
    iconBg: "bg-gradient-to-br from-emerald-100 to-cyan-100",
    iconColor: "text-emerald-600",
    glowColor: "shadow-emerald-500/20",
    accentLine: "from-emerald-400 to-cyan-500",
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
      {/* Header with staggered animation */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          {/* Animated welcome badge with glow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500/10 via-kram-500/10 to-cyan-500/10 text-kram-700 text-sm font-medium rounded-full mb-4 border border-cyan-200/50 shadow-sm shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-shadow">
            <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="bg-gradient-to-r from-kram-700 to-cyan-600 bg-clip-text text-transparent font-semibold">
              ยินดีต้อนรับ
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
            หน้าแรก
          </h1>
          <p className="text-kram-500 mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {isAdmin ? "ภาพรวมการลงทะเบียนของโรงพยาบาล" : "ระบบลงทะเบียนงานประชุมวิชาการ"}
          </p>
        </div>
        {/* Event badge with floating effect */}
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-cyan-200/60 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/15 hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-kram-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs text-kram-500 font-medium">Conference</span>
            <p className="text-sm font-bold text-kram-800">งานประชุมวิชาการ 2569</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Only show for admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const value = stats[stat.key as keyof typeof stats];
            return (
              <Card
                key={stat.key}
                className={`group relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg ${stat.glowColor} hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${staggerDelay[index]}`}
              >
                {/* Top gradient accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accentLine} opacity-80 group-hover:opacity-100 transition-opacity`}
                />
                {/* Subtle corner glow on hover */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />

                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                  <CardTitle className="text-sm font-medium text-kram-600">
                    {stat.label}
                  </CardTitle>
                  <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-br from-kram-800 to-kram-900 bg-clip-text text-transparent">
                      {value}
                    </span>
                    <span className="text-sm text-kram-400 font-medium">{stat.unit}</span>
                  </div>
                  {/* Micro progress indicator */}
                  <div className="mt-3 h-1 w-full bg-kram-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.accentLine} rounded-full transition-all duration-1000`}
                      style={{ width: value > 0 ? '100%' : '0%' }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg shadow-kram-900/5 animate-fade-in [animation-delay:400ms]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-kram-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-kram-800 to-kram-900 bg-clip-text text-transparent">
                  {isAdmin ? "การดำเนินการด่วน" : "เมนูหลัก"}
                </CardTitle>
                <p className="text-sm text-kram-500 mt-0.5">
                  {isAdmin ? "เข้าถึงฟังก์ชันหลักได้อย่างรวดเร็ว" : "เลือกเมนูที่ต้องการใช้งาน"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br from-white via-white to-kram-50/30 border border-kram-100/80 hover:border-cyan-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 overflow-hidden ${staggerDelay[index]}`}
                >
                  {/* Background glow on hover */}
                  <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-500`} />

                  {/* Icon with gradient background and glow */}
                  <div
                    className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                    {/* Subtle ring effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-30 blur-md -z-10 scale-150 transition-opacity duration-300`} />
                  </div>

                  <h3 className="font-bold text-kram-900 mb-1.5 group-hover:text-kram-700 transition-colors text-lg">
                    {action.title}
                  </h3>
                  <p className="text-sm text-kram-500 leading-relaxed">
                    {action.description}
                  </p>

                  {/* Arrow indicator with animation */}
                  <div className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-kram-600" />
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card - Help & Contact */}
      <Card className="group relative border-0 overflow-hidden shadow-xl shadow-kram-900/20 animate-fade-in [animation-delay:500ms]">
        {/* Gradient background with animated shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-kram-700 via-kram-800 to-kram-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-kram-500/30 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Help icon */}
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  ต้องการความช่วยเหลือ?
                </h3>
                <p className="text-kram-200 text-sm leading-relaxed">
                  ติดต่อทีมงานได้ที่{" "}
                  <span className="text-cyan-300 font-medium">saraban_skonpho@moph.go.th</span>
                  {" "}หรือ{" "}
                  <span className="text-cyan-300 font-medium">042-711157</span>
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 font-medium text-white border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10 group/btn"
            >
              <span>กลับหน้าแรก</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
