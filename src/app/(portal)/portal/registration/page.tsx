import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  Eye,
  Edit,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  Sparkles,
} from "lucide-react";
import { AttendeeSearch } from "@/components/portal/AttendeeSearch";
import { AttendeePagination } from "@/components/portal/AttendeePagination";
import { RegistrationActions } from "@/components/portal/RegistrationActions";

// Status configuration with KramSakon theme colors
const statusMap: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  1: { label: "ค้างชำระ", variant: "secondary", className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100" },
  2: { label: "รอตรวจสอบ", variant: "outline", className: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50" },
  3: { label: "ยกเลิก", variant: "destructive", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
  9: { label: "ชำระแล้ว", variant: "default", className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
};

const DEFAULT_LIMIT = 10;

type SortField = "name" | "hospital" | "position" | "status";
type SortOrder = "asc" | "desc";

async function getAttendees(
  hospitalCode: string | null,
  isAdmin: boolean,
  search?: string,
  sortField?: SortField,
  sortOrder?: SortOrder,
  page?: number,
  hidePaid?: boolean,
  limit?: number,
  // Filter params
  zoneCode?: string,
  province?: string,
  filterHospitalCode?: string,
  paymentStatus?: string
) {
  // Admin sees all, regular users need hospital code
  if (!isAdmin && !hospitalCode) return { attendees: [], total: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Only filter by hospital for non-admin users
  if (!isAdmin && hospitalCode) {
    where.hospitalCode = hospitalCode;
  }

  // Admin filters: zone, province, hospital
  if (isAdmin) {
    if (zoneCode && zoneCode !== "all") {
      where.hospital = { ...where.hospital, zoneCode };
    }
    if (province && province !== "all") {
      where.hospital = { ...where.hospital, province };
    }
    if (filterHospitalCode && filterHospitalCode !== "all") {
      where.hospitalCode = filterHospitalCode;
    }
  }

  // Payment status filter (available for all users)
  if (paymentStatus && paymentStatus !== "all") {
    where.status = parseInt(paymentStatus);
  } else if (hidePaid) {
    // Filter out paid attendees (status = 9) when hidePaid is true
    where.status = { not: 9 };
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { hospital: { name: { contains: search, mode: "insensitive" } } },
      { hospital: { province: { contains: search, mode: "insensitive" } } },
      {
        hospital: { zone: { name: { contains: search, mode: "insensitive" } } },
      },
    ];
  }

  // Build orderBy based on sortField
  type OrderByType =
    | { firstName: "asc" | "desc" }
    | { hospital: { name: "asc" | "desc" } }
    | { position: { name: "asc" | "desc" } }
    | { status: "asc" | "desc" }
    | { createdAt: "desc" };

  let orderBy: OrderByType = { createdAt: "desc" as const };
  if (sortField && sortOrder) {
    switch (sortField) {
      case "name":
        orderBy = { firstName: sortOrder };
        break;
      case "hospital":
        orderBy = { hospital: { name: sortOrder } };
        break;
      case "position":
        orderBy = { position: { name: sortOrder } };
        break;
      case "status":
        orderBy = { status: sortOrder };
        break;
    }
  }

  const currentPage = page || 1;
  const itemsPerPage = limit || DEFAULT_LIMIT;
  const skip = (currentPage - 1) * itemsPerPage;

  const [attendees, total] = await Promise.all([
    prisma.attendee.findMany({
      where,
      include: {
        regType: true,
        position: true,
        level: true,
        hospital: true,
      },
      orderBy,
      skip,
      take: itemsPerPage,
    }),
    prisma.attendee.count({ where }),
  ]);

  return { attendees, total };
}

async function getFilterData() {
  const [zones, hospitals] = await Promise.all([
    prisma.zone.findMany({ orderBy: { code: "asc" } }),
    prisma.hospital.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        province: true,
        zoneCode: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);
  return { zones, hospitals };
}

function SortIcon({
  field,
  currentField,
  currentOrder,
}: {
  field: SortField;
  currentField?: SortField;
  currentOrder?: SortOrder;
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
  currentField?: SortField,
  currentOrder?: SortOrder,
  search?: string,
  hidePaid?: boolean,
  limit?: number
) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (hidePaid) params.set("hidePaid", "true");
  if (limit && limit !== DEFAULT_LIMIT) params.set("limit", String(limit));

  if (field === currentField) {
    // Toggle order
    params.set("sort", field);
    params.set("order", currentOrder === "asc" ? "desc" : "asc");
  } else {
    // New sort field, default to asc
    params.set("sort", field);
    params.set("order", "asc");
  }
  params.set("page", "1"); // Reset to first page on sort change

  return `?${params.toString()}`;
}

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: SortField;
    order?: SortOrder;
    page?: string;
    hidePaid?: string;
    limit?: string;
    // Filter params
    zone?: string;
    province?: string;
    hospital?: string;
    status?: string;
  }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const sortField = params.sort as SortField | undefined;
  const sortOrder = params.order as SortOrder | undefined;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const hidePaid = params.hidePaid === "true";
  const limit = params.limit ? parseInt(params.limit) : DEFAULT_LIMIT;
  const isAdmin = session.user.memberType === 99;

  // Fetch filter data and attendees in parallel
  const [{ zones, hospitals }, { attendees, total }] = await Promise.all([
    getFilterData(),
    getAttendees(
      session.user.hospitalCode,
      isAdmin,
      params.search,
      sortField,
      sortOrder,
      currentPage,
      hidePaid,
      limit,
      // Filter params
      params.zone,
      params.province,
      params.hospital,
      params.status
    ),
  ]);

  const totalPages = Math.ceil(total / limit);
  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="space-y-6">
      {/* Header with KramSakon theme */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-kram-100 to-cyan-100 text-kram-700 text-sm font-medium rounded-full mb-3 border border-kram-200/50">
            <Users className="w-4 h-4 text-kram-600" />
            <span>รายการลงทะเบียน</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-kram-900 via-kram-800 to-kram-900 bg-clip-text text-transparent">
            ตรวจสอบการลงทะเบียน
          </h1>
          <p className="text-kram-500 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            รายการผู้ลงทะเบียนทั้งหมดของโรงพยาบาล
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RegistrationActions />
          <Link href="/portal/register">
            <Button className="bg-gradient-to-r from-kram-600 to-cyan-600 hover:from-kram-700 hover:to-cyan-700 text-white shadow-lg shadow-kram-500/20 hover:shadow-xl hover:shadow-kram-500/30 transition-all duration-300 hover:-translate-y-0.5">
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มผู้ลงทะเบียน
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="animate-fade-in [animation-delay:100ms]">
        <AttendeeSearch
          zones={zones}
          hospitals={hospitals}
          isAdmin={isAdmin}
        />
      </div>

      {/* Attendee List */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg shadow-kram-900/5 overflow-hidden animate-fade-in [animation-delay:200ms]">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-kram-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-kram-900">
                รายการผู้ลงทะเบียน
              </CardTitle>
              <p className="text-sm text-kram-500">{total} คน</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-kram-100 to-cyan-100 flex items-center justify-center">
                <Search className="w-10 h-10 text-kram-400" />
              </div>
              <p className="text-kram-600 font-medium mb-2">ไม่พบข้อมูลผู้ลงทะเบียน</p>
              <p className="text-kram-400 text-sm">ลองค้นหาด้วยคำค้นอื่น หรือเพิ่มผู้ลงทะเบียนใหม่</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kram-100 text-left">
                      <th className="pb-4 font-semibold text-kram-600 text-sm w-16">
                        ลำดับ
                      </th>
                      <th className="pb-4 font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "hospital",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          สถานที่ปฏิบัติงาน
                          <SortIcon
                            field="hospital"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-4 font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "name",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          ชื่อ-สกุล
                          <SortIcon
                            field="name"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-4 font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "position",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-kram-800 transition-colors"
                        >
                          วิชาชีพ
                          <SortIcon
                            field="position"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-4 font-semibold text-kram-600 text-sm">
                        <Link
                          href={getSortUrl(
                            "status",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
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
                      <th className="pb-4 font-semibold text-kram-600 text-sm text-right">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kram-50">
                    {attendees.map((attendee, index) => {
                      const status = statusMap[attendee.status] || statusMap[1];
                      const rowNumber = startIndex + index + 1;
                      const positionLevel = [
                        attendee.position?.name || attendee.positionOther,
                        attendee.level?.name,
                      ]
                        .filter(Boolean)
                        .join("");
                      return (
                        <tr key={attendee.id} className="group hover:bg-gradient-to-r hover:from-kram-50/50 hover:to-cyan-50/30 transition-colors duration-200">
                          <td className="py-4 text-kram-400 font-medium">{rowNumber}</td>
                          <td className="py-4">
                            <span className="text-sm text-kram-700">
                              {attendee.hospital?.name || "-"}
                            </span>
                          </td>
                          <td className="py-4">
                            <p className="font-semibold text-kram-900">
                              {attendee.prefix}
                              {attendee.firstName} {attendee.lastName}
                            </p>
                          </td>
                          <td className="py-4">
                            <span className="text-sm text-kram-600">
                              {positionLevel || "-"}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant={status.variant} className={status.className}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Link
                                href={`/portal/registration/${attendee.id}`}
                              >
                                <Button variant="ghost" size="sm" title="ดู" className="hover:bg-kram-100 hover:text-kram-700 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link
                                href={`/portal/registration/${attendee.id}/edit`}
                              >
                                <Button variant="ghost" size="sm" title="แก้ไข" className="hover:bg-cyan-100 hover:text-cyan-700 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <AttendeePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={total}
                  limit={limit}
                  startIndex={startIndex}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
