import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import PaymentClient from "./PaymentClient";
import { CreditCard, Users, Wallet } from "lucide-react";

async function getPageData(hospitalCode: string | null, isAdmin: boolean) {
  const [attendees, settings, adminStats] = await Promise.all([
    // Get pending attendees
    prisma.attendee.findMany({
      where: {
        status: 1,
        ...(isAdmin ? {} : { hospitalCode }),
      },
      select: {
        id: true,
        prefix: true,
        firstName: true,
        lastName: true,
        regTypeId: true,
        phone: true,
        hospital: { select: { name: true } },
        position: { select: { name: true } },
        positionOther: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Get settings
    prisma.setting.findFirst(),
    // Get admin stats
    isAdmin
      ? prisma.attendee.findMany({
          where: { status: 1 },
          select: { regTypeId: true },
        })
      : null,
  ]);

  const meetPrice = settings?.meetPrice ? Number(settings.meetPrice) : 0;
  const meetPriceFollow = settings?.meetPriceFollow
    ? Number(settings.meetPriceFollow)
    : meetPrice;

  let totalPending = 0;
  let totalPendingAmount = 0;

  if (adminStats) {
    totalPending = adminStats.length;
    const followersCount = adminStats.filter((a) => a.regTypeId === 6).length;
    const regularCount = adminStats.filter((a) => a.regTypeId !== 6).length;
    totalPendingAmount = regularCount * meetPrice + followersCount * meetPriceFollow;
  }

  return {
    attendees,
    settings,
    meetPrice,
    meetPriceFollow,
    totalPending,
    totalPendingAmount,
  };
}

export default async function PaymentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.memberType === 99;
  const data = await getPageData(session.user.hospitalCode, isAdmin);

  return (
    <div className="space-y-6">
      {/* Header with KramSakon theme */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-kram-100 to-cyan-100 text-kram-700 text-sm font-medium rounded-full mb-3 border border-kram-200/50">
          <CreditCard className="w-4 h-4 text-kram-600" />
          <span>การชำระเงิน</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
          แจ้งชำระเงิน
        </h1>
        <p className="text-kram-500 mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          อัปโหลดหลักฐานการชำระเงินสำหรับผู้ลงทะเบียน
        </p>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in [animation-delay:100ms]">
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-lg shadow-kram-500/10 p-6 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kram-500 to-cyan-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-kram-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-kram-600" />
              </div>
              <div>
                <p className="text-sm text-kram-500 font-medium">ผู้ค้างชำระทั้งหมด</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-kram-800 to-kram-900 bg-clip-text text-transparent">
                  {data.totalPending.toLocaleString("th-TH")}{" "}
                  <span className="text-base font-normal text-kram-400">คน</span>
                </p>
              </div>
            </div>
          </div>
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border-0 shadow-lg shadow-amber-500/10 p-6 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">ยอดค้างชำระทั้งหมด</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {data.totalPendingAmount.toLocaleString("th-TH")}{" "}
                  <span className="text-base font-normal text-kram-400">บาท</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Info - KTB Blue Theme */}
      <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border-0 overflow-hidden shadow-xl shadow-sky-500/20 animate-fade-in [animation-delay:200ms]">
        {/* Header with KTB Blue gradient */}
        <div className="relative bg-gradient-to-r from-sky-500 via-sky-600 to-sky-500 p-6 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-300/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative flex items-center gap-4">
            <div className="bg-white rounded-2xl p-3 shadow-lg">
              <Image
                src="/KTB_Logo.png"
                alt="Krungthai Bank"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">ข้อมูลการชำระเงิน</h2>
              <p className="text-sky-100 text-sm">โอนเงินเข้าบัญชีด้านล่าง</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/80 to-sky-100/50">
              <p className="text-sm text-sky-600 mb-1">ธนาคาร</p>
              <p className="font-bold text-sky-800">กรุงไทย (สาขาน่าน)</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50/80 to-sky-100/50">
              <p className="text-sm text-sky-600 mb-1">ชื่อบัญชี</p>
              <p className="font-bold text-sky-800">มูลนิธิ นายแพทย์บุญยงค์ วงศ์รักมิตร</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200/70 border border-sky-200">
              <p className="text-sm text-sky-600 mb-1">เลขที่บัญชี</p>
              <p className="font-bold text-3xl bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent tracking-wider">
                507-3-44659-3
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200">
              <p className="text-sm text-emerald-600 mb-1">ค่าลงทะเบียน</p>
              <p className="font-bold text-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                {data.meetPrice.toLocaleString("th-TH")}{" "}
                <span className="text-base font-normal text-slate-400">บาท/คน</span>
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200/50 rounded-xl">
            <p className="text-sm text-sky-800">
              <span className="font-semibold text-sky-600">หมายเหตุ:</span> หลังจากโอนเงินแล้ว
              กรุณาอัปโหลดหลักฐานการชำระเงินด้านล่าง
            </p>
          </div>
          {data.settings?.condition1 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl text-sm">
              <p className="font-semibold text-amber-700 mb-1">เงื่อนไขการชำระเงิน</p>
              <div
                className="text-amber-600"
                dangerouslySetInnerHTML={{ __html: data.settings.condition1 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Form - Client Component */}
      <PaymentClient
        attendees={data.attendees}
        memberId={parseInt(session.user.id)}
        meetPrice={data.meetPrice}
        meetPriceFollow={data.meetPriceFollow}
      />
    </div>
  );
}
