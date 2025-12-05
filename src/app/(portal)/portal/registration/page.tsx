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
} from "lucide-react";
import { AttendeeSearch } from "@/components/portal/AttendeeSearch";
import { AttendeePagination } from "@/components/portal/AttendeePagination";

const statusMap: Record<
  number,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  1: { label: "ค้างชำระ", variant: "secondary" },
  2: { label: "รอตรวจสอบ", variant: "outline" },
  3: { label: "ยกเลิก", variant: "destructive" },
  9: { label: "ชำระแล้ว", variant: "default" },
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
  limit?: number
) {
  // Admin sees all, regular users need hospital code
  if (!isAdmin && !hospitalCode) return { attendees: [], total: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Only filter by hospital for non-admin users
  if (!isAdmin && hospitalCode) {
    where.hospitalCode = hospitalCode;
  }

  // Filter out paid attendees (status = 9) when hidePaid is true
  if (hidePaid) {
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
    return <ChevronsUpDown className="w-4 h-4 ml-1 text-gray-400" />;
  }
  return currentOrder === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1" />
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

  const { attendees, total } = await getAttendees(
    session.user.hospitalCode,
    isAdmin,
    params.search,
    sortField,
    sortOrder,
    currentPage,
    hidePaid,
    limit
  );

  const totalPages = Math.ceil(total / limit);
  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ตรวจสอบการลงทะเบียน
          </h1>
          <p className="text-gray-500">รายการผู้ลงทะเบียนทั้งหมดของโรงพยาบาล</p>
        </div>
        <Link href="/portal/registration/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มผู้ลงทะเบียน
          </Button>
        </Link>
      </div>

      {/* Search */}
      <AttendeeSearch />

      {/* Attendee List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            รายการผู้ลงทะเบียน ({total} คน)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ไม่พบข้อมูลผู้ลงทะเบียน</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500 w-16">
                        ลำดับ
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        <Link
                          href={getSortUrl(
                            "hospital",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-gray-900"
                        >
                          สถานที่ปฏิบัติงาน
                          <SortIcon
                            field="hospital"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        <Link
                          href={getSortUrl(
                            "name",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-gray-900"
                        >
                          ชื่อ-สกุล
                          <SortIcon
                            field="name"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        <Link
                          href={getSortUrl(
                            "position",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-gray-900"
                        >
                          วิชาชีพ
                          <SortIcon
                            field="position"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-3 font-medium text-gray-500">
                        <Link
                          href={getSortUrl(
                            "status",
                            sortField,
                            sortOrder,
                            params.search,
                            hidePaid,
                            limit
                          )}
                          className="flex items-center hover:text-gray-900"
                        >
                          สถานะ
                          <SortIcon
                            field="status"
                            currentField={sortField}
                            currentOrder={sortOrder}
                          />
                        </Link>
                      </th>
                      <th className="pb-3 font-medium text-gray-500 text-right">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
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
                        <tr key={attendee.id} className="hover:bg-gray-50">
                          <td className="py-4 text-gray-500">{rowNumber}</td>
                          <td className="py-4">
                            <span className="text-sm">
                              {attendee.hospital?.name || "-"}
                            </span>
                          </td>
                          <td className="py-4">
                            <p className="font-medium">
                              {attendee.prefix}
                              {attendee.firstName} {attendee.lastName}
                            </p>
                          </td>
                          <td className="py-4">
                            <span className="text-sm">
                              {positionLevel || "-"}
                            </span>
                          </td>
                          <td className="py-4">
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/portal/registration/${attendee.id}`}
                              >
                                <Button variant="ghost" size="sm" title="ดู">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link
                                href={`/portal/registration/${attendee.id}/edit`}
                              >
                                <Button variant="ghost" size="sm" title="แก้ไข">
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
