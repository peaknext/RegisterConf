"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LIMIT_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

interface AttendeePaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  startIndex: number;
}

export function AttendeePagination({
  currentPage,
  totalPages,
  total,
  limit,
  startIndex,
}: AttendeePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = (newPage: number, newLimit?: number) => {
    const params = new URLSearchParams();

    // Preserve existing params
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    const hidePaid = searchParams.get("hidePaid");

    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    if (hidePaid) params.set("hidePaid", hidePaid);

    const limitValue = newLimit !== undefined ? newLimit : limit;
    if (limitValue !== 10) {
      params.set("limit", String(limitValue));
    }

    params.set("page", String(newPage));

    return `/portal/registration?${params.toString()}`;
  };

  const handleLimitChange = (value: string) => {
    // Reset to page 1 when changing limit
    router.push(buildUrl(1, parseInt(value)));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      router.push(buildUrl(currentPage - 1));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      router.push(buildUrl(currentPage + 1));
    }
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t mt-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>แสดง</span>
        <Select value={String(limit)} onValueChange={handleLimitChange}>
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>รายการ | {startIndex + 1} - {Math.min(startIndex + limit, total)} จาก {total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">
          หน้า {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
