/**
 * Attendee edit form for updating registration details.
 *
 * Features:
 * - Edit personal info (name, prefix)
 * - Update registration type and level
 * - Change position (with "other" option)
 * - Modify contact details (phone, email, LINE)
 * - Select food preference
 * - Loading state during submission
 * - Error handling with Thai messages
 *
 * API: PATCH /api/attendees/[id]
 *
 * @module components/portal/AttendeeEditForm
 *
 * @example
 * const attendee = await prisma.attendee.findUnique({ where: { id } });
 * const regTypes = await prisma.regType.findMany();
 * const positions = await prisma.position.findMany();
 * const levels = await prisma.level.findMany();
 *
 * <AttendeeEditForm
 *   attendee={attendee}
 *   regTypes={regTypes}
 *   positions={positions}
 *   levels={levels}
 * />
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Props for the AttendeeEditForm component.
 */
interface AttendeeEditFormProps {
  /** Attendee data to edit */
  attendee: {
    /** Database ID */
    id: number;
    /** Title prefix (นาย/นาง/นางสาว) */
    prefix: string | null;
    /** First name */
    firstName: string | null;
    /** Last name */
    lastName: string | null;
    /** Registration type ID */
    regTypeId: number | null;
    /** Position code from master data */
    positionCode: string | null;
    /** Custom position if not in list */
    positionOther: string | null;
    /** Job level code */
    levelCode: string | null;
    /** Phone number */
    phone: string | null;
    /** Email address */
    email: string | null;
    /** LINE ID */
    line: string | null;
    /** Food type (1-4) */
    foodType: number | null;
  };
  /** Available registration types for dropdown */
  regTypes: Array<{ id: number; name: string }>;
  /** Available positions for dropdown */
  positions: Array<{ code: string; name: string }>;
  /** Available levels for dropdown (with group) */
  levels: Array<{ code: string; name: string; group: string | null }>;
}

/**
 * Attendee edit form component.
 *
 * @component
 * @param props - Component props
 */
export function AttendeeEditForm({
  attendee,
  regTypes,
  positions,
  levels,
}: AttendeeEditFormProps) {
  const router = useRouter();
  /** Submission loading state */
  const [isLoading, setIsLoading] = useState(false);
  /** Error message for display */
  const [error, setError] = useState("");

  /** Form field values initialized from attendee data */
  const [formData, setFormData] = useState({
    prefix: attendee.prefix || "",
    firstName: attendee.firstName || "",
    lastName: attendee.lastName || "",
    regTypeId: attendee.regTypeId?.toString() || "",
    positionCode: attendee.positionCode || "",
    positionOther: attendee.positionOther || "",
    levelCode: attendee.levelCode || "",
    phone: attendee.phone || "",
    email: attendee.email || "",
    line: attendee.line || "",
    foodType: attendee.foodType?.toString() || "",
  });

  /**
   * Handle input field changes.
   * @param e - Input/select change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission.
   * Converts empty strings to null and numeric fields to integers.
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/attendees/${attendee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: formData.prefix || null,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          regTypeId: formData.regTypeId ? parseInt(formData.regTypeId) : null,
          positionCode: formData.positionCode || null,
          positionOther: formData.positionOther || null,
          levelCode: formData.levelCode || null,
          phone: formData.phone || null,
          email: formData.email || null,
          line: formData.line || null,
          foodType: formData.foodType ? parseInt(formData.foodType) : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendee");
      }

      router.push(`/portal/registration/${attendee.id}`);
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/portal/registration/${attendee.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูล</h1>
          <p className="text-gray-500">
            {attendee.prefix}{attendee.firstName} {attendee.lastName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลผู้ลงทะเบียน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="prefix">คำนำหน้า</Label>
                <select
                  id="prefix"
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">เลือก</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Registration Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regTypeId">ประเภทการลงทะเบียน</Label>
                <select
                  id="regTypeId"
                  name="regTypeId"
                  value={formData.regTypeId}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">เลือกประเภท</option>
                  {regTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="levelCode">ระดับ</Label>
                <select
                  id="levelCode"
                  name="levelCode"
                  value={formData.levelCode}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">เลือกระดับ</option>
                  {levels.map((level) => (
                    <option key={level.code} value={level.code}>
                      {level.group} - {level.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="positionCode">ตำแหน่ง</Label>
                <select
                  id="positionCode"
                  name="positionCode"
                  value={formData.positionCode}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">เลือกตำแหน่ง</option>
                  {positions.map((pos) => (
                    <option key={pos.code} value={pos.code}>
                      {pos.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="positionOther">ตำแหน่ง (อื่นๆ)</Label>
                <Input
                  id="positionOther"
                  name="positionOther"
                  value={formData.positionOther}
                  onChange={handleChange}
                  placeholder="ระบุตำแหน่งอื่น"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">โทรศัพท์</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="line">LINE ID</Label>
                <Input
                  id="line"
                  name="line"
                  value={formData.line}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Food Type */}
            <div>
              <Label htmlFor="foodType">ประเภทอาหาร</Label>
              <select
                id="foodType"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">เลือกประเภทอาหาร</option>
                <option value="1">อาหารทั่วไป</option>
                <option value="2">อาหารอิสลาม</option>
                <option value="3">อาหารมังสวิรัติ</option>
                <option value="4">อาหารเจ</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href={`/portal/registration/${attendee.id}`}>
                <Button type="button" variant="outline">
                  ยกเลิก
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
