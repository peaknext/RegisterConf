/**
 * Payment approval/rejection buttons for admin payment review.
 *
 * Displays approve (green) and reject (red) buttons for pending payments.
 * Calls PATCH /api/admin/payments/[id] with action parameter.
 *
 * Side effects on approval:
 * - Updates finance.status to 2 (approved)
 * - Updates all linked attendees' status to 9 (paid)
 *
 * Side effects on rejection:
 * - Updates finance.status to 9 (rejected)
 * - Resets all linked attendees' status to 1 (pending)
 *
 * @module components/admin/PaymentApprovalButtons
 *
 * @example
 * <PaymentApprovalButtons paymentId={123} />
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Props for the PaymentApprovalButtons component.
 */
interface PaymentApprovalButtonsProps {
  /** Database ID of the finance/payment record */
  paymentId: number;
}

/**
 * Approve/reject button pair for payment review.
 *
 * @component
 * @param props - Component props
 * @param props.paymentId - Finance record ID to approve/reject
 */
export function PaymentApprovalButtons({ paymentId }: PaymentApprovalButtonsProps) {
  const router = useRouter();
  /** Which action is currently processing (null = neither) */
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);

  /**
   * Handle approve or reject action with confirmation.
   * @param action - "approve" or "reject"
   */
  const handleAction = async (action: "approve" | "reject") => {
    if (!confirm(`ต้องการ${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}รายการนี้หรือไม่?`)) {
      return;
    }

    setIsLoading(action);

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      router.refresh();
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleAction("approve")}
        disabled={isLoading !== null}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading === "approve" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            อนุมัติ
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleAction("reject")}
        disabled={isLoading !== null}
      >
        {isLoading === "reject" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1" />
            ปฏิเสธ
          </>
        )}
      </Button>
    </div>
  );
}
