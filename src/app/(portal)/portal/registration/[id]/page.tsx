import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, User, Phone, Mail, MapPin, Plane, Bus, Train, Hotel, Car } from "lucide-react";

// Status configuration with KramSakon theme colors
const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  1: { label: "ค้างชำระ", variant: "secondary", className: "bg-amber-100 text-amber-700 border-amber-200" },
  2: { label: "รอตรวจสอบ", variant: "outline", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  3: { label: "ยกเลิก", variant: "destructive", className: "bg-red-100 text-red-700 border-red-200" },
  9: { label: "ชำระแล้ว", variant: "default", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const foodTypes: Record<number, string> = {
  1: "อาหารทั่วไป",
  2: "อาหารอิสลาม",
  3: "อาหารมังสวิรัติ",
  4: "อาหารเจ",
};

const vehicleTypes: Record<number, string> = {
  1: "เครื่องบิน",
  2: "รถโดยสาร",
  3: "รถยนต์ส่วนตัว/ราชการ",
  4: "รถไฟ",
};

async function getAttendee(id: number, hospitalCode: string | null) {
  if (!hospitalCode) return null;

  const attendee = await prisma.attendee.findFirst({
    where: { id, hospitalCode },
    include: {
      regType: true,
      position: true,
      level: true,
      hospital: true,
    },
  });

  if (!attendee) return null;

  // Query hotel separately since relation might not be set up yet
  const hotel = attendee.hotelId
    ? await prisma.hotel.findUnique({ where: { id: attendee.hotelId } })
    : null;

  return { ...attendee, hotel };
}

export default async function AttendeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const attendee = await getAttendee(parseInt(id), session.user.hospitalCode);

  if (!attendee) {
    notFound();
  }

  const status = statusMap[attendee.status] || statusMap[1];

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with KramSakon theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link href="/portal/registration">
            <Button variant="ghost" size="icon" className="hover:bg-kram-100 hover:text-kram-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
              {attendee.prefix}{attendee.firstName} {attendee.lastName}
            </h1>
            <p className="text-kram-500 flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              {attendee.regType?.name || "ไม่ระบุประเภท"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={status.variant} className={`text-sm px-4 py-1.5 ${status.className}`}>
            {status.label}
          </Badge>
          <Link href={`/portal/registration/${attendee.id}/edit`}>
            <Button className="bg-gradient-to-r from-kram-600 to-cyan-600 hover:from-kram-700 hover:to-cyan-700 text-white shadow-lg shadow-kram-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Edit className="w-4 h-4 mr-2" />
              แก้ไข
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:100ms]">
          <div className="h-1 bg-gradient-to-r from-kram-500 to-cyan-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <User className="w-5 h-5 text-kram-600" />
              </div>
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-kram-500 mb-1">ชื่อ-นามสกุล</p>
                <p className="font-semibold text-kram-900">
                  {attendee.prefix}{attendee.firstName} {attendee.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-kram-500 mb-1">ตำแหน่ง</p>
                <p className="font-semibold text-kram-900">
                  {attendee.position?.name || attendee.positionOther || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-kram-500 mb-1">ระดับ</p>
                <p className="font-semibold text-kram-900">{attendee.level?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-kram-500 mb-1">อาหาร</p>
                <p className="font-semibold text-kram-900">
                  {attendee.foodType ? foodTypes[attendee.foodType] : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:200ms]">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-cyan-600" />
              </div>
              ข้อมูลติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-kram-50/50 hover:bg-kram-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Phone className="w-4 h-4 text-kram-500" />
              </div>
              <span className="text-kram-700 font-medium">{attendee.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-kram-50/50 hover:bg-kram-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Mail className="w-4 h-4 text-kram-500" />
              </div>
              <span className="text-kram-700 font-medium">{attendee.email || "-"}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-kram-50/50 hover:bg-kram-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-emerald-500">LINE</span>
              </div>
              <span className="text-kram-700 font-medium">{attendee.line || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Travel Info */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:300ms]">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              การเดินทาง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-kram-50/50 to-cyan-50/30">
              <p className="text-sm text-kram-500 mb-1">ประเภทการเดินทาง</p>
              <p className="font-semibold text-kram-900">
                {attendee.vehicleType ? vehicleTypes[attendee.vehicleType] : "-"}
              </p>
            </div>

            {attendee.vehicleType === 1 && (
              <div className="space-y-3 pt-3 border-t border-kram-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-kram-100 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-cyan-600" />
                  </div>
                  <span className="font-semibold text-kram-800">เครื่องบิน</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขาไป</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.airDate1)}</p>
                    <p className="text-kram-600">{attendee.airline1} - {attendee.flightNo1 || "-"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขากลับ</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.airDate2)}</p>
                    <p className="text-kram-600">{attendee.airline2} - {attendee.flightNo2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {attendee.vehicleType === 2 && (
              <div className="space-y-3 pt-3 border-t border-kram-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Bus className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-semibold text-kram-800">รถโดยสาร</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขาไป</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.busDate1)}</p>
                    <p className="text-kram-600">{attendee.busLine1 || "-"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขากลับ</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.busDate2)}</p>
                    <p className="text-kram-600">{attendee.busLine2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {attendee.vehicleType === 3 && (
              <div className="space-y-3 pt-3 border-t border-kram-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <Car className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-kram-800">รถยนต์ส่วนตัว/ราชการ</span>
                </div>
              </div>
            )}

            {attendee.vehicleType === 4 && (
              <div className="space-y-3 pt-3 border-t border-kram-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Train className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-semibold text-kram-800">รถไฟ</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขาไป</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.trainDate1)}</p>
                    <p className="text-kram-600">{attendee.trainLine1 || "-"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-kram-50/50">
                    <p className="text-kram-500 mb-1">ขากลับ</p>
                    <p className="font-medium text-kram-800">{formatDate(attendee.trainDate2)}</p>
                    <p className="text-kram-600">{attendee.trainLine2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accommodation */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:400ms]">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                <Hotel className="w-5 h-5 text-emerald-600" />
              </div>
              ที่พัก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-kram-50/50 to-cyan-50/30">
              <p className="text-sm text-kram-500 mb-1">โรงแรม</p>
              <p className="font-semibold text-kram-900">
                {attendee.hotel?.name || attendee.hotelOther || "-"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-kram-50/50 to-cyan-50/30">
              <p className="text-sm text-kram-500 mb-1">รถรับ-ส่งไปประชุม</p>
              <p className="font-semibold text-kram-900 flex items-center gap-2">
                {attendee.busToMeet === 1 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ต้องการ
                  </>
                ) : attendee.busToMeet === 2 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-kram-300" />
                    ไม่ต้องการ
                  </>
                ) : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
