/**
 * Export buttons for reports page (CSV and Excel formats).
 *
 * Features:
 * - CSV export button
 * - Excel (XLSX) export button
 * - Loading state for each format
 * - File download via blob
 *
 * API: GET /api/reports/export?type=[type]&format=[format]&hospital=[code]
 *
 * @module components/portal/ExportButtons
 *
 * @example
 * <ExportButtons reportType="attendees" hospitalCode="H001" />
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

/**
 * Props for the ExportButtons component.
 */
interface ExportButtonsProps {
  /** Type of report to export (e.g., "attendees", "payments") */
  reportType: string;
  /** Hospital code filter for scoped exports */
  hospitalCode: string;
}

/**
 * CSV/Excel export button pair for reports.
 *
 * @component
 * @param props - Component props
 */
export function ExportButtons({ reportType, hospitalCode }: ExportButtonsProps) {
  /** Which format is currently exporting (null = neither) */
  const [isExporting, setIsExporting] = useState<string | null>(null);

  /**
   * Handle export for specified format.
   * Downloads file via blob and programmatic link click.
   * @param format - Export format ("csv" or "excel")
   */
  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(format);

    try {
      const response = await fetch(
        `/api/reports/export?type=${reportType}&format=${format}&hospital=${hospitalCode}`
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportType}_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={isExporting !== null}
      >
        {isExporting === "csv" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("excel")}
        disabled={isExporting !== null}
      >
        {isExporting === "excel" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Excel
      </Button>
    </div>
  );
}
