"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Check, ChevronsUpDown, Filter, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Zone {
  id: string;
  code: string;
  name: string;
}

interface Hospital {
  id: string;
  code: string;
  name: string;
  province: string | null;
  zoneCode: string | null;
}

interface Props {
  zones?: Zone[];
  hospitals?: Hospital[];
  isAdmin?: boolean;
}

const statusOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "1", label: "ค้างชำระ" },
  { value: "2", label: "รอตรวจสอบ" },
  { value: "9", label: "ชำระแล้ว" },
  { value: "3", label: "ยกเลิก" },
];

export function AttendeeSearch({ zones = [], hospitals = [], isAdmin = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Read values from URL
  const zoneFromUrl = searchParams.get("zone") || "all";
  const provinceFromUrl = searchParams.get("province") || "all";
  const hospitalFromUrl = searchParams.get("hospital") || "all";
  const statusFromUrl = searchParams.get("status") || "all";

  // Popover states
  const [zoneOpen, setZoneOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Sync search state when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Derived: provinces from selected zone
  const provinces = useMemo(() => {
    let filtered = hospitals;
    if (zoneFromUrl !== "all") {
      filtered = filtered.filter((h) => h.zoneCode === zoneFromUrl);
    }
    const allProvinces = filtered
      .filter((h) => h.province)
      .map((h) => h.province as string);
    return Array.from(new Set(allProvinces)).sort((a, b) =>
      a.localeCompare(b, "th")
    );
  }, [hospitals, zoneFromUrl]);

  // Derived: hospitals from zone + province
  const filteredHospitals = useMemo(() => {
    let result = hospitals;
    if (zoneFromUrl !== "all") {
      result = result.filter((h) => h.zoneCode === zoneFromUrl);
    }
    if (provinceFromUrl !== "all") {
      result = result.filter((h) => h.province === provinceFromUrl);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, "th"));
  }, [hospitals, zoneFromUrl, provinceFromUrl]);

  const buildUrl = (options: {
    newSearch?: string;
    newZone?: string;
    newProvince?: string;
    newHospital?: string;
    newStatus?: string;
    resetPage?: boolean;
  }) => {
    const params = new URLSearchParams();
    const searchValue = options.newSearch !== undefined ? options.newSearch : search;

    if (searchValue.trim()) {
      params.set("search", searchValue);
    }

    // Filter params
    const zone = options.newZone !== undefined ? options.newZone : zoneFromUrl;
    const province = options.newProvince !== undefined ? options.newProvince : provinceFromUrl;
    const hospital = options.newHospital !== undefined ? options.newHospital : hospitalFromUrl;
    const status = options.newStatus !== undefined ? options.newStatus : statusFromUrl;

    if (zone && zone !== "all") params.set("zone", zone);
    if (province && province !== "all") params.set("province", province);
    if (hospital && hospital !== "all") params.set("hospital", hospital);
    if (status && status !== "all") params.set("status", status);

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

  // Cascade handlers
  const handleZoneChange = (value: string) => {
    router.push(
      buildUrl({
        newZone: value,
        newProvince: "all",
        newHospital: "all",
      })
    );
    setZoneOpen(false);
  };

  const handleProvinceChange = (value: string) => {
    router.push(
      buildUrl({
        newProvince: value,
        newHospital: "all",
      })
    );
    setProvinceOpen(false);
  };

  const handleHospitalChange = (value: string) => {
    router.push(buildUrl({ newHospital: value }));
    setHospitalOpen(false);
  };

  const handleStatusChange = (value: string) => {
    router.push(buildUrl({ newStatus: value }));
    setStatusOpen(false);
  };

  // Check if any filter is active
  const hasActiveFilters =
    zoneFromUrl !== "all" ||
    provinceFromUrl !== "all" ||
    hospitalFromUrl !== "all" ||
    statusFromUrl !== "all";

  // Reset all filters
  const handleResetFilters = () => {
    router.push(
      buildUrl({
        newZone: "all",
        newProvince: "all",
        newHospital: "all",
        newStatus: "all",
      })
    );
  };

  // Get display labels
  const getZoneLabel = () => {
    if (zoneFromUrl === "all") return "เขตสุขภาพ";
    const zone = zones.find((z) => z.code === zoneFromUrl);
    return zone?.name || "เขตสุขภาพ";
  };

  const getProvinceLabel = () => {
    if (provinceFromUrl === "all") return "จังหวัด";
    return provinceFromUrl;
  };

  const getHospitalLabel = () => {
    if (hospitalFromUrl === "all") return "โรงพยาบาล";
    const hospital = hospitals.find((h) => h.code === hospitalFromUrl);
    return hospital?.name || "โรงพยาบาล";
  };

  const getStatusLabel = () => {
    const status = statusOptions.find((s) => s.value === statusFromUrl);
    return status?.label || "สถานะชำระเงิน";
  };

  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
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

        {/* Reset filters button (far right) */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-9 border-kram-200 text-kram-600 hover:bg-kram-50 hover:border-kram-300 hover:text-kram-700 transition-all rounded-xl whitespace-nowrap sm:ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-kram-600">
          <Filter className="w-4 h-4" />
          <span className="font-medium">ตัวกรอง:</span>
        </div>

        {/* Zone filter (admin only) */}
        {isAdmin && (
          <Popover open={zoneOpen} onOpenChange={setZoneOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={zoneOpen}
                className={cn(
                  "w-[160px] justify-between rounded-xl border-kram-200 font-normal h-10",
                  zoneFromUrl !== "all" && "border-cyan-400 bg-cyan-50"
                )}
              >
                <span className="truncate">{getZoneLabel()}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="ค้นหาเขตสุขภาพ..." />
                <CommandList>
                  <CommandEmpty>ไม่พบเขตสุขภาพที่ค้นหา</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => handleZoneChange("all")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          zoneFromUrl === "all" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      ทั้งหมด
                    </CommandItem>
                    {zones.map((zone) => (
                      <CommandItem
                        key={zone.id}
                        value={zone.name}
                        onSelect={() => handleZoneChange(zone.code)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            zoneFromUrl === zone.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {zone.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Province filter (admin only) */}
        {isAdmin && (
          <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={provinceOpen}
                className={cn(
                  "w-[140px] justify-between rounded-xl border-kram-200 font-normal h-10",
                  provinceFromUrl !== "all" && "border-cyan-400 bg-cyan-50"
                )}
              >
                <span className="truncate">{getProvinceLabel()}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="ค้นหาจังหวัด..." />
                <CommandList>
                  <CommandEmpty>ไม่พบจังหวัดที่ค้นหา</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => handleProvinceChange("all")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          provinceFromUrl === "all" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      ทั้งหมด
                    </CommandItem>
                    {provinces.map((province) => (
                      <CommandItem
                        key={province}
                        value={province}
                        onSelect={() => handleProvinceChange(province)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            provinceFromUrl === province ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {province}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Hospital filter (admin only) */}
        {isAdmin && (
          <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={hospitalOpen}
                className={cn(
                  "w-[200px] justify-between rounded-xl border-kram-200 font-normal h-10",
                  hospitalFromUrl !== "all" && "border-cyan-400 bg-cyan-50"
                )}
              >
                <span className="truncate">{getHospitalLabel()}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="ค้นหาโรงพยาบาล..." />
                <CommandList>
                  <CommandEmpty>ไม่พบโรงพยาบาลที่ค้นหา</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => handleHospitalChange("all")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          hospitalFromUrl === "all" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      ทั้งหมด
                    </CommandItem>
                    {filteredHospitals.map((hospital) => (
                      <CommandItem
                        key={hospital.id}
                        value={hospital.name}
                        onSelect={() => handleHospitalChange(hospital.code)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            hospitalFromUrl === hospital.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {hospital.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Status filter (available for all) */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className={cn(
                "w-[160px] justify-between rounded-xl border-kram-200 font-normal h-10",
                statusFromUrl !== "all" && "border-cyan-400 bg-cyan-50"
              )}
            >
              <span className="truncate">{getStatusLabel()}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {statusOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleStatusChange(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFromUrl === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
