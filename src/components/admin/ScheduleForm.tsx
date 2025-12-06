/**
 * Conference schedule item create/edit form for admin panel.
 *
 * Features:
 * - Dual-mode: Create new or edit existing schedule items
 * - Form fields: day number, date, time range, title, description, location, speaker
 * - Day number selection (วันที่ 1, 2, 3)
 * - Time picker for start/end times
 * - Sort order for display ordering
 * - Loading state with spinner during submission
 * - Error handling with Thai error messages
 *
 * API endpoints used:
 * - POST /api/admin/schedule - Create new schedule item
 * - PATCH /api/admin/schedule/[id] - Update existing item
 *
 * @module components/admin/ScheduleForm
 *
 * @example
 * // Create mode
 * <ScheduleForm />
 *
 * @example
 * // Edit mode
 * const schedule = await prisma.schedule.findUnique({ where: { id } });
 * <ScheduleForm schedule={schedule} />
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
 * Props for the ScheduleForm component.
 */
interface ScheduleFormProps {
  /** Existing schedule data for edit mode (omit for create mode) */
  schedule?: {
    /** Database ID */
    id: number;
    /** Conference day (1, 2, or 3) */
    dayNumber: number;
    /** Calendar date for this day */
    date: Date;
    /** Start time in HH:MM format */
    startTime: string;
    /** End time in HH:MM format */
    endTime: string;
    /** Session/event title */
    title: string;
    /** Optional description of the session */
    description: string | null;
    /** Room/location name (e.g., "ห้องประชุม 1") */
    location: string | null;
    /** Speaker/presenter name */
    speaker: string | null;
    /** Display order (lower numbers first) */
    sortOrder: number;
  };
}

/**
 * Schedule item form with create/edit functionality.
 *
 * @component
 * @param props - Component props
 * @param props.schedule - Existing schedule data for edit mode (optional)
 */
export function ScheduleForm({ schedule }: ScheduleFormProps) {
  const router = useRouter();
  /** Submission loading state */
  const [isLoading, setIsLoading] = useState(false);
  /** Error message for display */
  const [error, setError] = useState("");

  /** Form field values with defaults from existing schedule or defaults */
  const [formData, setFormData] = useState({
    dayNumber: schedule?.dayNumber?.toString() || "1",
    date: schedule?.date ? new Date(schedule.date).toISOString().split("T")[0] : "",
    startTime: schedule?.startTime || "09:00",
    endTime: schedule?.endTime || "10:00",
    title: schedule?.title || "",
    description: schedule?.description || "",
    location: schedule?.location || "",
    speaker: schedule?.speaker || "",
    sortOrder: schedule?.sortOrder?.toString() || "0",
  });

  /**
   * Handle input field changes.
   * @param e - Input/select/textarea change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission for create/update.
   * Converts dayNumber and sortOrder to integers before sending.
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = schedule
        ? `/api/admin/schedule/${schedule.id}`
        : "/api/admin/schedule";
      const method = schedule ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dayNumber: parseInt(formData.dayNumber),
          sortOrder: parseInt(formData.sortOrder),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      router.push("/admin/schedule");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/schedule">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {schedule ? "แก้ไขกำหนดการ" : "เพิ่มกำหนดการ"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดกำหนดการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dayNumber">วันที่ *</Label>
                <select
                  id="dayNumber"
                  name="dayNumber"
                  value={formData.dayNumber}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1">วันที่ 1</option>
                  <option value="2">วันที่ 2</option>
                  <option value="3">วันที่ 3</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date">วันที่ (ปฏิทิน) *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">ลำดับ</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">เวลาเริ่ม *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime">เวลาสิ้นสุด *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">หัวข้อ *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">รายละเอียด</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">สถานที่</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="speaker">วิทยากร</Label>
                <Input
                  id="speaker"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/admin/schedule">
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
