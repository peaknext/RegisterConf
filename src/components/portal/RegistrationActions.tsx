"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Loader2, FileSpreadsheet } from "lucide-react";

export function RegistrationActions() {
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Build URL with current filters
      const params = new URLSearchParams();
      const search = searchParams.get("search");
      const zone = searchParams.get("zone");
      const province = searchParams.get("province");
      const hospital = searchParams.get("hospital");
      const status = searchParams.get("status");

      if (search) params.set("search", search);
      if (zone) params.set("zone", zone);
      if (province) params.set("province", province);
      if (hospital) params.set("hospital", hospital);
      if (status) params.set("status", status);

      const queryString = params.toString();
      const url = `/api/registration/export-xlsx${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `registration_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/portal/payment">
        <Button
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 transition-all duration-300"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          แจ้งชำระเงิน
        </Button>
      </Link>

      <Button
        variant="outline"
        onClick={handleExport}
        disabled={isExporting}
        className="border-kram-300 text-kram-700 hover:bg-kram-50 hover:border-kram-400 hover:text-kram-800 transition-all duration-300"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 mr-2" />
        )}
        Export to Excel
      </Button>
    </div>
  );
}
