"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

export function AttendeeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Read values from URL
  const hidePaidFromUrl = searchParams.get("hidePaid") === "true";

  // Sync search state when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const buildUrl = (options: {
    newSearch?: string;
    newHidePaid?: boolean;
    resetPage?: boolean;
  }) => {
    const params = new URLSearchParams();
    const searchValue = options.newSearch !== undefined ? options.newSearch : search;
    const hidePaidValue = options.newHidePaid !== undefined ? options.newHidePaid : hidePaidFromUrl;

    if (searchValue.trim()) {
      params.set("search", searchValue);
    }
    if (hidePaidValue) {
      params.set("hidePaid", "true");
    }
    // Preserve sort, order, limit params
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    const limit = searchParams.get("limit");
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    if (limit) params.set("limit", limit);

    // Reset to page 1 on filter change, or preserve current page
    if (options.resetPage !== false) {
      params.set("page", "1");
    } else {
      const page = searchParams.get("page");
      if (page) params.set("page", page);
    }

    const queryString = params.toString();
    return queryString ? `/portal/registration?${queryString}` : "/portal/registration";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ newSearch: search }));
  };

  const handleClear = () => {
    setSearch("");
    router.push(buildUrl({ newSearch: "" }));
  };

  const handleHidePaidChange = (checked: boolean) => {
    router.push(buildUrl({ newHidePaid: checked }));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <form onSubmit={handleSearch} className="flex gap-2 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อ, อีเมล, โรงพยาบาล, จังหวัด, เขต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button type="submit">ค้นหา</Button>
      </form>

      <div className="flex items-center gap-2">
        <Switch
          id="hide-paid"
          checked={hidePaidFromUrl}
          onCheckedChange={handleHidePaidChange}
        />
        <Label htmlFor="hide-paid" className="text-sm text-gray-600 cursor-pointer whitespace-nowrap">
          ซ่อนผู้ที่ชำระเงินแล้ว
        </Label>
      </div>
    </div>
  );
}
