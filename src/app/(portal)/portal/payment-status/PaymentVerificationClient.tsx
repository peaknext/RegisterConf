"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  }
> = {
  1: {
    label: "รอตรวจสอบ",
    variant: "outline",
    icon: Clock,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  2: {
    label: "ผ่าน",
    variant: "default",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  9: {
    label: "ไม่ผ่าน",
    variant: "destructive",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
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
    return <ChevronsUpDown className="w-4 h-4 ml-1 text-gray-400" />;
  }
  return currentOrder === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1 text-indigo-600" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1 text-indigo-600" />
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
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl" />
        <div className="relative p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
            ตรวจสอบการชำระเงิน
          </h1>
          <p className="text-gray-500 mt-1">
            ตรวจสอบและยืนยันหลักฐานการชำระเงินจากผู้ลงทะเบียน
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Review */}
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-amber-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700/80">
                  รอตรวจสอบ
                </p>
                <p className="text-4xl font-bold text-amber-700 mt-2 tracking-tight">
                  {stats.pendingAttendees.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-amber-600/70 mt-1">คน</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-indigo-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700/80">
                  ยอดเงินรอตรวจสอบ
                </p>
                <p className="text-4xl font-bold text-indigo-700 mt-2 tracking-tight">
                  {stats.pendingAmount.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-indigo-600/70 mt-1">บาท</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Banknote className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Success */}
        <Card className="relative overflow-hidden border-0 shadow-lg shadow-emerald-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="relative pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700/80">
                  ชำระเงินสำเร็จ
                </p>
                <p className="text-4xl font-bold text-emerald-700 mt-2 tracking-tight">
                  {stats.paidAttendees.toLocaleString("th-TH")}
                </p>
                <p className="text-sm text-emerald-600/70 mt-1">คน</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Table */}
      <Card className="border-0 shadow-xl shadow-gray-200/50">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              รายการแจ้งชำระเงิน
              <Badge variant="secondary" className="ml-2">
                {totalFinances} รายการ
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {finances.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">ไม่พบรายการแจ้งชำระเงิน</p>
              <p className="text-gray-400 text-sm mt-1">
                ยังไม่มีผู้ลงทะเบียนแจ้งชำระเงินเข้ามา
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="px-6 py-4 text-left font-semibold text-gray-600 w-16">
                        ลำดับ
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        <Link
                          href={getSortUrl(
                            "createdAt",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          วันที่แจ้ง
                          <SortIcon
                            field="createdAt"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        <Link
                          href={getSortUrl(
                            "hospital",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          หน่วยงาน
                          <SortIcon
                            field="hospital"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        <Link
                          href={getSortUrl(
                            "attendeeCount",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          จำนวนคน
                          <SortIcon
                            field="attendeeCount"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        ยอดเงิน
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-600">
                        <Link
                          href={getSortUrl(
                            "status",
                            sortField,
                            sortOrder,
                            statusFilter
                          )}
                          className="flex items-center hover:text-indigo-600 transition-colors"
                        >
                          สถานะ
                          <SortIcon
                            field="status"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-600">
                        ตรวจสอบ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {finances.map((finance, index) => {
                      const status = statusConfig[finance.status] || statusConfig[1];
                      const StatusIcon = status.icon;
                      const rowNumber = startIndex + index + 1;

                      return (
                        <tr
                          key={finance.id}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 text-gray-500 font-medium">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-700">
                              {formatDate(finance.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">
                              {finance.hospitalName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-700">
                                {finance.attendeeCount}
                              </span>
                              <span className="text-gray-400 text-sm">คน</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-indigo-600">
                              {finance.amount.toLocaleString("th-TH")}
                            </span>
                            <span className="text-gray-400 text-sm ml-1">บาท</span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor}`}
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
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all group-hover:shadow-md"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <DialogTitle className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ตรวจสอบหลักฐานการชำระเงิน
            </DialogTitle>
            <DialogDescription className="text-indigo-600/70">
              รายการ #{selectedFinance?.id} • {formatDate(selectedFinance?.createdAt || null)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-h-[60vh] overflow-hidden">
            {/* Left Column - Slip Image */}
            <div className="bg-gray-900 p-6 flex items-center justify-center min-h-[400px] relative overflow-auto">
              {selectedFinance?.fileName ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={selectedFinance.fileName}
                    alt="หลักฐานการชำระเงิน"
                    width={400}
                    height={600}
                    className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-2xl"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>ไม่พบไฟล์หลักฐาน</p>
                </div>
              )}
            </div>

            {/* Right Column - Attendee List */}
            <div className="bg-white p-6 overflow-auto max-h-[60vh]">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  รายชื่อผู้ลงทะเบียน
                  <Badge variant="secondary" className="ml-auto">
                    {selectedFinance?.attendeeCount || 0} คน
                  </Badge>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
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
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {attendee.prefix}
                              {attendee.firstName} {attendee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {attendee.hospital?.name || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">
                            {price.toLocaleString("th-TH")}
                          </p>
                          <p className="text-xs text-gray-400">บาท</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Amount */}
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold">
                      {(selectedFinance?.amount || 0).toLocaleString("th-TH")}
                    </span>
                    <span className="text-indigo-200 ml-2">บาท</span>
                  </div>
                </div>
              </div>

              {/* Status Warning */}
              {selectedFinance?.status === 1 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">รอการตรวจสอบ</p>
                    <p className="text-sm text-amber-700">
                      กรุณาตรวจสอบหลักฐานการชำระเงินให้ครบถ้วนก่อนยืนยัน
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50 gap-3">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              ปิดหน้าต่าง
            </Button>

            {selectedFinance?.status === 1 && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={isLoading}
                  className="min-w-[140px] bg-red-500 hover:bg-red-600"
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
                  className="min-w-[180px] bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-200"
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
