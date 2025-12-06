/**
 * Reusable delete button for admin content management.
 *
 * Supports deleting news, schedule, and slideshow items.
 * Shows confirmation dialog before deletion.
 * Calls DELETE /api/admin/[type]/[id].
 *
 * @module components/admin/DeleteButton
 *
 * @example
 * <DeleteButton id={1} type="news" title="ข่าวสารใหม่" />
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

/**
 * Props for the DeleteButton component.
 */
interface DeleteButtonProps {
  /** Database ID of the item to delete */
  id: number;
  /** Resource type for API endpoint construction */
  type: "news" | "schedule" | "slideshow";
  /** Item title for confirmation dialog */
  title: string;
}

/**
 * Delete button with confirmation dialog.
 *
 * @component
 * @param props - Component props
 */
export function DeleteButton({ id, type, title }: DeleteButtonProps) {
  const router = useRouter();
  /** Deletion in progress state */
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle delete with confirmation dialog.
   * Shows Thai confirmation message with item title.
   */
  const handleDelete = async () => {
    if (!confirm(`ต้องการลบ "${title}" หรือไม่?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch {
      alert("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
