import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, User, Phone, Mail, MapPin, Plane, Bus, Train, Hotel } from "lucide-react";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  1: { label: "ค้างชำระ", variant: "secondary" },
  2: { label: "รอตรวจสอบ", variant: "outline" },
  3: { label: "ยกเลิก", variant: "destructive" },
  9: { label: "ชำระแล้ว", variant: "default" },
};

const foodTypes: Record<number, string> = {
  1: "ปกติ",
  2: "มังสวิรัติ",
  3: "อิสลาม",
};

const vehicleTypes: Record<number, string> = {
  1: "เครื่องบิน",
  2: "รถบัส",
  3: "รถไฟ",
  4: "รถส่วนตัว",
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/registration">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {attendee.prefix}{attendee.firstName} {attendee.lastName}
            </h1>
            <p className="text-gray-500">{attendee.regType?.name || "ไม่ระบุประเภท"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.variant} className="text-sm px-3 py-1">
            {status.label}
          </Badge>
          <Link href={`/portal/registration/${attendee.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              แก้ไข
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                <p className="font-medium">
                  {attendee.prefix}{attendee.firstName} {attendee.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ตำแหน่ง</p>
                <p className="font-medium">
                  {attendee.position?.name || attendee.positionOther || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ระดับ</p>
                <p className="font-medium">{attendee.level?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">อาหาร</p>
                <p className="font-medium">
                  {attendee.foodType ? foodTypes[attendee.foodType] : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              ข้อมูลติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{attendee.phone || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{attendee.email || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 text-gray-400 text-xs font-bold">LINE</span>
              <span>{attendee.line || "-"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Travel Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              การเดินทาง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">ประเภทการเดินทาง</p>
              <p className="font-medium">
                {attendee.vehicleType ? vehicleTypes[attendee.vehicleType] : "-"}
              </p>
            </div>

            {attendee.vehicleType === 1 && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-primary">
                  <Plane className="w-4 h-4" />
                  <span className="font-medium">เครื่องบิน</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ขาไป</p>
                    <p>{formatDate(attendee.airDate1)}</p>
                    <p>{attendee.airline1} - {attendee.flightNo1 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ขากลับ</p>
                    <p>{formatDate(attendee.airDate2)}</p>
                    <p>{attendee.airline2} - {attendee.flightNo2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {attendee.vehicleType === 2 && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-primary">
                  <Bus className="w-4 h-4" />
                  <span className="font-medium">รถบัส</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ขาไป</p>
                    <p>{formatDate(attendee.busDate1)}</p>
                    <p>{attendee.busLine1 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ขากลับ</p>
                    <p>{formatDate(attendee.busDate2)}</p>
                    <p>{attendee.busLine2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            {attendee.vehicleType === 3 && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-primary">
                  <Train className="w-4 h-4" />
                  <span className="font-medium">รถไฟ</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ขาไป</p>
                    <p>{formatDate(attendee.trainDate1)}</p>
                    <p>{attendee.trainLine1 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ขากลับ</p>
                    <p>{formatDate(attendee.trainDate2)}</p>
                    <p>{attendee.trainLine2 || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accommodation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              ที่พัก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">โรงแรม</p>
              <p className="font-medium">
                {attendee.hotel?.name || attendee.hotelOther || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">รถรับ-ส่งไปประชุม</p>
              <p className="font-medium">
                {attendee.busToMeet === 1 ? "ต้องการ" : attendee.busToMeet === 2 ? "ไม่ต้องการ" : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
