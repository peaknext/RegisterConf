import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import PaymentClient from "./PaymentClient";

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แจ้งชำระเงิน</h1>
        <p className="text-gray-500">
          อัปโหลดหลักฐานการชำระเงินสำหรับผู้ลงทะเบียน
        </p>
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">ผู้ค้างชำระทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalPending.toLocaleString("th-TH")}{" "}
                  <span className="text-base font-normal text-gray-500">คน</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">ยอดค้างชำระทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.totalPendingAmount.toLocaleString("th-TH")}{" "}
                  <span className="text-base font-normal text-gray-500">บาท</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Info */}
      <div className="bg-white rounded-lg border overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-[#00A5E3] to-[#0077B6] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-2">
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
              <p className="text-cyan-100 text-sm">โอนเงินเข้าบัญชีด้านล่าง</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ธนาคาร</p>
              <p className="font-semibold text-[#0077B6]">กรุงไทย (สาขาน่าน)</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ชื่อบัญชี</p>
              <p className="font-semibold">มูลนิธิ นายแพทย์บุญยงค์ วงศ์รักมิตร</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">เลขที่บัญชี</p>
              <p className="font-bold text-2xl text-[#0077B6] tracking-wider">
                507-3-44659-3
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ค่าลงทะเบียน</p>
              <p className="font-bold text-2xl text-emerald-600">
                {data.meetPrice.toLocaleString("th-TH")}{" "}
                <span className="text-base font-normal text-gray-500">บาท/คน</span>
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
            <p className="text-sm text-cyan-800">
              <span className="font-semibold">หมายเหตุ:</span> หลังจากโอนเงินแล้ว
              กรุณาอัปโหลดหลักฐานการชำระเงินด้านล่าง
            </p>
          </div>
          {data.settings?.condition1 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
              <p className="font-semibold text-amber-800 mb-1">เงื่อนไขการชำระเงิน</p>
              <div
                className="text-amber-700"
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
