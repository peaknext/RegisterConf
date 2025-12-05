"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  Utensils,
  Car,
  Building2,
  Plane,
  Bus,
  Train,
  Sparkles,
  Tag,
  Banknote,
  AlertCircle,
  MapPin,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AttendeeData {
  id: number;
  hospitalCode: string | null;
  regTypeId: number | null;
  prefix: string | null;
  firstName: string | null;
  lastName: string | null;
  positionCode: string | null;
  positionOther: string | null;
  levelCode: string | null;
  phone: string | null;
  email: string | null;
  line: string | null;
  foodType: number | null;
  vehicleType: number | null;
  airDate1: Date | null;
  airline1: string | null;
  flightNo1: string | null;
  airTime1: Date | null;
  airDate2: Date | null;
  airline2: string | null;
  flightNo2: string | null;
  airTime2: Date | null;
  airShuttle: number | null;
  busDate1: Date | null;
  busLine1: string | null;
  busTime1: Date | null;
  busDate2: Date | null;
  busLine2: string | null;
  busTime2: Date | null;
  busShuttle: number | null;
  trainDate1: Date | null;
  trainLine1: string | null;
  trainTime1: Date | null;
  trainDate2: Date | null;
  trainLine2: string | null;
  trainTime2: Date | null;
  trainShuttle: number | null;
  hotelId: number | null;
  hotelOther: string | null;
  busToMeet: number | null;
  level?: { code: string; name: string; group: string | null } | null;
  hospital?: { code: string; name: string; province: string | null; zone: { code: string; name: string } | null } | null;
}

interface AttendeeRegisterFormProps {
  regTypes: Array<{ id: number; name: string }>;
  positions: Array<{ code: string; name: string }>;
  levels: Array<{ code: string; name: string; group: string | null }>;
  levelGroups: string[];
  hotels: Array<{ id: number; name: string }>;
  airlines: Array<{ id: number; name: string }>;
  zones: Array<{ code: string; name: string }>;
  hospitals: Array<{
    code: string;
    name: string;
    province: string | null;
    zoneCode: string | null;
  }>;
  userHospital: {
    code: string;
    name: string;
    province: string | null;
    zone: { code: string; name: string } | null;
  } | null;
  isAdmin: boolean;
  // Edit mode props
  mode?: "create" | "edit";
  attendee?: AttendeeData | null;
}

const vehicleTypes = [
  { value: "1", label: "เครื่องบิน", icon: Plane },
  { value: "2", label: "รถโดยสาร", icon: Bus },
  { value: "3", label: "รถยนต์ส่วนตัว/ราชการ", icon: Car },
  { value: "4", label: "รถไฟ", icon: Train },
];

const foodTypes = [
  { value: "1", label: "อาหารทั่วไป" },
  { value: "2", label: "อาหารอิสลาม" },
  { value: "3", label: "อาหารมังสวิรัติ" },
  { value: "4", label: "อาหารเจ" },
];

const prefixOptions = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

// Helper to format date for input
function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

// Helper to format time for input
function formatTimeForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
}

export function AttendeeRegisterForm({
  regTypes,
  positions,
  levels,
  levelGroups,
  hotels,
  airlines,
  zones,
  hospitals,
  userHospital,
  isAdmin,
  mode = "create",
  attendee,
}: AttendeeRegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = mode === "edit";

  // Combobox open states
  const [prefixOpen, setPrefixOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [positionGroupOpen, setPositionGroupOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [airline1Open, setAirline1Open] = useState(false);
  const [airline2Open, setAirline2Open] = useState(false);
  const [hotelOpen, setHotelOpen] = useState(false);

  // Search states for comboboxes
  const [positionSearch, setPositionSearch] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");

  const [formData, setFormData] = useState(() => {
    // Initialize with attendee data if in edit mode
    if (isEditMode && attendee) {
      return {
        // Government Info (for admin cascade)
        zoneCode: attendee.hospital?.zone?.code || "",
        province: attendee.hospital?.province || "",
        hospitalCode: attendee.hospitalCode || "",
        // Registration Type
        regTypeId: attendee.regTypeId ? String(attendee.regTypeId) : "",
        // Personal Info
        prefix: attendee.prefix || "",
        firstName: attendee.firstName || "",
        lastName: attendee.lastName || "",
        positionCode: attendee.positionCode || "",
        positionGroup: attendee.level?.group || "",
        levelCode: attendee.levelCode || "",
        // Contact
        phone: attendee.phone || "",
        email: attendee.email || "",
        line: attendee.line || "",
        // Preferences
        foodType: attendee.foodType ? String(attendee.foodType) : "1",
        vehicleType: attendee.vehicleType ? String(attendee.vehicleType) : "",
        // Air Travel
        airDate1: formatDateForInput(attendee.airDate1),
        airline1: attendee.airline1 || "",
        flightNo1: attendee.flightNo1 || "",
        airTime1: formatTimeForInput(attendee.airTime1),
        airDate2: formatDateForInput(attendee.airDate2),
        airline2: attendee.airline2 || "",
        flightNo2: attendee.flightNo2 || "",
        airTime2: formatTimeForInput(attendee.airTime2),
        airShuttle: attendee.airShuttle ? String(attendee.airShuttle) : "",
        // Bus Travel
        busDate1: formatDateForInput(attendee.busDate1),
        busLine1: attendee.busLine1 || "",
        busTime1: formatTimeForInput(attendee.busTime1),
        busDate2: formatDateForInput(attendee.busDate2),
        busLine2: attendee.busLine2 || "",
        busTime2: formatTimeForInput(attendee.busTime2),
        busShuttle: attendee.busShuttle ? String(attendee.busShuttle) : "",
        // Train Travel
        trainDate1: formatDateForInput(attendee.trainDate1),
        trainLine1: attendee.trainLine1 || "",
        trainTime1: formatTimeForInput(attendee.trainTime1),
        trainDate2: formatDateForInput(attendee.trainDate2),
        trainLine2: attendee.trainLine2 || "",
        trainTime2: formatTimeForInput(attendee.trainTime2),
        trainShuttle: attendee.trainShuttle ? String(attendee.trainShuttle) : "",
        // Accommodation
        hotelId: attendee.hotelId ? String(attendee.hotelId) : "",
        hotelOther: attendee.hotelOther || "",
        busToMeet: attendee.busToMeet ? String(attendee.busToMeet) : "",
      };
    }
    // Default empty state for create mode
    return {
      // Government Info (for admin cascade)
      zoneCode: "",
      province: "",
      hospitalCode: "",
      // Registration Type
      regTypeId: "",
      // Personal Info
      prefix: "",
      firstName: "",
      lastName: "",
      positionCode: "",
      positionGroup: "",
      levelCode: "",
      // Contact
      phone: "",
      email: "",
      line: "",
      // Preferences
      foodType: "1",
      vehicleType: "",
      // Air Travel
      airDate1: "",
      airline1: "",
      flightNo1: "",
      airTime1: "",
      airDate2: "",
      airline2: "",
      flightNo2: "",
      airTime2: "",
      airShuttle: "",
      // Bus Travel
      busDate1: "",
      busLine1: "",
      busTime1: "",
      busDate2: "",
      busLine2: "",
      busTime2: "",
      busShuttle: "",
      // Train Travel
      trainDate1: "",
      trainLine1: "",
      trainTime1: "",
      trainDate2: "",
      trainLine2: "",
      trainTime2: "",
      trainShuttle: "",
      // Accommodation
      hotelId: "",
      hotelOther: "",
      busToMeet: "",
    };
  });

  // Cascade: Get provinces for selected zone
  const filteredProvinces = useMemo(() => {
    if (!formData.zoneCode) return [];
    const provinces = hospitals
      .filter((h) => h.zoneCode === formData.zoneCode && h.province)
      .map((h) => h.province as string);
    return Array.from(new Set(provinces)).sort();
  }, [hospitals, formData.zoneCode]);

  // Cascade: Get hospitals for selected zone + province
  const filteredHospitals = useMemo(() => {
    let result = hospitals;
    if (formData.zoneCode) {
      result = result.filter((h) => h.zoneCode === formData.zoneCode);
    }
    if (formData.province) {
      result = result.filter((h) => h.province === formData.province);
    }
    return result;
  }, [hospitals, formData.zoneCode, formData.province]);

  // Cascade: Get levels for selected group
  const filteredLevels = useMemo(() => {
    if (!formData.positionGroup) return [];
    return levels.filter((l) => l.group === formData.positionGroup);
  }, [levels, formData.positionGroup]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset cascade fields when parent changes
      if (name === "zoneCode") {
        updated.province = "";
        updated.hospitalCode = "";
      }
      if (name === "province") {
        updated.hospitalCode = "";
      }
      if (name === "positionGroup") {
        updated.levelCode = "";
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Prepare data - use userHospital code if not admin
      const submitData = {
        ...formData,
        hospitalCode: isAdmin ? formData.hospitalCode : userHospital?.code,
      };

      const url = isEditMode ? `/api/attendees/${attendee?.id}` : "/api/attendees";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      router.push(`/portal/registration/${isEditMode ? attendee?.id : data.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={isEditMode ? `/portal/registration/${attendee?.id}` : "/portal/dashboard"}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kram-100 text-kram-700 text-sm font-medium rounded-full mb-2">
            <Sparkles className="w-4 h-4" />
            {isEditMode ? "แก้ไขข้อมูล" : "ลงทะเบียนใหม่"}
          </div>
          <h1 className="text-2xl font-bold text-kram-900">
            {isEditMode ? "แก้ไขข้อมูลผู้ลงทะเบียน" : "ลงทะเบียนเข้าร่วมประชุม"}
          </h1>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Government Info */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-slate-500 to-kram-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-kram-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              ข้อมูลหน่วยราชการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              // Admin: Cascade selection with Combobox
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Zone Combobox */}
                <div>
                  <Label>
                    เขตสุขภาพ <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={zoneOpen} onOpenChange={setZoneOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={zoneOpen}
                        className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                      >
                        <span className="truncate">
                          {formData.zoneCode
                            ? zones.find((z) => z.code === formData.zoneCode)
                                ?.name
                            : "เลือกเขตสุขภาพ"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาเขตสุขภาพ..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบเขตสุขภาพที่ค้นหา</CommandEmpty>
                          <CommandGroup>
                            {zones.map((zone) => (
                              <CommandItem
                                key={zone.code}
                                value={zone.name}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    zoneCode: zone.code,
                                    province: "",
                                    hospitalCode: "",
                                  }));
                                  setZoneOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.zoneCode === zone.code
                                      ? "opacity-100"
                                      : "opacity-0"
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
                </div>

                {/* Province Combobox */}
                <div>
                  <Label>
                    จังหวัด <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={provinceOpen}
                        disabled={!formData.zoneCode}
                        className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="truncate">
                          {formData.province || "เลือกจังหวัด"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาจังหวัด..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบจังหวัดที่ค้นหา</CommandEmpty>
                          <CommandGroup>
                            {filteredProvinces.map((province) => (
                              <CommandItem
                                key={province}
                                value={province}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    province: province,
                                    hospitalCode: "",
                                  }));
                                  setProvinceOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.province === province
                                      ? "opacity-100"
                                      : "opacity-0"
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
                </div>

                {/* Hospital Combobox */}
                <div>
                  <Label>
                    สถานที่ปฏิบัติงาน <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={hospitalOpen} onOpenChange={setHospitalOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={hospitalOpen}
                        disabled={!formData.province}
                        className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="truncate">
                          {formData.hospitalCode
                            ? filteredHospitals.find(
                                (h) => h.code === formData.hospitalCode
                              )?.name
                            : "เลือกสถานที่ปฏิบัติงาน"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="ค้นหาโรงพยาบาล..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบโรงพยาบาลที่ค้นหา</CommandEmpty>
                          <CommandGroup>
                            {filteredHospitals.map((hospital) => (
                              <CommandItem
                                key={hospital.code}
                                value={hospital.name}
                                onSelect={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    hospitalCode: hospital.code,
                                  }));
                                  setHospitalOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.hospitalCode === hospital.code
                                      ? "opacity-100"
                                      : "opacity-0"
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
                </div>
              </div>
            ) : (
              // Regular user: Read-only display
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-kram-50 rounded-xl">
                  <p className="text-sm text-kram-500 mb-1">เขตสุขภาพ</p>
                  <p className="font-medium text-kram-900">
                    {userHospital?.zone?.name || "-"}
                  </p>
                </div>
                <div className="p-4 bg-kram-50 rounded-xl">
                  <p className="text-sm text-kram-500 mb-1">จังหวัด</p>
                  <p className="font-medium text-kram-900">
                    {userHospital?.province || "-"}
                  </p>
                </div>
                <div className="p-4 bg-kram-50 rounded-xl">
                  <p className="text-sm text-kram-500 mb-1">สถานที่ปฏิบัติงาน</p>
                  <p className="font-medium text-kram-900">
                    {userHospital?.name || "-"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Registration Type */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              ประเภทการลงทะเบียน <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {regTypes.map((type) => (
                <label
                  key={type.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    formData.regTypeId === String(type.id)
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                >
                  <input
                    type="radio"
                    name="regTypeId"
                    value={type.id}
                    checked={formData.regTypeId === String(type.id)}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      formData.regTypeId === String(type.id)
                        ? "border-violet-500 bg-violet-500"
                        : "border-kram-300"
                    )}
                  >
                    {formData.regTypeId === String(type.id) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium">{type.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Personal Info */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-kram-500 to-cyan-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-500 to-cyan-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-1">
                <Label>
                  คำนำหน้า <span className="text-red-500">*</span>
                </Label>
                <Popover open={prefixOpen} onOpenChange={setPrefixOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={prefixOpen}
                      className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                    >
                      <span className="truncate">
                        {formData.prefix || "เลือก"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {prefixOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  prefix: option.value,
                                }));
                                setPrefixOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.prefix === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
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
              <div className="md:col-span-2">
                <Label htmlFor="firstName">
                  ชื่อ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="lastName">
                  นามสกุล <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Position & Level Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Position (วิชาชีพ) - Combobox */}
              <div>
                <Label>
                  วิชาชีพ <span className="text-red-500">*</span>
                </Label>
                <Popover open={positionOpen} onOpenChange={setPositionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={positionOpen}
                      className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                    >
                      <span className="truncate">
                        {formData.positionCode
                          ? positions.find(
                              (p) => p.code === formData.positionCode
                            )?.name
                          : "เลือกวิชาชีพ..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ค้นหาวิชาชีพ..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบวิชาชีพที่ค้นหา</CommandEmpty>
                        <CommandGroup>
                          {positions.map((pos) => (
                            <CommandItem
                              key={pos.code}
                              value={pos.name}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  positionCode: pos.code,
                                }));
                                setPositionOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.positionCode === pos.code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {pos.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Position Group */}
              <div>
                <Label>ประเภทตำแหน่ง</Label>
                <Popover open={positionGroupOpen} onOpenChange={setPositionGroupOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={positionGroupOpen}
                      className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                    >
                      <span className="truncate">
                        {formData.positionGroup || "เลือกประเภทตำแหน่ง"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ค้นหาประเภทตำแหน่ง..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบประเภทตำแหน่งที่ค้นหา</CommandEmpty>
                        <CommandGroup>
                          {levelGroups.map((group) => (
                            <CommandItem
                              key={group}
                              value={group}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  positionGroup: group,
                                  levelCode: "", // Reset cascade
                                }));
                                setPositionGroupOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.positionGroup === group
                                    ? "opacity-100"
                                    : "opacity-0"
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

              {/* Level */}
              <div>
                <Label>ระดับ</Label>
                <Popover open={levelOpen} onOpenChange={setLevelOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={levelOpen}
                      disabled={!formData.positionGroup}
                      className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">
                        {formData.levelCode
                          ? filteredLevels.find(
                              (l) => l.code === formData.levelCode
                            )?.name
                          : "เลือกระดับ"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ค้นหาระดับ..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบระดับที่ค้นหา</CommandEmpty>
                        <CommandGroup>
                          {filteredLevels.map((level) => (
                            <CommandItem
                              key={level.code}
                              value={level.name}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  levelCode: level.code,
                                }));
                                setLevelOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.levelCode === level.code
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {level.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Contact */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              ข้อมูลติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">
                  โทรศัพท์ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="08x-xxx-xxxx"
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
              <div>
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
              <div>
                <Label htmlFor="line">LINE ID</Label>
                <Input
                  id="line"
                  name="line"
                  value={formData.line}
                  onChange={handleChange}
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Food */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              อาหาร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-3 block">
              ประเภทอาหาร <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
              {foodTypes.map((food) => (
                <label
                  key={food.value}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                    formData.foodType === food.value
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                >
                  <input
                    type="radio"
                    name="foodType"
                    value={food.value}
                    checked={formData.foodType === food.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="font-medium">{food.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Travel Type */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              การเดินทาง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-3 block">
              ประเภทการเดินทาง <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicleTypes.map((vehicle) => {
                const Icon = vehicle.icon;
                return (
                  <label
                    key={vehicle.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.vehicleType === vehicle.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={vehicle.value}
                      checked={formData.vehicleType === vehicle.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon className="w-6 h-6" />
                    <span className="font-medium text-sm">{vehicle.label}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Travel Details - Conditional */}
        {formData.vehicleType === "1" && (
          <Card className="border-0 shadow-lg shadow-kram-900/5">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                รายละเอียดการเดินทางโดยเครื่องบิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Arrival */}
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวไป</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="airDate1">วันที่</Label>
                    <Input
                      id="airDate1"
                      name="airDate1"
                      type="date"
                      value={formData.airDate1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label>สายการบิน</Label>
                    <Popover open={airline1Open} onOpenChange={setAirline1Open}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={airline1Open}
                          className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                        >
                          <span className="truncate">
                            {formData.airline1 || "เลือกสายการบิน"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ค้นหาสายการบิน..." />
                          <CommandList>
                            <CommandEmpty>ไม่พบสายการบินที่ค้นหา</CommandEmpty>
                            <CommandGroup>
                              {airlines.map((airline) => (
                                <CommandItem
                                  key={airline.id}
                                  value={airline.name}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      airline1: airline.name,
                                    }));
                                    setAirline1Open(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.airline1 === airline.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {airline.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="flightNo1">เที่ยวบิน</Label>
                    <Input
                      id="flightNo1"
                      name="flightNo1"
                      value={formData.flightNo1}
                      onChange={handleChange}
                      placeholder="FD123"
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="airTime1">เวลาถึง</Label>
                    <Input
                      id="airTime1"
                      name="airTime1"
                      type="time"
                      value={formData.airTime1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>

              {/* Departure */}
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวกลับ</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="airDate2">วันที่</Label>
                    <Input
                      id="airDate2"
                      name="airDate2"
                      type="date"
                      value={formData.airDate2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label>สายการบิน</Label>
                    <Popover open={airline2Open} onOpenChange={setAirline2Open}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={airline2Open}
                          className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                        >
                          <span className="truncate">
                            {formData.airline2 || "เลือกสายการบิน"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ค้นหาสายการบิน..." />
                          <CommandList>
                            <CommandEmpty>ไม่พบสายการบินที่ค้นหา</CommandEmpty>
                            <CommandGroup>
                              {airlines.map((airline) => (
                                <CommandItem
                                  key={airline.id}
                                  value={airline.name}
                                  onSelect={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      airline2: airline.name,
                                    }));
                                    setAirline2Open(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.airline2 === airline.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {airline.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="flightNo2">เที่ยวบิน</Label>
                    <Input
                      id="flightNo2"
                      name="flightNo2"
                      value={formData.flightNo2}
                      onChange={handleChange}
                      placeholder="FD456"
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="airTime2">เวลาออก</Label>
                    <Input
                      id="airTime2"
                      name="airTime2"
                      type="time"
                      value={formData.airTime2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>

              {/* Shuttle */}
              <div>
                <Label className="mb-3 block">
                  ต้องการรถรับ-ส่งจากสนามบิน
                </Label>
                <div className="flex gap-4">
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.airShuttle === "1"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="airShuttle"
                      value="1"
                      checked={formData.airShuttle === "1"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ต้องการ</span>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.airShuttle === "2"
                        ? "border-kram-500 bg-kram-50 text-kram-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="airShuttle"
                      value="2"
                      checked={formData.airShuttle === "2"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ไม่ต้องการ</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bus Travel Details */}
        {formData.vehicleType === "2" && (
          <Card className="border-0 shadow-lg shadow-kram-900/5">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-lg" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                รายละเอียดการเดินทางโดยรถโดยสาร
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวไป</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="busDate1">วันที่</Label>
                    <Input
                      id="busDate1"
                      name="busDate1"
                      type="date"
                      value={formData.busDate1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="busLine1">เส้นทาง/สายรถ</Label>
                    <Input
                      id="busLine1"
                      name="busLine1"
                      value={formData.busLine1}
                      onChange={handleChange}
                      placeholder="กรุงเทพ-สกลนคร"
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="busTime1">เวลาถึง</Label>
                    <Input
                      id="busTime1"
                      name="busTime1"
                      type="time"
                      value={formData.busTime1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวกลับ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="busDate2">วันที่</Label>
                    <Input
                      id="busDate2"
                      name="busDate2"
                      type="date"
                      value={formData.busDate2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="busLine2">เส้นทาง/สายรถ</Label>
                    <Input
                      id="busLine2"
                      name="busLine2"
                      value={formData.busLine2}
                      onChange={handleChange}
                      placeholder="สกลนคร-กรุงเทพ"
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="busTime2">เวลาออก</Label>
                    <Input
                      id="busTime2"
                      name="busTime2"
                      type="time"
                      value={formData.busTime2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">
                  ต้องการรถรับ-ส่งจากสถานีขนส่ง
                </Label>
                <div className="flex gap-4">
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.busShuttle === "1"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="busShuttle"
                      value="1"
                      checked={formData.busShuttle === "1"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ต้องการ</span>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.busShuttle === "2"
                        ? "border-kram-500 bg-kram-50 text-kram-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="busShuttle"
                      value="2"
                      checked={formData.busShuttle === "2"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ไม่ต้องการ</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Train Travel Details */}
        {formData.vehicleType === "4" && (
          <Card className="border-0 shadow-lg shadow-kram-900/5">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-t-lg" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Train className="w-5 h-5 text-white" />
                </div>
                รายละเอียดการเดินทางโดยรถไฟ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวไป</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="trainDate1">วันที่</Label>
                    <Input
                      id="trainDate1"
                      name="trainDate1"
                      type="date"
                      value={formData.trainDate1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainLine1">สายรถไฟ/ขบวน</Label>
                    <Input
                      id="trainLine1"
                      name="trainLine1"
                      value={formData.trainLine1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainTime1">เวลาถึง</Label>
                    <Input
                      id="trainTime1"
                      name="trainTime1"
                      type="time"
                      value={formData.trainTime1}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-kram-700 mb-3">เที่ยวกลับ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="trainDate2">วันที่</Label>
                    <Input
                      id="trainDate2"
                      name="trainDate2"
                      type="date"
                      value={formData.trainDate2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainLine2">สายรถไฟ/ขบวน</Label>
                    <Input
                      id="trainLine2"
                      name="trainLine2"
                      value={formData.trainLine2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainTime2">เวลาออก</Label>
                    <Input
                      id="trainTime2"
                      name="trainTime2"
                      type="time"
                      value={formData.trainTime2}
                      onChange={handleChange}
                      className="mt-1 rounded-xl border-kram-200"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">
                  ต้องการรถรับ-ส่งจากสถานีรถไฟ
                </Label>
                <div className="flex gap-4">
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.trainShuttle === "1"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="trainShuttle"
                      value="1"
                      checked={formData.trainShuttle === "1"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ต้องการ</span>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                      formData.trainShuttle === "2"
                        ? "border-kram-500 bg-kram-50 text-kram-700"
                        : "border-kram-200 hover:border-kram-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="trainShuttle"
                      value="2"
                      checked={formData.trainShuttle === "2"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>ไม่ต้องการ</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 8: Accommodation */}
        <Card className="border-0 shadow-lg shadow-kram-900/5">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-kram-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              ที่พัก
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>เลือกโรงแรม</Label>
                <Popover open={hotelOpen} onOpenChange={setHotelOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={hotelOpen}
                      className="w-full mt-1 justify-between rounded-xl border-kram-200 font-normal h-10"
                    >
                      <span className="truncate">
                        {formData.hotelId
                          ? hotels.find(
                              (h) => String(h.id) === formData.hotelId
                            )?.name
                          : "เลือกโรงแรม หรือพักอื่น"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ค้นหาโรงแรม..." />
                      <CommandList>
                        <CommandEmpty>ไม่พบโรงแรมที่ค้นหา</CommandEmpty>
                        <CommandGroup>
                          {hotels.map((hotel) => (
                            <CommandItem
                              key={hotel.id}
                              value={hotel.name}
                              onSelect={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  hotelId: String(hotel.id),
                                }));
                                setHotelOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.hotelId === String(hotel.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {hotel.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="hotelOther">ที่พักอื่น (ถ้ามี)</Label>
                <Input
                  id="hotelOther"
                  name="hotelOther"
                  value={formData.hotelOther}
                  onChange={handleChange}
                  placeholder="ระบุที่พักอื่น"
                  className="mt-1 rounded-xl border-kram-200 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">
                ต้องการรถรับ-ส่งไปสถานที่ประชุม
              </Label>
              <div className="flex gap-4">
                <label
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                    formData.busToMeet === "1"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                >
                  <input
                    type="radio"
                    name="busToMeet"
                    value="1"
                    checked={formData.busToMeet === "1"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>ต้องการ</span>
                </label>
                <label
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all",
                    formData.busToMeet === "2"
                      ? "border-kram-500 bg-kram-50 text-kram-700"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                >
                  <input
                    type="radio"
                    name="busToMeet"
                    value="2"
                    checked={formData.busToMeet === "2"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span>ไม่ต้องการ</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 9: Payment Info */}
        <Card
          className="border-0 shadow-lg shadow-kram-900/5"
          style={{ backgroundColor: "rgba(1, 166, 229, 0.08)" }}
        >
          <div
            className="h-1 rounded-t-lg"
            style={{ background: "linear-gradient(to right, #01a6e5, #0088cc)" }}
          />
          <CardHeader className="pb-4">
            <CardTitle
              className="flex items-center gap-3 text-lg"
              style={{ color: "#01a6e5" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(to bottom right, #01a6e5, #0088cc)" }}
              >
                <Banknote className="w-5 h-5 text-white" />
              </div>
              รายละเอียดการโอนเงิน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-4 bg-white rounded-xl border"
              style={{ borderColor: "rgba(1, 166, 229, 0.3)" }}
            >
              <div className="flex gap-4">
                {/* KTB Logo */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-md" style={{ borderColor: "#01a6e5" }}>
                    <Image
                      src="/KTB_Logo.png"
                      alt="Krungthai Bank Logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Bank Details */}
                <div className="flex-1 space-y-2 text-sm">
                  <p style={{ color: "#01a6e5" }} className="font-medium">
                    ชื่อบัญชี:{" "}
                    <span className="font-normal text-gray-700">
                      มูลนิธิ นายแพทย์บุญยงค์ วงศ์รักมิตร
                    </span>
                  </p>
                  <p style={{ color: "#01a6e5" }} className="font-medium">
                    ธนาคาร:{" "}
                    <span className="font-normal text-gray-700">กรุงไทย (สาขาน่าน)</span>
                  </p>
                  <p style={{ color: "#01a6e5" }} className="font-medium">
                    เลขที่บัญชี:{" "}
                    <span
                      className="font-semibold text-lg"
                      style={{ color: "#01a6e5" }}
                    >
                      507-3-44659-3
                    </span>
                  </p>
                </div>
              </div>
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "rgba(1, 166, 229, 0.2)" }}
              >
                <p className="text-sm" style={{ color: "#01a6e5" }}>
                  แจ้งการชำระเงิน ที่เมนู{" "}
                  <span className="font-semibold">แจ้งการชำระเงิน</span>{" "}
                  หลังจากลงทะเบียนแล้ว
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 10: Terms */}
        <Card className="border-0 shadow-lg shadow-kram-900/5 bg-amber-50/50">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-t-lg" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-amber-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              เงื่อนไขการประชุม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-xl border border-amber-200">
              <p className="text-amber-800 text-sm">
                หลังจากแจ้งชำระเงินแล้ว จะสามารถแก้ไขข้อมูลได้เฉพาะ{" "}
                <span className="font-semibold">
                  ข้อมูลการเดินทางและที่พักเท่านั้น
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Link href={isEditMode ? `/portal/registration/${attendee?.id}` : "/portal/dashboard"}>
            <Button type="button" variant="outline" className="rounded-xl">
              ยกเลิก
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-kram-600 to-cyan-600 hover:from-kram-700 hover:to-cyan-700 rounded-xl px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "บันทึกการแก้ไข" : "ลงทะเบียน"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
