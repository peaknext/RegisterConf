"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  FileText,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Check,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
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

interface Position {
  id: string;
  code: string;
  name: string;
}

interface Level {
  id: string;
  code: string;
  group: string | null;
  name: string;
}

interface Hotel {
  id: number;
  name: string;
  status: string;
}

interface RegType {
  id: number;
  name: string;
}

interface Attendee {
  id: number;
  prefix: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: number;
  foodType: number | null;
  vehicleType: number | null;
  hotelId: number | null;
  busToMeet: number | null;
  airShuttle: number | null;
  regTypeId: number | null;
  positionCode: string | null;
  levelCode: string | null;
  hospital: {
    name: string;
    province: string | null;
    zone: { name: string; code: string } | null;
  } | null;
  position: { name: string } | null;
  level: { name: string; group: string | null } | null;
  regType: { name: string } | null;
  hotel: { name: string } | null;
}

interface Props {
  zones: Zone[];
  hospitals: Hospital[];
  positions: Position[];
  levels: Level[];
  hotels: Hotel[];
  regTypes: RegType[];
  attendees: Attendee[];
  isAdmin: boolean;
}

// Report Types
const reportTypes = [
  { value: "all", label: "ทั้งหมด" },
  { value: "position", label: "ประเภทตำแหน่ง" },
  { value: "regStatus", label: "สถานะของผู้ลงทะเบียน" },
  { value: "food", label: "ประเภทอาหาร" },
  { value: "hotel", label: "ประเภทโรงแรม" },
  { value: "vehicle", label: "ประเภทการเดินทาง" },
  { value: "payment", label: "สถานะการชำระเงิน" },
];

// Status mappings
const statusLabels: Record<number, string> = {
  1: "ค้างชำระ",
  2: "รอตรวจสอบ",
  3: "ยกเลิก",
  9: "ชำระแล้ว",
};

const statusConfig: Record<number, { label: string; className: string }> = {
  1: { label: "ค้างชำระ", className: "bg-amber-100 text-amber-700 border-amber-200" },
  2: { label: "รอตรวจสอบ", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  3: { label: "ยกเลิก", className: "bg-red-100 text-red-700 border-red-200" },
  9: { label: "ชำระแล้ว", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const foodLabels: Record<number, string> = {
  1: "อาหารทั่วไป",
  2: "อาหารอิสลาม",
  3: "อาหารมังสวิรัติ",
  4: "อาหารเจ",
};

const vehicleLabels: Record<number, string> = {
  1: "เครื่องบิน",
  2: "รถโดยสาร",
  3: "รถยนต์ส่วนตัว/ราชการ",
  4: "รถไฟ",
};

const shuttleLabels: Record<number, string> = {
  1: "ต้องการ",
  2: "ไม่ต้องการ",
};

// Pagination options
const LIMIT_OPTIONS = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

type SortField = "zone" | "name" | "hospital" | "position" | "phone" | "status";
type SortOrder = "asc" | "desc";

export default function ReportsClient({
  zones,
  hospitals,
  positions,
  levels,
  hotels,
  regTypes,
  attendees,
  isAdmin,
}: Props) {
  // Report type selection
  const [reportType, setReportType] = useState<string>("all");
  const [reportTypeOpen, setReportTypeOpen] = useState(false);

  // Cascade filters
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");

  // Open states for comboboxes
  const [zoneOpen, setZoneOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);

  // Report-specific filters
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedPositionGroup, setSelectedPositionGroup] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedRegType, setSelectedRegType] = useState<string>("all");
  const [selectedFood, setSelectedFood] = useState<string>("all");
  const [selectedHotelFilter, setSelectedHotelFilter] = useState<string>("all");
  const [selectedBusToMeet, setSelectedBusToMeet] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedShuttle, setSelectedShuttle] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  // Open states for specific filters
  const [positionOpen, setPositionOpen] = useState(false);
  const [positionGroupOpen, setPositionGroupOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [hotelFilterOpen, setHotelFilterOpen] = useState(false);

  // Table state
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Derived: provinces from selected zone
  const provinces = useMemo(() => {
    if (selectedZone === "all") {
      const allProvinces = hospitals
        .filter((h) => h.province)
        .map((h) => h.province as string);
      return Array.from(new Set(allProvinces)).sort();
    }
    const filteredProvinces = hospitals
      .filter((h) => h.zoneCode === selectedZone && h.province)
      .map((h) => h.province as string);
    return Array.from(new Set(filteredProvinces)).sort();
  }, [hospitals, selectedZone]);

  // Derived: hospitals from selected zone + province
  const filteredHospitals = useMemo(() => {
    let result = hospitals;
    if (selectedZone !== "all") {
      result = result.filter((h) => h.zoneCode === selectedZone);
    }
    if (selectedProvince !== "all") {
      result = result.filter((h) => h.province === selectedProvince);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, "th"));
  }, [hospitals, selectedZone, selectedProvince]);

  // Derived: unique position groups from levels
  const levelGroups = useMemo(() => {
    const groups = levels
      .map((l) => l.group)
      .filter((g): g is string => !!g);
    return Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b, "th"));
  }, [levels]);

  // Derived: levels based on selected position group (cascade)
  const filteredLevels = useMemo(() => {
    if (selectedPositionGroup === "all") return levels;
    return levels.filter((l) => l.group === selectedPositionGroup);
  }, [levels, selectedPositionGroup]);

  // Active hotels only (status "1" = active from page.tsx query)
  const activeHotels = useMemo(() => {
    return hotels;  // Already filtered in page.tsx with status: "1"
  }, [hotels]);

  // Filtered attendees based on all filters
  const filteredAttendees = useMemo(() => {
    let result = attendees;

    // Zone filter
    if (selectedZone !== "all") {
      result = result.filter((a) => a.hospital?.zone?.code === selectedZone);
    }

    // Province filter
    if (selectedProvince !== "all") {
      result = result.filter((a) => a.hospital?.province === selectedProvince);
    }

    // Hospital filter
    if (selectedHospital !== "all") {
      result = result.filter(
        (a) =>
          hospitals.find((h) => h.code === selectedHospital)?.name ===
          a.hospital?.name
      );
    }

    // Report-specific filters
    if (reportType === "position") {
      if (selectedPosition !== "all") {
        result = result.filter((a) => a.positionCode === selectedPosition);
      }
      if (selectedPositionGroup !== "all") {
        result = result.filter((a) => a.level?.group === selectedPositionGroup);
      }
      if (selectedLevel !== "all") {
        result = result.filter((a) => a.levelCode === selectedLevel);
      }
    }

    if (reportType === "regStatus") {
      if (selectedRegType !== "all") {
        result = result.filter((a) => a.regTypeId === parseInt(selectedRegType));
      }
    }

    if (reportType === "food") {
      if (selectedFood !== "all") {
        result = result.filter((a) => a.foodType === parseInt(selectedFood));
      }
    }

    if (reportType === "hotel") {
      if (selectedHotelFilter !== "all") {
        result = result.filter((a) => a.hotelId === parseInt(selectedHotelFilter));
      }
      if (selectedBusToMeet !== "all") {
        result = result.filter((a) => a.busToMeet === parseInt(selectedBusToMeet));
      }
    }

    if (reportType === "vehicle") {
      if (selectedVehicle !== "all") {
        result = result.filter((a) => a.vehicleType === parseInt(selectedVehicle));
      }
      if (selectedShuttle !== "all") {
        // Check any shuttle field based on vehicle type
        result = result.filter((a) => {
          const shuttleValue = parseInt(selectedShuttle);
          return (
            a.airShuttle === shuttleValue ||
            a.busToMeet === shuttleValue
          );
        });
      }
    }

    if (reportType === "payment") {
      if (selectedPaymentStatus !== "all") {
        result = result.filter(
          (a) => a.status === parseInt(selectedPaymentStatus)
        );
      }
    }

    return result;
  }, [
    attendees,
    selectedZone,
    selectedProvince,
    selectedHospital,
    reportType,
    selectedPosition,
    selectedPositionGroup,
    selectedLevel,
    selectedRegType,
    selectedFood,
    selectedHotelFilter,
    selectedBusToMeet,
    selectedVehicle,
    selectedShuttle,
    selectedPaymentStatus,
    hospitals,
  ]);

  // Sorted attendees
  const sortedAttendees = useMemo(() => {
    const sorted = [...filteredAttendees].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "zone":
          aVal = a.hospital?.zone?.name || "";
          bVal = b.hospital?.zone?.name || "";
          break;
        case "name":
          aVal = `${a.firstName || ""} ${a.lastName || ""}`;
          bVal = `${b.firstName || ""} ${b.lastName || ""}`;
          break;
        case "hospital":
          aVal = a.hospital?.name || "";
          bVal = b.hospital?.name || "";
          break;
        case "position":
          aVal = a.position?.name || "";
          bVal = b.position?.name || "";
          break;
        case "phone":
          aVal = a.phone || "";
          bVal = b.phone || "";
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal, "th")
          : bVal.localeCompare(aVal, "th");
      }
      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredAttendees, sortField, sortOrder]);

  // Paginated attendees
  const paginatedAttendees = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return sortedAttendees.slice(start, start + limit);
  }, [sortedAttendees, currentPage, limit]);

  const totalPages = Math.ceil(sortedAttendees.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, sortedAttendees.length);

  // Handle zone change - reset province and hospital
  const handleZoneChange = (value: string) => {
    setSelectedZone(value);
    setSelectedProvince("all");
    setSelectedHospital("all");
    setCurrentPage(1);
  };

  // Handle province change - reset hospital
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedHospital("all");
    setCurrentPage(1);
  };

  // Handle report type change - reset specific filters
  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    setSelectedPosition("all");
    setSelectedPositionGroup("all");
    setSelectedLevel("all");
    setSelectedRegType("all");
    setSelectedFood("all");
    setSelectedHotelFilter("all");
    setSelectedBusToMeet("all");
    setSelectedVehicle("all");
    setSelectedShuttle("all");
    setSelectedPaymentStatus("all");
    setCurrentPage(1);
  };

  // Handle position group change - reset level (cascade)
  const handlePositionGroupChange = (value: string) => {
    setSelectedPositionGroup(value);
    setSelectedLevel("all");
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setReportType("all");
    setSelectedZone("all");
    setSelectedProvince("all");
    setSelectedHospital("all");
    setSelectedPosition("all");
    setSelectedPositionGroup("all");
    setSelectedLevel("all");
    setSelectedRegType("all");
    setSelectedFood("all");
    setSelectedHotelFilter("all");
    setSelectedBusToMeet("all");
    setSelectedVehicle("all");
    setSelectedShuttle("all");
    setSelectedPaymentStatus("all");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters =
    reportType !== "all" ||
    selectedZone !== "all" ||
    selectedProvince !== "all" ||
    selectedHospital !== "all" ||
    selectedPosition !== "all" ||
    selectedPositionGroup !== "all" ||
    selectedLevel !== "all" ||
    selectedRegType !== "all" ||
    selectedFood !== "all" ||
    selectedHotelFilter !== "all" ||
    selectedBusToMeet !== "all" ||
    selectedVehicle !== "all" ||
    selectedShuttle !== "all" ||
    selectedPaymentStatus !== "all";

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Export to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (reportType) params.set("reportType", reportType);
      if (selectedZone !== "all") params.set("zoneCode", selectedZone);
      if (selectedProvince !== "all") params.set("province", selectedProvince);
      if (selectedHospital !== "all") params.set("hospitalCode", selectedHospital);
      if (reportType === "position" && selectedPosition !== "all")
        params.set("positionCode", selectedPosition);
      if (reportType === "position" && selectedPositionGroup !== "all")
        params.set("positionGroup", selectedPositionGroup);
      if (reportType === "position" && selectedLevel !== "all")
        params.set("levelCode", selectedLevel);
      if (reportType === "regStatus" && selectedRegType !== "all")
        params.set("regTypeId", selectedRegType);
      if (reportType === "food" && selectedFood !== "all")
        params.set("foodType", selectedFood);
      if (reportType === "hotel" && selectedHotelFilter !== "all")
        params.set("hotelId", selectedHotelFilter);
      if (reportType === "hotel" && selectedBusToMeet !== "all")
        params.set("busToMeet", selectedBusToMeet);
      if (reportType === "vehicle" && selectedVehicle !== "all")
        params.set("vehicleType", selectedVehicle);
      if (reportType === "vehicle" && selectedShuttle !== "all")
        params.set("shuttle", selectedShuttle);
      if (reportType === "payment" && selectedPaymentStatus !== "all")
        params.set("paymentStatus", selectedPaymentStatus);

      const res = await fetch(`/api/reports/export-xlsx?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `รายงาน_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    } finally {
      setIsExporting(false);
    }
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 ml-1 text-kram-300" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1 text-cyan-600" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 text-cyan-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-kram-100 to-cyan-100 text-kram-700 text-sm font-medium rounded-full mb-3 border border-kram-200/50">
          <FileText className="w-4 h-4 text-kram-600" />
          <span>รายงาน</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
          รายงานข้อมูลผู้ลงทะเบียน
        </h1>
        <p className="text-kram-500 mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          กรองและส่งออกข้อมูลผู้ลงทะเบียนตามเงื่อนไขที่ต้องการ
        </p>
      </div>

      {/* Filter Card */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:100ms]">
        <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <Filter className="w-5 h-5 text-kram-600" />
              </div>
              ตัวกรองรายงาน
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="border-kram-200 text-kram-600 hover:bg-kram-50 hover:border-kram-300 hover:text-kram-700 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <Label className="text-kram-700 font-medium mb-2 block">
              เลือกประเภทรายงาน
            </Label>
            <Popover open={reportTypeOpen} onOpenChange={setReportTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={reportTypeOpen}
                  className="w-full md:w-80 justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                >
                  <span className="truncate">
                    {reportType
                      ? reportTypes.find((r) => r.value === reportType)?.label
                      : "-- เลือกประเภทรายงาน --"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput placeholder="ค้นหาประเภทรายงาน..." />
                  <CommandList>
                    <CommandEmpty>ไม่พบประเภทรายงาน</CommandEmpty>
                    <CommandGroup>
                      {reportTypes.map((r) => (
                        <CommandItem
                          key={r.value}
                          value={r.label}
                          onSelect={() => {
                            handleReportTypeChange(r.value);
                            setReportTypeOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              reportType === r.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {r.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cascade Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Zone Filter */}
            <div>
              <Label className="text-kram-700 font-medium mb-2 block">
                เขตสุขภาพ
              </Label>
              <Popover open={zoneOpen} onOpenChange={setZoneOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={zoneOpen}
                    className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                  >
                    <span className="truncate">
                      {selectedZone === "all"
                        ? "ทุกเขตสุขภาพ"
                        : zones.find((z) => z.code === selectedZone)?.name}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ค้นหาเขตสุขภาพ..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบเขตสุขภาพ</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="ทุกเขตสุขภาพ"
                          onSelect={() => {
                            handleZoneChange("all");
                            setZoneOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedZone === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          ทุกเขตสุขภาพ
                        </CommandItem>
                        {zones.map((z) => (
                          <CommandItem
                            key={z.code}
                            value={z.name}
                            onSelect={() => {
                              handleZoneChange(z.code);
                              setZoneOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedZone === z.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {z.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Province Filter */}
            <div>
              <Label className="text-kram-700 font-medium mb-2 block">
                จังหวัด
              </Label>
              <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={provinceOpen}
                    className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                  >
                    <span className="truncate">
                      {selectedProvince === "all"
                        ? "ทุกจังหวัด"
                        : selectedProvince}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ค้นหาจังหวัด..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบจังหวัด</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="ทุกจังหวัด"
                          onSelect={() => {
                            handleProvinceChange("all");
                            setProvinceOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProvince === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          ทุกจังหวัด
                        </CommandItem>
                        {provinces.map((p) => (
                          <CommandItem
                            key={p}
                            value={p}
                            onSelect={() => {
                              handleProvinceChange(p);
                              setProvinceOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProvince === p ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {p}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Hospital Filter */}
            <div>
              <Label className="text-kram-700 font-medium mb-2 block">
                สถานที่ปฏิบัติงาน
              </Label>
              <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hospitalOpen}
                    className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                  >
                    <span className="truncate">
                      {selectedHospital === "all"
                        ? "ทุกสถานที่"
                        : filteredHospitals.find((h) => h.code === selectedHospital)
                            ?.name}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ค้นหาสถานที่..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบสถานที่</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="ทุกสถานที่"
                          onSelect={() => {
                            setSelectedHospital("all");
                            setHospitalOpen(false);
                            setCurrentPage(1);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedHospital === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          ทุกสถานที่
                        </CommandItem>
                        {filteredHospitals.map((h) => (
                          <CommandItem
                            key={h.code}
                            value={h.name}
                            onSelect={() => {
                              setSelectedHospital(h.code);
                              setHospitalOpen(false);
                              setCurrentPage(1);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedHospital === h.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {h.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Report-specific Filters */}
          {reportType === "position" && (
            <div className="p-4 bg-gradient-to-r from-kram-50/50 to-cyan-50/30 rounded-xl border border-kram-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองประเภทตำแหน่ง
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Position (วิชาชีพ) */}
                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">วิชาชีพ</Label>
                  <Popover open={positionOpen} onOpenChange={setPositionOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                      >
                        <span className="truncate">
                          {selectedPosition === "all"
                            ? "ทั้งหมด"
                            : positions.find((p) => p.code === selectedPosition)?.name}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาวิชาชีพ..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบวิชาชีพ</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="ทั้งหมด"
                              onSelect={() => {
                                setSelectedPosition("all");
                                setPositionOpen(false);
                                setCurrentPage(1);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPosition === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              ทั้งหมด
                            </CommandItem>
                            {positions.map((p) => (
                              <CommandItem
                                key={p.code}
                                value={p.name}
                                onSelect={() => {
                                  setSelectedPosition(p.code);
                                  setPositionOpen(false);
                                  setCurrentPage(1);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPosition === p.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Position Group (ประเภทตำแหน่ง) */}
                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">ประเภทตำแหน่ง</Label>
                  <Popover open={positionGroupOpen} onOpenChange={setPositionGroupOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                      >
                        <span className="truncate">
                          {selectedPositionGroup === "all"
                            ? "ทั้งหมด"
                            : selectedPositionGroup}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาประเภทตำแหน่ง..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบประเภทตำแหน่ง</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="ทั้งหมด"
                              onSelect={() => {
                                handlePositionGroupChange("all");
                                setPositionGroupOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPositionGroup === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              ทั้งหมด
                            </CommandItem>
                            {levelGroups.map((group) => (
                              <CommandItem
                                key={group}
                                value={group}
                                onSelect={() => {
                                  handlePositionGroupChange(group);
                                  setPositionGroupOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPositionGroup === group ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {group}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Level (ระดับ) - cascades from Position Group */}
                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">ระดับ</Label>
                  <Popover open={levelOpen} onOpenChange={setLevelOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                      >
                        <span className="truncate">
                          {selectedLevel === "all"
                            ? "ทั้งหมด"
                            : filteredLevels.find((l) => l.code === selectedLevel)?.name}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาระดับ..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบระดับ</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="ทั้งหมด"
                              onSelect={() => {
                                setSelectedLevel("all");
                                setLevelOpen(false);
                                setCurrentPage(1);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLevel === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              ทั้งหมด
                            </CommandItem>
                            {filteredLevels.map((l) => (
                              <CommandItem
                                key={l.code}
                                value={l.name}
                                onSelect={() => {
                                  setSelectedLevel(l.code);
                                  setLevelOpen(false);
                                  setCurrentPage(1);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLevel === l.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {l.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {reportType === "regStatus" && (
            <div className="p-4 bg-gradient-to-r from-kram-50/50 to-cyan-50/30 rounded-xl border border-kram-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองสถานะของผู้ลงทะเบียน
              </Label>
              <Select
                value={selectedRegType}
                onValueChange={(v) => {
                  setSelectedRegType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-80 rounded-xl border-kram-200">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {regTypes.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === "food" && (
            <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-xl border border-amber-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองประเภทอาหาร
              </Label>
              <Select
                value={selectedFood}
                onValueChange={(v) => {
                  setSelectedFood(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-80 rounded-xl border-kram-200">
                  <SelectValue placeholder="เลือกประเภทอาหาร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {Object.entries(foodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {reportType === "hotel" && (
            <div className="p-4 bg-gradient-to-r from-rose-50/50 to-pink-50/30 rounded-xl border border-rose-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองประเภทโรงแรม
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">โรงแรม</Label>
                  <Popover open={hotelFilterOpen} onOpenChange={setHotelFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between rounded-xl border-kram-200 hover:border-cyan-300 font-normal h-10"
                      >
                        <span className="truncate">
                          {selectedHotelFilter === "all"
                            ? "ทั้งหมด"
                            : activeHotels.find((h) => h.id === parseInt(selectedHotelFilter))?.name}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาโรงแรม..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบโรงแรม</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="ทั้งหมด"
                              onSelect={() => {
                                setSelectedHotelFilter("all");
                                setHotelFilterOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedHotelFilter === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              ทั้งหมด
                            </CommandItem>
                            {activeHotels.map((h) => (
                              <CommandItem
                                key={h.id}
                                value={h.name}
                                onSelect={() => {
                                  setSelectedHotelFilter(String(h.id));
                                  setHotelFilterOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedHotelFilter === String(h.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {h.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">
                    รถรับ-ส่งจากโรงแรมมาที่ประชุม
                  </Label>
                  <Select
                    value={selectedBusToMeet}
                    onValueChange={(v) => {
                      setSelectedBusToMeet(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border-kram-200">
                      <SelectValue placeholder="เลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="1">ต้องการ</SelectItem>
                      <SelectItem value="2">ไม่ต้องการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {reportType === "vehicle" && (
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-cyan-50/30 rounded-xl border border-emerald-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองประเภทการเดินทาง
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">
                    ประเภทการเดินทาง
                  </Label>
                  <Select
                    value={selectedVehicle}
                    onValueChange={(v) => {
                      setSelectedVehicle(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border-kram-200">
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {Object.entries(vehicleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-kram-600 text-sm mb-2 block">
                    ความต้องการรถรับ-ส่ง
                  </Label>
                  <Select
                    value={selectedShuttle}
                    onValueChange={(v) => {
                      setSelectedShuttle(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border-kram-200">
                      <SelectValue placeholder="เลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="1">ต้องการ</SelectItem>
                      <SelectItem value="2">ไม่ต้องการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {reportType === "payment" && (
            <div className="p-4 bg-gradient-to-r from-cyan-50/50 to-kram-50/30 rounded-xl border border-cyan-100">
              <Label className="text-kram-700 font-semibold mb-3 block">
                ตัวกรองสถานะการชำระเงิน
              </Label>
              <Select
                value={selectedPaymentStatus}
                onValueChange={(v) => {
                  setSelectedPaymentStatus(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-80 rounded-xl border-kram-200">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="1">ค้างชำระ</SelectItem>
                  <SelectItem value="2">รอการตรวจสอบ</SelectItem>
                  <SelectItem value="9">ชำระเงินสำเร็จ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่งออก...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Card */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:200ms]">
        <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-kram-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-kram-900">
                  รายชื่อผู้ลงทะเบียน
                </CardTitle>
                <p className="text-sm text-kram-500">
                  {sortedAttendees.length.toLocaleString("th-TH")} รายการ
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sortedAttendees.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-kram-400" />
              </div>
              <p className="text-kram-600 font-medium mb-2">
                ไม่พบข้อมูลผู้ลงทะเบียน
              </p>
              <p className="text-kram-400 text-sm">
                ลองปรับเงื่อนไขการกรองข้อมูล
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
                        <button
                          onClick={() => handleSort("zone")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          เขตสุขภาพ/หน่วยราชการ
                          <SortIcon field="zone" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          ชื่อ-สกุล
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <button
                          onClick={() => handleSort("hospital")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          สถานที่ปฏิบัติงาน
                          <SortIcon field="hospital" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <button
                          onClick={() => handleSort("position")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          วิชาชีพ
                          <SortIcon field="position" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <button
                          onClick={() => handleSort("phone")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          เบอร์โทรศัพท์
                          <SortIcon field="phone" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-kram-600 text-sm">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          สถานะการชำระเงิน
                          <SortIcon field="status" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kram-50">
                    {paginatedAttendees.map((attendee, index) => {
                      const status = statusConfig[attendee.status] || statusConfig[1];
                      const rowNumber = startIndex + index + 1;

                      return (
                        <tr
                          key={attendee.id}
                          className="group hover:bg-gradient-to-r hover:from-kram-50/50 hover:to-cyan-50/30 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-kram-400 font-medium">
                            {rowNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-kram-700">
                              {attendee.hospital?.zone?.name || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-kram-900">
                              {attendee.prefix}
                              {attendee.firstName} {attendee.lastName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-kram-600">
                              {attendee.hospital?.name || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-kram-600">
                              {attendee.position?.name || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-kram-600">
                              {attendee.phone || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={status.className}>
                              {status.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-kram-100">
                  <div className="flex items-center gap-2 text-sm text-kram-600">
                    <span>แสดง</span>
                    <Select
                      value={String(limit)}
                      onValueChange={(v) => {
                        setLimit(parseInt(v));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8 rounded-lg border-kram-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIMIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>
                      จาก {sortedAttendees.length.toLocaleString("th-TH")} รายการ
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-kram-500">
                      {startIndex + 1}-{endIndex} จาก {sortedAttendees.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 border-kram-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-kram-700 font-medium px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 border-kram-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
