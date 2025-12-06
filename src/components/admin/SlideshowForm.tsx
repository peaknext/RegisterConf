/**
 * Slideshow image create/edit form for admin panel.
 *
 * Features:
 * - Dual-mode: Create new or edit existing slideshow slides
 * - Form fields: title (optional), image URL, link URL, sort order, active status
 * - Live image preview when URL is entered
 * - Sort order for carousel display sequence
 * - Active/inactive toggle for visibility control
 * - Loading state with spinner during submission
 * - Error handling with Thai error messages
 *
 * API endpoints used:
 * - POST /api/admin/slideshow - Create new slide
 * - PATCH /api/admin/slideshow/[id] - Update existing slide
 *
 * @module components/admin/SlideshowForm
 *
 * @example
 * // Create mode
 * <SlideshowForm />
 *
 * @example
 * // Edit mode
 * const slideshow = await prisma.slideshow.findUnique({ where: { id } });
 * <SlideshowForm slideshow={slideshow} />
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Props for the SlideshowForm component.
 */
interface SlideshowFormProps {
  /** Existing slideshow data for edit mode (omit for create mode) */
  slideshow?: {
    /** Database ID */
    id: number;
    /** Optional title/caption for the slide */
    title: string | null;
    /** Image URL for the slide (required) */
    imageUrl: string;
    /** Optional link URL when slide is clicked */
    linkUrl: string | null;
    /** Display order in carousel (lower first) */
    sortOrder: number;
    /** Whether slide is visible in carousel */
    isActive: boolean;
  };
}

/**
 * Slideshow slide form with create/edit functionality.
 *
 * @component
 * @param props - Component props
 * @param props.slideshow - Existing slide data for edit mode (optional)
 */
export function SlideshowForm({ slideshow }: SlideshowFormProps) {
  const router = useRouter();
  /** Submission loading state */
  const [isLoading, setIsLoading] = useState(false);
  /** Error message for display */
  const [error, setError] = useState("");

  /** Form field values with defaults from existing slide or defaults */
  const [formData, setFormData] = useState({
    title: slideshow?.title || "",
    imageUrl: slideshow?.imageUrl || "",
    linkUrl: slideshow?.linkUrl || "",
    sortOrder: slideshow?.sortOrder?.toString() || "0",
    isActive: slideshow?.isActive ?? true,
  });

  /**
   * Handle input field changes.
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission for create/update.
   * Converts sortOrder to integer before sending.
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = slideshow
        ? `/api/admin/slideshow/${slideshow.id}`
        : "/api/admin/slideshow";
      const method = slideshow ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      router.push("/admin/slideshow");
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
        <Link href="/admin/slideshow">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {slideshow ? "แก้ไขสไลด์" : "เพิ่มสไลด์"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดสไลด์</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">ชื่อสไลด์</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="ชื่อที่จะแสดงบนภาพ (ไม่บังคับ)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL รูปภาพ *</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="mt-1"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">ตัวอย่าง:</p>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="max-w-md rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="linkUrl">URL ลิงก์ (คลิกแล้วไปที่)</Label>
              <Input
                id="linkUrl"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sortOrder">ลำดับการแสดง</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                className="mt-1 w-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                ตัวเลขน้อยจะแสดงก่อน
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: !!checked }))
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                แสดงสไลด์นี้
              </Label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/admin/slideshow">
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
