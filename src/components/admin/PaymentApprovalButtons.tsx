"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PaymentApprovalButtonsProps {
  paymentId: number;
}

export function PaymentApprovalButtons({ paymentId }: PaymentApprovalButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);

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
