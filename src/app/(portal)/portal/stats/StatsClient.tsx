"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  CreditCard,
  CheckCircle,
  BarChart3,
  Table,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface StatsSummary {
  total: number;
  pending: number;
  reviewing: number;
  paid: number;
}

interface ZoneData {
  name: string;
  code: string;
  paid: number;
  reviewing: number;
  pending: number;
  total: number;
}

interface HospitalData {
  name: string;
  code: string;
  zoneCode: string;
  paid: number;
  reviewing: number;
  pending: number;
  total: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface StatsClientProps {
  summary: StatsSummary;
  zones: { code: string; name: string }[];
  byZone: ZoneData[];
  byHospital: HospitalData[];
  byRegType: ChartData[];
  byPosition: ChartData[];
  byFood: ChartData[];
  byVehicle: ChartData[];
  byHotel: ChartData[];
  byShuttle: ChartData[];
}

// Color schemes
const STATUS_COLORS = {
  paid: "#22c55e", // green-500
  reviewing: "#f59e0b", // amber-500
  pending: "#ef4444", // red-500
};

const CHART_COLORS = [
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#ea580c", // orange-600
  "#16a34a", // green-600
  "#2563eb", // blue-600
  "#9333ea", // purple-600
  "#dc2626", // red-600
  "#ca8a04", // yellow-600
  "#0d9488", // teal-600
];

// Stat card config
const statsConfig = [
  {
    key: "total",
    label: "ผู้ลงทะเบียนทั้งหมด",
    icon: Users,
    gradient: "from-kram-500 to-kram-700",
    iconBg: "bg-kram-500/20",
    iconColor: "text-kram-600",
  },
  {
    key: "pending",
    label: "ค้างชำระเงิน",
    icon: Clock,
    gradient: "from-red-500 to-red-700",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600",
  },
  {
    key: "reviewing",
    label: "รอตรวจสอบการชำระ",
    icon: CreditCard,
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
  },
  {
    key: "paid",
    label: "ชำระเงินสำเร็จ",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-600",
  },
];

// Chart Card with Toggle
function ChartCard({
  title,
  children,
  tableData,
  columns,
  extra,
}: {
  title: string;
  children: React.ReactNode;
  tableData: { name: string; [key: string]: string | number }[];
  columns: { key: string; label: string }[];
  extra?: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  return (
    <Card className="border-0 shadow-lg shadow-kram-900/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg text-kram-900">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {extra}
            <div className="flex rounded-lg border border-kram-200 overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none h-8 px-3",
                  viewMode === "chart"
                    ? "bg-kram-100 text-kram-700"
                    : "text-kram-500"
                )}
                onClick={() => setViewMode("chart")}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Chart
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none h-8 px-3 border-l border-kram-200",
                  viewMode === "table"
                    ? "bg-kram-100 text-kram-700"
                    : "text-kram-500"
                )}
                onClick={() => setViewMode("table")}
              >
                <Table className="w-4 h-4 mr-1" />
                Table
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "chart" ? (
          children
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kram-100">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-2 px-3 font-medium text-kram-600"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="border-b border-kram-50">
                    {columns.map((col) => (
                      <td key={col.key} className="py-2 px-3 text-kram-700">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Custom tooltip for stacked bar
function StackedBarTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-kram-100">
      <p className="font-medium text-kram-900 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.fill }}>
          {entry.name}: {entry.value} คน
        </p>
      ))}
    </div>
  );
}

// Custom tooltip for pie/donut
function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0];
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-kram-100">
      <p className="font-medium text-kram-900">{data.name}</p>
      <p className="text-sm text-kram-600">{data.value} คน</p>
    </div>
  );
}

export function StatsClient({
  summary,
  zones,
  byZone,
  byHospital,
  byRegType,
  byPosition,
  byFood,
  byVehicle,
  byHotel,
  byShuttle,
}: StatsClientProps) {
  const [selectedZone, setSelectedZone] = useState<string>("all");

  // Filter hospital data by zone
  const filteredHospitalData =
    selectedZone === "all"
      ? byHospital
      : byHospital.filter((h) => h.zoneCode === selectedZone);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full mb-3">
            <Sparkles className="w-4 h-4" />
            Admin Only
          </div>
          <h1 className="text-3xl font-bold text-kram-900">แดชบอร์ดสถิติ</h1>
          <p className="text-kram-500 mt-1">
            สรุปข้อมูลผู้ลงทะเบียนเข้าร่วมประชุม
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          const value = summary[stat.key as keyof StatsSummary];
          return (
            <Card
              key={stat.key}
              className="relative overflow-hidden border-0 shadow-lg shadow-kram-900/5 hover:shadow-xl transition-shadow"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-sm font-medium text-kram-500">
                  {stat.label}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="pb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-kram-900">
                    {value.toLocaleString()}
                  </span>
                  <span className="text-sm text-kram-400">คน</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart 1: By Zone (Stacked Bar) */}
      <ChartCard
        title="จำนวนผู้ลงทะเบียนแยกตามเขตสุขภาพ"
        tableData={byZone.map((z) => ({
          name: z.name,
          paid: z.paid,
          reviewing: z.reviewing,
          pending: z.pending,
          total: z.total,
        }))}
        columns={[
          { key: "name", label: "เขตสุขภาพ" },
          { key: "paid", label: "ชำระแล้ว" },
          { key: "reviewing", label: "รอตรวจสอบ" },
          { key: "pending", label: "ค้างชำระ" },
          { key: "total", label: "รวม" },
        ]}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byZone}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<StackedBarTooltip />} />
              <Legend />
              <Bar
                dataKey="paid"
                name="ชำระสำเร็จ"
                stackId="a"
                fill={STATUS_COLORS.paid}
              />
              <Bar
                dataKey="reviewing"
                name="รอตรวจสอบ"
                stackId="a"
                fill={STATUS_COLORS.reviewing}
              />
              <Bar
                dataKey="pending"
                name="ค้างชำระ"
                stackId="a"
                fill={STATUS_COLORS.pending}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#374151"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Chart 2: By Hospital (Stacked Bar with Filter) */}
      <ChartCard
        title="จำนวนผู้ลงทะเบียนแยกตามโรงพยาบาล"
        tableData={filteredHospitalData.map((h) => ({
          name: h.name,
          paid: h.paid,
          reviewing: h.reviewing,
          pending: h.pending,
          total: h.total,
        }))}
        columns={[
          { key: "name", label: "โรงพยาบาล" },
          { key: "paid", label: "ชำระแล้ว" },
          { key: "reviewing", label: "รอตรวจสอบ" },
          { key: "pending", label: "ค้างชำระ" },
          { key: "total", label: "รวม" },
        ]}
        extra={
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="เขตสุขภาพ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเขตสุขภาพ</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z.code} value={z.code}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={filteredHospitalData}
            margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{
                fontSize:
                  filteredHospitalData.length > 30
                    ? 8
                    : filteredHospitalData.length > 15
                    ? 9
                    : 10,
                angle: -45,
                textAnchor: "end",
              } as object}
              interval={0}
              height={70}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<StackedBarTooltip />} />
            <Legend />
            <Bar
              dataKey="paid"
              name="ชำระสำเร็จ"
              stackId="a"
              fill={STATUS_COLORS.paid}
            />
            <Bar
              dataKey="reviewing"
              name="รอตรวจสอบ"
              stackId="a"
              fill={STATUS_COLORS.reviewing}
            />
            <Bar
              dataKey="pending"
              name="ค้างชำระ"
              stackId="a"
              fill={STATUS_COLORS.pending}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row: RegType (Donut) + Position (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: By RegType (Donut) */}
        <ChartCard
          title="ประเภทผู้เข้าร่วมประชุม"
          tableData={byRegType}
          columns={[
            { key: "name", label: "ประเภท" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byRegType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle = 0,
                    outerRadius = 100,
                    name,
                    value,
                    percent,
                    fill,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = (outerRadius as number) + 25;
                    const x =
                      (cx as number) + radius * Math.cos(-midAngle * RADIAN);
                    const y =
                      (cy as number) + radius * Math.sin(-midAngle * RADIAN);
                    const textAnchor = x > (cx as number) ? "start" : "end";
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={textAnchor}
                        dominantBaseline="central"
                        style={{ fontSize: 14 }}
                        fill={fill}
                      >
                        <tspan x={x} dy="-0.5em">
                          {name} {value.toLocaleString()} คน
                        </tspan>
                        <tspan x={x} dy="1.2em">
                          ({((percent || 0) * 100).toFixed(2)}%)
                        </tspan>
                      </text>
                    );
                  }}
                  labelLine={{ stroke: "#94a3b8" }}
                  style={{ fontSize: 12 }}
                >
                  {byRegType.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 4: By Position (Bar) */}
        <ChartCard
          title="วิชาชีพ"
          tableData={byPosition}
          columns={[
            { key: "name", label: "วิชาชีพ" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={byPosition}
              margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, angle: -45, textAnchor: "end" } as object}
                interval={0}
                height={50}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value} คน`, "จำนวน"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byPosition.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row: Food (Donut) + Vehicle (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: By Food Type (Donut) */}
        <ChartCard
          title="ประเภทอาหาร"
          tableData={byFood}
          columns={[
            { key: "name", label: "ประเภท" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byFood}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#94a3b8" }}
                >
                  {byFood.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 6: By Vehicle Type (Bar) */}
        <ChartCard
          title="ประเภทการเดินทาง"
          tableData={byVehicle}
          columns={[
            { key: "name", label: "ประเภท" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byVehicle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} คน`, "จำนวน"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {byVehicle.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row: Hotel (Bar) + Shuttle (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 7: By Hotel (Bar) */}
        <ChartCard
          title="โรงแรมที่พัก"
          tableData={byHotel}
          columns={[
            { key: "name", label: "โรงแรม" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byHotel} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} คน`, "จำนวน"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {byHotel.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 8: By Shuttle (Bar) */}
        <ChartCard
          title="สถิติความต้องการรถรับ-ส่ง"
          tableData={byShuttle}
          columns={[
            { key: "name", label: "ความต้องการ" },
            { key: "value", label: "จำนวน (คน)" },
          ]}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byShuttle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} คน`, "จำนวน"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {byShuttle.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#22c55e" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
