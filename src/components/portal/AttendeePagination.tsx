/**
 * Pagination component for attendee lists with URL-based state.
 *
 * Features:
 * - Page navigation (previous/next buttons)
 * - Configurable items per page (10, 25, 50, 100)
 * - URL parameter preservation (search, sort, order, hidePaid)
 * - Display of current range and total count
 * - Automatic page reset when changing limit
 *
 * URL Parameters managed:
 * - page: Current page number
 * - limit: Items per page (omitted if default 10)
 * - Preserves: search, sort, order, hidePaid from existing URL
 *
 * @module components/portal/AttendeePagination
 *
 * @example
 * <AttendeePagination
 *   currentPage={1}
 *   totalPages={10}
 *   total={95}
 *   limit={10}
 *   startIndex={0}
 *   basePath="/portal/registration"
 * />
 */
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

/**
 * Available options for items per page dropdown.
 */
const LIMIT_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

/**
 * Props for the AttendeePagination component.
 */
interface AttendeePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total count of all records */
  total: number;
  /** Number of items per page */
  limit: number;
  /** Starting index for display (0-indexed) */
  startIndex: number;
  /** Base URL path for pagination links (default: /portal/registration) */
  basePath?: string;
}

/**
 * Pagination component with URL-based state management.
 *
 * @component
 * @param props - Component props
 */
export function AttendeePagination({
  currentPage,
  totalPages,
  total,
  limit,
  startIndex,
  basePath = "/portal/registration",
}: AttendeePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Build URL with pagination parameters while preserving existing search params.
   *
   * @param newPage - Target page number
   * @param newLimit - Optional new items per page (omits if 10)
   * @returns Complete URL string with all parameters
   */
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

    return `${basePath}?${params.toString()}`;
  };

  /**
   * Handle items-per-page change. Resets to page 1 to avoid
   * landing on an invalid page when total pages decrease.
   *
   * @param value - New limit value as string
   */
  const handleLimitChange = (value: string) => {
    router.push(buildUrl(1, parseInt(value)));
  };

  /**
   * Navigate to previous page if not on first page.
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      router.push(buildUrl(currentPage - 1));
    }
  };

  /**
   * Navigate to next page if not on last page.
   */
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
