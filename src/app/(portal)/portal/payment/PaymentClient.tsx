"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Loader2,
  CheckCircle,
  Calculator,
  AlertCircle,
} from "lucide-react";

interface Attendee {
  id: number;
  prefix: string | null;
  firstName: string | null;
  lastName: string | null;
  regTypeId: number | null;
  phone: string | null;
  hospital?: { name: string } | null;
  position?: { name: string } | null;
  positionOther: string | null;
}

interface Props {
  attendees: Attendee[];
  memberId: number;
  meetPrice: number;
  meetPriceFollow: number;
}

export default function PaymentClient({
  attendees,
  memberId,
  meetPrice,
  meetPriceFollow,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Calculate total
  const total = selected.reduce((sum, id) => {
    const att = attendees.find((a) => a.id === id);
    if (!att) return sum;
    return sum + (att.regTypeId === 6 ? meetPriceFollow : meetPrice);
  }, 0);

  const toggleAll = () => {
    if (selected.length === attendees.length) {
      setSelected([]);
    } else {
      setSelected(attendees.map((a) => a.id));
    }
  };

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setError("กรุณาอัปโหลดไฟล์ภาพ .jpg, .jpeg, .png เท่านั้น");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setFile(f);
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selected.length === 0) {
      setError("กรุณาเลือกผู้ลงทะเบียนอย่างน้อย 1 คน");
      return;
    }
    if (!file) {
      setError("กรุณาอัปโหลดหลักฐานการชำระเงิน");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("attendeeIds", selected.join(","));
      fd.append("memberId", memberId.toString());

      if (date && time) {
        fd.append("paidDate", new Date(`${date}T${time}`).toISOString());
      }

      const res = await fetch("/api/payment", { method: "POST", body: fd });

      if (!res.ok) throw new Error();

      setSuccess(true);
      setTimeout(() => {
        router.push("/portal/payment-status");
        router.refresh();
      }, 2000);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ส่งหลักฐานการชำระเงินสำเร็จ
            </h2>
            <p className="text-gray-500">กำลังนำท่านไปยังหน้าตรวจสอบสถานะ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Attendee List */}
      <Card>
        <CardHeader>
          <CardTitle>เลือกผู้ลงทะเบียน</CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              ไม่มีรายการที่รอชำระเงิน
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === attendees.length && attendees.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="pb-3 font-medium text-gray-500">ชื่อ-สกุล</th>
                    <th className="pb-3 font-medium text-gray-500">
                      สถานที่ปฏิบัติงาน
                    </th>
                    <th className="pb-3 font-medium text-gray-500">ตำแหน่ง</th>
                    <th className="pb-3 font-medium text-gray-500">โทรศัพท์</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendees.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggle(a.id)}
                    >
                      <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(a.id)}
                          onChange={() => toggle(a.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 font-medium">
                        {a.prefix}
                        {a.firstName} {a.lastName}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.hospital?.name || "-"}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.position?.name || a.positionOther || "-"}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {a.phone || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Amount Card */}
        <Card className="border-2 border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calculator className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">จำนวนเงินที่ต้องชำระ</p>
                <p className="text-5xl font-bold text-emerald-600 my-3">
                  {total.toLocaleString("th-TH")}
                </p>
                <p className="text-gray-500">บาท</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selected.length} คน x ค่าลงทะเบียน
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">
                <span className="font-semibold">*</span> ลงทะเบียนจ่ายเงินแล้ว
                ไม่สามารถรับคืนเงินได้
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>อัปโหลดหลักฐานการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date & Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transferDate">วันที่โอนเงิน</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferTime">เวลาที่โอนเงิน</Label>
                  <Input
                    id="transferTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file">
                  อัพโหลดเอกสาร <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500">
                  ไฟล์ภาพ .jpg, .jpeg, .png สูงสุด 5MB
                </p>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFile}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-green-600">
                    ไฟล์ที่เลือก: {file.name}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || attendees.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    ส่งหลักฐานการชำระเงิน
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
