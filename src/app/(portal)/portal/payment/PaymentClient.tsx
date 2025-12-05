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
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-emerald-500/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-600 bg-clip-text text-transparent mb-2">
              ส่งหลักฐานการชำระเงินสำเร็จ
            </h2>
            <p className="text-kram-500">กำลังนำท่านไปยังหน้าตรวจสอบสถานะ...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 animate-fade-in [animation-delay:300ms]">
      {/* Attendee List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-kram-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-kram-600" />
            </div>
            เลือกผู้ลงทะเบียน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-kram-400" />
              </div>
              <p className="text-kram-600 font-medium">ไม่มีรายการที่รอชำระเงิน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-kram-100 text-left">
                    <th className="pb-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === attendees.length && attendees.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-kram-300 text-kram-600 focus:ring-cyan-500"
                      />
                    </th>
                    <th className="pb-4 font-semibold text-kram-600 text-sm">ชื่อ-สกุล</th>
                    <th className="pb-4 font-semibold text-kram-600 text-sm">
                      สถานที่ปฏิบัติงาน
                    </th>
                    <th className="pb-4 font-semibold text-kram-600 text-sm">ตำแหน่ง</th>
                    <th className="pb-4 font-semibold text-kram-600 text-sm">โทรศัพท์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kram-50">
                  {attendees.map((a) => (
                    <tr
                      key={a.id}
                      className={`cursor-pointer transition-colors duration-200 ${
                        selected.includes(a.id)
                          ? "bg-gradient-to-r from-cyan-50/50 to-kram-50/50"
                          : "hover:bg-kram-50/50"
                      }`}
                      onClick={() => toggle(a.id)}
                    >
                      <td className="py-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(a.id)}
                          onChange={() => toggle(a.id)}
                          className="w-4 h-4 rounded border-kram-300 text-kram-600 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="py-4 font-semibold text-kram-900">
                        {a.prefix}
                        {a.firstName} {a.lastName}
                      </td>
                      <td className="py-4 text-sm text-kram-600">
                        {a.hospital?.name || "-"}
                      </td>
                      <td className="py-4 text-sm text-kram-600">
                        {a.position?.name || a.positionOther || "-"}
                      </td>
                      <td className="py-4 text-sm text-kram-600">
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
        <Card className="relative border-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-lg shadow-emerald-500/10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl" />
          <CardContent className="pt-8 relative">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Calculator className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-kram-600 font-medium">จำนวนเงินที่ต้องชำระ</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent my-4">
                  {total.toLocaleString("th-TH")}
                </p>
                <p className="text-kram-500 font-medium">บาท</p>
                <p className="text-sm text-kram-400 mt-2">
                  {selected.length} คน x ค่าลงทะเบียน
                </p>
              </div>
            </div>
            <div className="mt-6 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl">
              <p className="text-sm text-red-600 text-center">
                <span className="font-bold">*</span> ลงทะเบียนจ่ายเงินแล้ว
                ไม่สามารถรับคืนเงินได้
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form Card */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-kram-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-kram-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-cyan-600" />
              </div>
              อัปโหลดหลักฐานการชำระเงิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Date & Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transferDate" className="text-kram-700 font-medium">วันที่โอนเงิน</Label>
                  <Input
                    id="transferDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-kram-200 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferTime" className="text-kram-700 font-medium">เวลาที่โอนเงิน</Label>
                  <Input
                    id="transferTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-kram-200 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file" className="text-kram-700 font-medium">
                  อัพโหลดเอกสาร <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-kram-400">
                  ไฟล์ภาพ .jpg, .jpeg, .png สูงสุด 5MB
                </p>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFile}
                  className="cursor-pointer border-kram-200 focus:border-cyan-400 focus:ring-cyan-400"
                />
                {file && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    ไฟล์ที่เลือก: {file.name}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-kram-600 to-cyan-600 hover:from-kram-700 hover:to-cyan-700 text-white shadow-lg shadow-kram-500/20 hover:shadow-xl transition-all duration-300 h-12"
                disabled={loading || attendees.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
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
