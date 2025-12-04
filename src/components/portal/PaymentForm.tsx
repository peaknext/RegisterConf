"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Attendee {
  id: number;
  prefix: string | null;
  firstName: string | null;
  lastName: string | null;
}

interface PaymentFormProps {
  attendees: Attendee[];
  memberId: number;
}

export function PaymentForm({ attendees, memberId }: PaymentFormProps) {
  const router = useRouter();
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSelectAll = () => {
    if (selectedAttendees.length === attendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(attendees.map((a) => a.id));
    }
  };

  const handleSelectAttendee = (id: number) => {
    setSelectedAttendees((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        setError("กรุณาอัปโหลดไฟล์รูปภาพ (JPG, PNG, GIF) หรือ PDF เท่านั้น");
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedAttendees.length === 0) {
      setError("กรุณาเลือกผู้ลงทะเบียนอย่างน้อย 1 คน");
      return;
    }

    if (!file) {
      setError("กรุณาอัปโหลดหลักฐานการชำระเงิน");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("attendeeIds", selectedAttendees.join(","));
      formData.append("memberId", memberId.toString());

      const response = await fetch("/api/payment", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit payment");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/portal/payment-status");
        router.refresh();
      }, 2000);
    } catch {
      setError("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
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
            <p className="text-gray-500">
              กำลังนำท่านไปยังหน้าตรวจสอบสถานะ...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Select Attendees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>เลือกผู้ลงทะเบียน</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedAttendees.length === attendees.length
                  ? "ยกเลิกทั้งหมด"
                  : "เลือกทั้งหมด"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>ไม่มีรายการที่รอชำระเงิน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <label
                    key={attendee.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedAttendees.includes(attendee.id)}
                      onCheckedChange={() => handleSelectAttendee(attendee.id)}
                    />
                    <span className="font-medium">
                      {attendee.prefix}
                      {attendee.firstName} {attendee.lastName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Proof */}
        <Card>
          <CardHeader>
            <CardTitle>อัปโหลดหลักฐานการชำระเงิน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">ไฟล์หลักฐาน (รูปภาพ หรือ PDF, สูงสุด 5MB)</Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-green-600">
                    ไฟล์ที่เลือก: {file.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || attendees.length === 0}
              >
                {isLoading ? (
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
