"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPaymentImageUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AttendeePagination } from "@/components/portal/AttendeePagination";
import {
  Users,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  Loader2,
  Search,
  AlertTriangle,
} from "lucide-react";

interface Attendee {
  id: number;
  prefix: string | null;
  firstName: string | null;
  lastName: string | null;
  regTypeId: number | null;
  hospital: { name: string } | null;
}

interface Finance {
  id: number;
  memberId: number | null;
  attendeeIds: string | null;
  fileName: string | null;
  status: number;
  createdAt: Date;
  confirmedAt: Date | null;
  paidDate: Date | null;
  hospitalName: string;
  attendeeCount: number;
  amount: number;
  attendees: Attendee[];
}

interface Stats {
  pendingAttendees: number;
  pendingAmount: number;
  paidAttendees: number;
}

type SortField = "createdAt" | "hospital" | "attendeeCount" | "status";
type SortOrder = "asc" | "desc";

interface Props {
  finances: Finance[];
  stats: Stats;
  totalFinances: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  startIndex: number;
  sortField: SortField;
  sortOrder: SortOrder;
  statusFilter?: number;
  meetPrice: number;
  meetPriceFollow: number;
}

const statusConfig: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof Clock;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  1: {
    label: "รอตรวจสอบ",
    variant: "outline",
    icon: Clock,
    bgColor: "bg-gradient-to-r from-cyan-50 to-kram-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
  },
  2: {
    label: "ผ่าน",
    variant: "default",
    icon: CheckCircle2,
    bgColor: "bg-gradient-to-r from-emerald-50 to-cyan-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  9: {
    label: "ไม่ผ่าน",
    variant: "destructive",
    icon: XCircle,
    bgColor: "bg-gradient-to-r from-red-50 to-orange-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
};

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SortIcon({
  field,
  currentField,
  currentOrder,
}: {
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
}) {
  if (field !== currentField) {
    return <ChevronsUpDown className="w-4 h-4 ml-1 text-kram-300" />;
  }
  return currentOrder === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1 text-cyan-600" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1 text-cyan-600" />
  );
}

function getSortUrl(
  field: SortField,
  currentField: SortField,
  currentOrder: SortOrder,
  statusFilter?: number
) {
  const params = new URLSearchParams();

  if (statusFilter !== undefined) {
    params.set("status", String(statusFilter));
  }

  if (field === currentField) {
    params.set("sort", field);
    params.set("order", currentOrder === "asc" ? "desc" : "asc");
  } else {
    params.set("sort", field);
    params.set("order", "asc");
  }
  params.set("page", "1");

  return `?${params.toString()}`;
}

export default function PaymentVerificationClient({
  finances,
  stats,
  totalFinances,
  totalPages,
  currentPage,
  limit,
  startIndex,
  sortField,
  sortOrder,
  statusFilter,
  meetPrice,
  meetPriceFollow,
}: Props) {
  const router = useRouter();
  const [selectedFinance, setSelectedFinance] = useState<Finance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Drag-to-scroll state for payment slip image
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - imageContainerRef.current.offsetTop);
    setScrollTop(imageContainerRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return;
    e.preventDefault();
    const y = e.pageY - imageContainerRef.current.offsetTop;
    const walk = (y - startY) * 1.5; // Scroll speed multiplier
    imageContainerRef.current.scrollTop = scrollTop - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const openModal = (finance: Finance) => {
    setSelectedFinance(finance);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFinance(null);
    setActionType(null);
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedFinance) return;

    setIsLoading(true);
    setActionType(action);

    try {
      const res = await fetch(`/api/admin/payments/${selectedFinance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error();

      closeModal();
      router.refresh();
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with KramSakon theme */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-kram-100 to-cyan-100 text-kram-700 text-sm font-medium rounded-full mb-3 border border-kram-200/50">
          <FileText className="w-4 h-4 text-kram-600" />
          <span>การชำระเงิน</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
          ตรวจสอบการชำระเงิน
        </h1>
        <p className="text-kram-500 mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          ตรวจสอบและยืนยันหลักฐานการชำระเงินจากผู้ลงทะเบียน
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in [animation-delay:100ms]">
        {/* Pending Review */}
        <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-kram-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-kram-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-700">
                  รอตรวจสอบ
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-kram-600 bg-clip-text text-transparent mt-2 tracking-tight">
                  {stats.pendingAttendees.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-kram-400 mt-1">คน</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-kram-100 flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-500/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kram-500 to-cyan-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-kram-200/30 to-cyan-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-kram-700">
                  ยอดเงินรอตรวจสอบ
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-kram-600 to-kram-800 bg-clip-text text-transparent mt-2 tracking-tight">
                  {stats.pendingAmount.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-kram-400 mt-1">บาท</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center shadow-sm">
                <Banknote className="w-6 h-6 text-kram-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Success */}
        <Card className="group relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-cyan-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  ชำระเงินสำเร็จ
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mt-2 tracking-tight">
                  {stats.paidAttendees.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-kram-400 mt-1">คน</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Table */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:200ms]">
        <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-kram-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-kram-900">
                รายการแจ้งชำระเงิน
              </CardTitle>
              <p className="text-sm text-kram-500">{totalFinances} รายการ</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {finances.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-kram-400" />
              </div>
              <p className="text-kram-600 font-medium mb-2">ไม่พบรายการแจ้งชำระเงิน</p>
              <p className="text-kram-400 text-sm">
                ยังไม่มีผู้ลงทะเบียนแจ้งชำระเงินเข้ามา
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kram-100">
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm w-16">
                        ลำดับ
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "createdAt",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          วันที่แจ้ง
                          <SortIcon
                            field="createdAt"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "hospital",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          หน่วยงาน
                          <SortIcon
                            field="hospital"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "attendeeCount",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          จำนวนคน
                          <SortIcon
                            field="attendeeCount"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        ยอดเงิน
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "status",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          สถานะ
                          <SortIcon
                            field="status"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-kram-600 text-sm">
                        ตรวจสอบ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kram-50">
                    {finances.map((finance, index) => {
                      const status = statusConfig[finance.status] || statusConfig[1];
                      const StatusIcon = status.icon;
                      const rowNumber = startIndex + index + 1;

                      return (
                        <tr
                          key={finance.id}
                          className="group hover:bg-gradient-to-r hover:from-kram-50/50 hover:to-cyan-50/30 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-kram-400 font-medium">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-kram-700">
                              {formatDate(finance.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-kram-900">
                              {finance.hospitalName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-kram-400" />
                              <span className="font-semibold text-kram-700">
                                {finance.attendeeCount}
                              </span>
                              <span className="text-kram-400 text-sm">คน</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold bg-gradient-to-r from-kram-600 to-cyan-600 bg-clip-text text-transparent">
                              {finance.amount.toLocaleString("th-TH")}
                            </span>
                            <span className="text-kram-400 text-sm ml-1">บาท</span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor} border ${status.borderColor}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal(finance)}
                              className="border-kram-200 text-kram-600 hover:bg-kram-50 hover:border-cyan-300 hover:text-kram-700 transition-all group-hover:shadow-md"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              ตรวจสอบ
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 pb-4">
                  <AttendeePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={totalFinances}
                    limit={limit}
                    startIndex={startIndex}
                    basePath="/portal/payment-status"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-kram-50 to-cyan-50">
            <DialogTitle className="text-xl font-bold text-kram-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-kram-600" />
              </div>
              ตรวจสอบหลักฐานการชำระเงิน
            </DialogTitle>
            <DialogDescription className="text-kram-500 ml-13">
              รายการ #{selectedFinance?.id} • {formatDate(selectedFinance?.createdAt || null)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[60vh] overflow-hidden">
            {/* Left Column - Slip Image with drag-to-scroll */}
            <div
              ref={imageContainerRef}
              className={`bg-gradient-to-br from-kram-900 to-kram-950 p-4 min-h-[400px] max-h-[60vh] overflow-y-auto overflow-x-hidden relative select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {selectedFinance?.fileName ? (
                <div className="flex justify-center">
                  <Image
                    src={getPaymentImageUrl(selectedFinance.fileName) || ""}
                    alt="หลักฐานการชำระเงิน"
                    width={400}
                    height={1200}
                    className="w-full h-auto object-contain rounded-xl shadow-2xl border border-kram-700"
                    unoptimized
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="text-center text-kram-400 flex flex-col items-center justify-center min-h-[300px]">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>ไม่พบไฟล์หลักฐาน</p>
                </div>
              )}
            </div>

            {/* Right Column - Attendee List */}
            <div className="bg-white p-6 overflow-auto max-h-[60vh]">
              <div className="mb-4">
                <h3 className="font-bold text-kram-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-kram-600" />
                  รายชื่อผู้ลงทะเบียน
                  <Badge variant="secondary" className="ml-auto bg-kram-100 text-kram-700">
                    {selectedFinance?.attendeeCount || 0} คน
                  </Badge>
                </h3>
                <p className="text-sm text-kram-500 mt-1">
                  {selectedFinance?.hospitalName}
                </p>
              </div>

              <div className="space-y-3">
                {selectedFinance?.attendees.map((attendee, index) => {
                  const price =
                    attendee.regTypeId === 6 ? meetPriceFollow : meetPrice;
                  return (
                    <div
                      key={attendee.id}
                      className="p-4 bg-gradient-to-r from-kram-50/50 to-cyan-50/30 rounded-xl border border-kram-100 hover:border-cyan-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-kram-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-kram-900">
                              {attendee.prefix}
                              {attendee.firstName} {attendee.lastName}
                            </p>
                            <p className="text-sm text-kram-500">
                              {attendee.hospital?.name || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold bg-gradient-to-r from-kram-600 to-cyan-600 bg-clip-text text-transparent">
                            {price.toLocaleString("th-TH")}
                          </p>
                          <p className="text-xs text-kram-400">บาท</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Amount */}
              <div className="mt-6 p-4 bg-gradient-to-r from-kram-600 via-kram-700 to-cyan-600 rounded-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                <div className="relative flex items-center justify-between">
                  <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold">
                      {(selectedFinance?.amount || 0).toLocaleString("th-TH")}
                    </span>
                    <span className="text-cyan-200 ml-2">บาท</span>
                  </div>
                </div>
              </div>

              {/* Status Warning */}
              {selectedFinance?.status === 1 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-kram-50 border border-cyan-200/50 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-kram-800">รอการตรวจสอบ</p>
                    <p className="text-sm text-kram-600">
                      กรุณาตรวจสอบหลักฐานการชำระเงินให้ครบถ้วนก่อนยืนยัน
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-kram-50/50 to-cyan-50/50 gap-3">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isLoading}
              className="min-w-[120px] border-kram-200 text-kram-600 hover:bg-kram-50"
            >
              ปิดหน้าต่าง
            </Button>

            {selectedFinance?.status === 1 && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={isLoading}
                  className="min-w-[140px] bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isLoading && actionType === "reject" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  ไม่ผ่าน
                </Button>
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={isLoading}
                  className="min-w-[180px] bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/20"
                >
                  {isLoading && actionType === "approve" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  ยืนยันชำระเงินสำเร็จ
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
