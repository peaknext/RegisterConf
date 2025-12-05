import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PaymentVerificationClient from "./PaymentVerificationClient";

const DEFAULT_LIMIT = 10;

type SortField = "createdAt" | "hospital" | "attendeeCount" | "status";
type SortOrder = "asc" | "desc";

interface FinanceWithDetails {
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
  attendees: {
    id: number;
    prefix: string | null;
    firstName: string | null;
    lastName: string | null;
    regTypeId: number | null;
    hospital: { name: string } | null;
  }[];
}

async function getPageData(
  sortField: SortField = "createdAt",
  sortOrder: SortOrder = "desc",
  page: number = 1,
  limit: number = DEFAULT_LIMIT,
  statusFilter?: number
) {
  // Get settings for price calculation
  const settings = await prisma.setting.findFirst();
  const meetPrice = settings?.meetPrice ? Number(settings.meetPrice) : 2000;
  const meetPriceFollow = settings?.meetPriceFollow
    ? Number(settings.meetPriceFollow)
    : meetPrice;

  // Stats queries
  const [pendingAttendees, paidAttendees, pendingAttendeesForAmount] =
    await Promise.all([
      // Pending attendees (status = 2 รอตรวจสอบ)
      prisma.attendee.count({ where: { status: 2 } }),
      // Paid attendees (status = 9)
      prisma.attendee.count({ where: { status: 9 } }),
      // Get regTypeId for amount calculation
      prisma.attendee.findMany({
        where: { status: 2 },
        select: { regTypeId: true },
      }),
    ]);

  // Calculate pending amount
  const pendingAmount = pendingAttendeesForAmount.reduce((sum, att) => {
    return sum + (att.regTypeId === 6 ? meetPriceFollow : meetPrice);
  }, 0);

  // Build where clause for finance query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};
  if (statusFilter !== undefined) {
    whereClause.status = statusFilter;
  }

  // Get finances with pagination
  const [finances, totalFinances] = await Promise.all([
    prisma.finance.findMany({
      where: whereClause,
      include: {
        member: {
          include: {
            hospital: true,
          },
        },
      },
      orderBy:
        sortField === "hospital"
          ? { member: { hospital: { name: sortOrder } } }
          : { [sortField === "attendeeCount" ? "createdAt" : sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.finance.count({ where: whereClause }),
  ]);

  // Enrich finances with attendee details
  const financesWithDetails: FinanceWithDetails[] = await Promise.all(
    finances.map(async (finance) => {
      const attendeeIds = finance.attendeeIds
        ? finance.attendeeIds.split(",").map((id) => parseInt(id))
        : [];

      const attendees = await prisma.attendee.findMany({
        where: { id: { in: attendeeIds } },
        select: {
          id: true,
          prefix: true,
          firstName: true,
          lastName: true,
          regTypeId: true,
          hospital: { select: { name: true } },
        },
      });

      const amount = attendees.reduce((sum, att) => {
        return sum + (att.regTypeId === 6 ? meetPriceFollow : meetPrice);
      }, 0);

      return {
        id: finance.id,
        memberId: finance.memberId,
        attendeeIds: finance.attendeeIds,
        fileName: finance.fileName,
        status: finance.status,
        createdAt: finance.createdAt,
        confirmedAt: finance.confirmedAt,
        paidDate: finance.paidDate,
        hospitalName: finance.member?.hospital?.name || "-",
        attendeeCount: attendees.length,
        amount,
        attendees,
      };
    })
  );

  // Sort by attendeeCount if needed (can't do in Prisma directly)
  if (sortField === "attendeeCount") {
    financesWithDetails.sort((a, b) => {
      return sortOrder === "asc"
        ? a.attendeeCount - b.attendeeCount
        : b.attendeeCount - a.attendeeCount;
    });
  }

  return {
    finances: financesWithDetails,
    totalFinances,
    stats: {
      pendingAttendees,
      pendingAmount,
      paidAttendees,
    },
    meetPrice,
    meetPriceFollow,
  };
}

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: SortField;
    order?: SortOrder;
    page?: string;
    limit?: string;
    status?: string;
  }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  // Admin only access
  const isAdmin = session.user.memberType === 99;
  if (!isAdmin) redirect("/portal");

  const params = await searchParams;
  const sortField = (params.sort as SortField) || "createdAt";
  const sortOrder = (params.order as SortOrder) || "desc";
  const currentPage = params.page ? parseInt(params.page) : 1;
  const limit = params.limit ? parseInt(params.limit) : DEFAULT_LIMIT;
  const statusFilter = params.status ? parseInt(params.status) : undefined;

  const { finances, totalFinances, stats, meetPrice, meetPriceFollow } =
    await getPageData(sortField, sortOrder, currentPage, limit, statusFilter);

  const totalPages = Math.ceil(totalFinances / limit);
  const startIndex = (currentPage - 1) * limit;

  return (
    <PaymentVerificationClient
      finances={finances}
      stats={stats}
      totalFinances={totalFinances}
      totalPages={totalPages}
      currentPage={currentPage}
      limit={limit}
      startIndex={startIndex}
      sortField={sortField}
      sortOrder={sortOrder}
      statusFilter={statusFilter}
      meetPrice={meetPrice}
      meetPriceFollow={meetPriceFollow}
    />
  );
}
