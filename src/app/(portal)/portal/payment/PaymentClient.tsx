"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="bg-white rounded-lg border p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-green-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          ส่งหลักฐานการชำระเงินสำเร็จ
        </h2>
        <p className="text-gray-500">กำลังนำท่านไปยังหน้าตรวจสอบสถานะ...</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Attendee List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">เลือกผู้ลงทะเบียน</h3>
        </div>
        <div className="p-4">
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
                        checked={selected.length === attendees.length}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300"
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
                          className="w-4 h-4 rounded border-gray-300"
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
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 flex flex-col justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">จำนวนเงินที่ต้องชำระ</p>
            <p className="text-5xl font-bold text-emerald-600">
              {total.toLocaleString("th-TH")}
            </p>
            <p className="text-gray-500 mt-1">บาท</p>
            <p className="text-sm text-gray-500 mt-2">
              {selected.length} คน x ค่าลงทะเบียน
            </p>
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              * ลงทะเบียนจ่ายเงินแล้ว ไม่สามารถรับคืนเงินได้
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            อัปโหลดหลักฐานการชำระเงิน
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่โอนเงิน
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาที่โอนเงิน
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อัพโหลดเอกสาร <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                ไฟล์ภาพ .jpg, .jpeg, .png สูงสุด 5MB
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFile}
                className="w-full text-sm"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ไฟล์ที่เลือก: {file.name}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || attendees.length === 0}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  กำลังส่งข้อมูล...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  ส่งหลักฐานการชำระเงิน
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
