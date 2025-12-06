/**
 * News article create/edit form component for admin panel.
 *
 * Features:
 * - Dual-mode: Create new or edit existing news articles
 * - Form fields: title, content (HTML), image URL, publish status
 * - Auto-detects mode based on presence of `news` prop
 * - Loading state with spinner during submission
 * - Error handling with Thai error messages
 * - Redirects to news list on successful save
 *
 * API endpoints used:
 * - POST /api/admin/news - Create new article
 * - PATCH /api/admin/news/[id] - Update existing article
 *
 * @module components/admin/NewsForm
 *
 * @example
 * // Create mode (no news prop)
 * <NewsForm />
 *
 * @example
 * // Edit mode (with news prop)
 * const news = await prisma.news.findUnique({ where: { id } });
 * <NewsForm news={news} />
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
 * Props for the NewsForm component.
 */
interface NewsFormProps {
  /** Existing news data for edit mode (omit for create mode) */
  news?: {
    /** Database ID */
    id: number;
    /** Article title/headline */
    title: string;
    /** Article content (supports HTML tags) */
    content: string;
    /** Featured image URL (optional) */
    imageUrl: string | null;
    /** Whether article is published and visible */
    isPublished: boolean;
  };
}

/**
 * News article form with create/edit functionality.
 *
 * @component
 * @param props - Component props
 * @param props.news - Existing news data for edit mode (optional)
 */
export function NewsForm({ news }: NewsFormProps) {
  const router = useRouter();
  /** Submission loading state */
  const [isLoading, setIsLoading] = useState(false);
  /** Error message for display */
  const [error, setError] = useState("");

  /** Form field values with defaults from existing news or empty */
  const [formData, setFormData] = useState({
    title: news?.title || "",
    content: news?.content || "",
    imageUrl: news?.imageUrl || "",
    isPublished: news?.isPublished ?? true,
  });

  /**
   * Handle input field changes.
   * @param e - Input change event
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission for create/update.
   * Uses POST for new articles, PATCH for existing.
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = news ? `/api/admin/news/${news.id}` : "/api/admin/news";
      const method = news ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      router.push("/admin/news");
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
        <Link href="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {news ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสาร"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดข่าวสาร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">หัวข้อข่าว *</Label>
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
              <Label htmlFor="content">เนื้อหา *</Label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                รองรับ HTML tags เช่น &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;
              </p>
            </div>

            <div>
              <Label htmlFor="imageUrl">URL รูปภาพ</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: !!checked }))
                }
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                เผยแพร่ข่าวสาร
              </Label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/admin/news">
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
