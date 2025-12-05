"use client";

import { useState, useMemo } from "react";
import { Decimal } from "@prisma/client/runtime/library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  Newspaper,
  Database,
  Cog,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  MapPin,
  Building2,
  Plane,
  Hotel,
  Globe,
  CreditCard,
  FileText,
  Save,
  X,
  ChevronRight,
  Sparkles,
  Clock,
  User,
  Phone,
  Mail,
  Link,
  LayoutGrid,
} from "lucide-react";

// Types for all data models
interface News {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date;
}

interface Schedule {
  id: number;
  dayNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  location: string | null;
  speaker: string | null;
  sortOrder: number;
}

interface FooterInfo {
  id: number;
  key: string;
  value: string;
}

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
  hospitalType: string | null;
  zoneCode: string | null;
  zone?: Zone | null;
}

interface Hotel {
  id: number;
  name: string;
  phone: string | null;
  website: string | null;
  mapUrl: string | null;
  busFlag: string;
  status: string;
}

interface Airline {
  id: number;
  name: string;
  status: string;
}

interface SiteConfig {
  id: number;
  logoUrl: string | null;
  googleDriveUrl: string | null;
}

interface PaymentSettings {
  id: number;
  name: string | null;
  accountName: string | null;
  accountBank: string | null;
  accountNo: string | null;
  meetPrice: Decimal | null;
  condition1: string | null;
  condition2: string | null;
  accountFollowName: string | null;
  accountFollowBank: string | null;
  accountFollowNo: string | null;
  meetPriceFollow: Decimal | null;
}

interface SettingsClientProps {
  news: News[];
  schedules: Schedule[];
  footerInfo: FooterInfo[];
  airlines: Airline[];
  hospitals: Hospital[];
  hotels: Hotel[];
  zones: Zone[];
  siteConfig: SiteConfig | null;
  paymentSettings: PaymentSettings | null;
}

// Tab summary card component
function TabSummaryCard({
  icon: Icon,
  title,
  count,
  description,
  gradient,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  description: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 text-left shadow-lg shadow-kram-900/5 transition-all duration-300 hover:shadow-xl hover:shadow-kram-900/10 hover:-translate-y-1 border border-kram-100/50"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient}`}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <ChevronRight className="w-5 h-5 text-kram-300 group-hover:text-kram-500 group-hover:translate-x-1 transition-all" />
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-kram-900 group-hover:text-kram-700">
            {title}
          </h3>
          <p className="text-sm text-kram-500 mt-1">{description}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-kram-50 text-kram-700 hover:bg-kram-100"
          >
            {count} รายการ
          </Badge>
        </div>
      </div>
    </button>
  );
}

// Section header component
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-kram-500 to-cyan-500 shadow-lg shadow-kram-500/25">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-kram-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-kram-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Data table row component
function DataRow({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center justify-between py-4 px-4 rounded-xl hover:bg-gradient-to-r hover:from-kram-50/50 hover:to-cyan-50/30 transition-colors">
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  );
}

export function SettingsClient({
  news: initialNews,
  schedules: initialSchedules,
  footerInfo: initialFooterInfo,
  airlines: initialAirlines,
  hospitals: initialHospitals,
  hotels: initialHotels,
  zones: initialZones,
  siteConfig: initialSiteConfig,
  paymentSettings: initialPaymentSettings,
}: SettingsClientProps) {
  // State for all data
  const [news, setNews] = useState(initialNews);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [footerInfo, setFooterInfo] = useState(initialFooterInfo);
  const [airlines, setAirlines] = useState(initialAirlines);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [hotels, setHotels] = useState(initialHotels);
  const [zones, setZones] = useState(initialZones);
  const [siteConfig, setSiteConfig] = useState(initialSiteConfig);
  const [paymentSettings, setPaymentSettings] = useState(initialPaymentSettings);

  // UI state
  const [activeTab, setActiveTab] = useState("content");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showNewsDialog, setShowNewsDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [showHotelDialog, setShowHotelDialog] = useState(false);
  const [showAirlineDialog, setShowAirlineDialog] = useState(false);

  // Edit item states
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  // Footer form state
  const [footerForm, setFooterForm] = useState({
    organizerName: footerInfo.find((f) => f.key === "organizer_name")?.value || "",
    address: footerInfo.find((f) => f.key === "address")?.value || "",
    phone: footerInfo.find((f) => f.key === "phone")?.value || "",
    email: footerInfo.find((f) => f.key === "email")?.value || "",
    fax: footerInfo.find((f) => f.key === "fax")?.value || "",
  });

  // Site config form state
  const [siteConfigForm, setSiteConfigForm] = useState({
    logoUrl: siteConfig?.logoUrl || "",
    googleDriveUrl: siteConfig?.googleDriveUrl || "",
  });

  // Payment settings form state
  const [paymentForm, setPaymentForm] = useState({
    name: paymentSettings?.name || "",
    accountName: paymentSettings?.accountName || "",
    accountBank: paymentSettings?.accountBank || "",
    accountNo: paymentSettings?.accountNo || "",
    meetPrice: paymentSettings?.meetPrice?.toString() || "",
    condition1: paymentSettings?.condition1 || "",
    condition2: paymentSettings?.condition2 || "",
    accountFollowName: paymentSettings?.accountFollowName || "",
    accountFollowBank: paymentSettings?.accountFollowBank || "",
    accountFollowNo: paymentSettings?.accountFollowNo || "",
    meetPriceFollow: paymentSettings?.meetPriceFollow?.toString() || "",
  });

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped = schedules.reduce((acc, schedule) => {
      const day = schedule.dayNumber;
      if (!acc[day]) acc[day] = [];
      acc[day].push(schedule);
      return acc;
    }, {} as Record<number, Schedule[]>);
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [schedules]);

  // News CRUD handlers
  const handleSaveNews = async (data: Partial<News>) => {
    setIsSaving(true);
    try {
      const method = editingNews ? "PATCH" : "POST";
      const url = editingNews
        ? `/api/settings/news/${editingNews.id}`
        : "/api/settings/news";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedNews = await response.json();
        if (editingNews) {
          setNews((prev) => prev.map((n) => (n.id === savedNews.id ? savedNews : n)));
        } else {
          setNews((prev) => [savedNews, ...prev]);
        }
        setShowNewsDialog(false);
        setEditingNews(null);
      }
    } catch (error) {
      console.error("Error saving news:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("ต้องการลบข่าวสารนี้?")) return;
    try {
      const response = await fetch(`/api/settings/news/${id}`, { method: "DELETE" });
      if (response.ok) {
        setNews((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  // Schedule CRUD handlers
  const handleSaveSchedule = async (data: Partial<Schedule>) => {
    setIsSaving(true);
    try {
      const method = editingSchedule ? "PATCH" : "POST";
      const url = editingSchedule
        ? `/api/settings/schedule/${editingSchedule.id}`
        : "/api/settings/schedule";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedSchedule = await response.json();
        if (editingSchedule) {
          setSchedules((prev) => prev.map((s) => (s.id === savedSchedule.id ? savedSchedule : s)));
        } else {
          setSchedules((prev) => [...prev, savedSchedule].sort((a, b) => {
            if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
            return a.sortOrder - b.sortOrder;
          }));
        }
        setShowScheduleDialog(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("ต้องการลบกำหนดการนี้?")) return;
    try {
      const response = await fetch(`/api/settings/schedule/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  // Footer save handler
  const handleSaveFooter = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerForm),
      });

      if (response.ok) {
        const updatedFooter = await response.json();
        setFooterInfo(updatedFooter);
      }
    } catch (error) {
      console.error("Error saving footer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Zone CRUD handlers
  const handleSaveZone = async (data: Partial<Zone>) => {
    setIsSaving(true);
    try {
      const method = editingZone ? "PATCH" : "POST";
      const url = editingZone
        ? `/api/settings/zones/${editingZone.id}`
        : "/api/settings/zones";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedZone = await response.json();
        if (editingZone) {
          setZones((prev) => prev.map((z) => (z.id === savedZone.id ? savedZone : z)));
        } else {
          setZones((prev) => [...prev, savedZone].sort((a, b) => a.code.localeCompare(b.code)));
        }
        setShowZoneDialog(false);
        setEditingZone(null);
      }
    } catch (error) {
      console.error("Error saving zone:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("ต้องการลบเขตสุขภาพนี้? โรงพยาบาลในเขตนี้จะไม่มีการเชื่อมโยงกับเขตสุขภาพ")) return;
    try {
      const response = await fetch(`/api/settings/zones/${id}`, { method: "DELETE" });
      if (response.ok) {
        setZones((prev) => prev.filter((z) => z.id !== id));
      }
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  // Hospital CRUD handlers
  const handleSaveHospital = async (data: Partial<Hospital>) => {
    setIsSaving(true);
    try {
      const method = editingHospital ? "PATCH" : "POST";
      const url = editingHospital
        ? `/api/settings/hospitals/${editingHospital.id}`
        : "/api/settings/hospitals";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedHospital = await response.json();
        if (editingHospital) {
          setHospitals((prev) => prev.map((h) => (h.id === savedHospital.id ? savedHospital : h)));
        } else {
          setHospitals((prev) => [...prev, savedHospital].sort((a, b) => a.name.localeCompare(b.name)));
        }
        setShowHospitalDialog(false);
        setEditingHospital(null);
      }
    } catch (error) {
      console.error("Error saving hospital:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("ต้องการลบโรงพยาบาลนี้?")) return;
    try {
      const response = await fetch(`/api/settings/hospitals/${id}`, { method: "DELETE" });
      if (response.ok) {
        setHospitals((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
    }
  };

  // Hotel CRUD handlers
  const handleSaveHotel = async (data: Partial<Hotel>) => {
    setIsSaving(true);
    try {
      const method = editingHotel ? "PATCH" : "POST";
      const url = editingHotel
        ? `/api/settings/hotels/${editingHotel.id}`
        : "/api/settings/hotels";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedHotel = await response.json();
        if (editingHotel) {
          setHotels((prev) => prev.map((h) => (h.id === savedHotel.id ? savedHotel : h)));
        } else {
          setHotels((prev) => [...prev, savedHotel].sort((a, b) => a.name.localeCompare(b.name)));
        }
        setShowHotelDialog(false);
        setEditingHotel(null);
      }
    } catch (error) {
      console.error("Error saving hotel:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHotel = async (id: number) => {
    if (!confirm("ต้องการลบโรงแรมนี้?")) return;
    try {
      const response = await fetch(`/api/settings/hotels/${id}`, { method: "DELETE" });
      if (response.ok) {
        setHotels((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  };

  // Airline CRUD handlers
  const handleSaveAirline = async (data: Partial<Airline>) => {
    setIsSaving(true);
    try {
      const method = editingAirline ? "PATCH" : "POST";
      const url = editingAirline
        ? `/api/settings/airlines/${editingAirline.id}`
        : "/api/settings/airlines";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedAirline = await response.json();
        if (editingAirline) {
          setAirlines((prev) => prev.map((a) => (a.id === savedAirline.id ? savedAirline : a)));
        } else {
          setAirlines((prev) => [...prev, savedAirline]);
        }
        setShowAirlineDialog(false);
        setEditingAirline(null);
      }
    } catch (error) {
      console.error("Error saving airline:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAirline = async (id: number) => {
    if (!confirm("ต้องการลบสายการบินนี้?")) return;
    try {
      const response = await fetch(`/api/settings/airlines/${id}`, { method: "DELETE" });
      if (response.ok) {
        setAirlines((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error deleting airline:", error);
    }
  };

  // Site config save handler
  const handleSaveSiteConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfigForm),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setSiteConfig(updatedConfig);
      }
    } catch (error) {
      console.error("Error saving site config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Payment settings save handler
  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          meetPrice: paymentForm.meetPrice ? parseFloat(paymentForm.meetPrice) : null,
          meetPriceFollow: paymentForm.meetPriceFollow ? parseFloat(paymentForm.meetPriceFollow) : null,
        }),
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPaymentSettings(updatedPayment);
      }
    } catch (error) {
      console.error("Error saving payment settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-kram-50/30 to-cyan-50/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-kram-100/40 to-cyan-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-100/30 to-kram-100/20 rounded-full blur-3xl" />
      </div>

      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-kram-100 to-cyan-100 text-kram-700 text-sm font-medium mb-4 shadow-sm">
            <Settings className="w-4 h-4" />
            <span>การตั้งค่าระบบ</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-kram-900 via-kram-700 to-cyan-700 bg-clip-text text-transparent">
            ตั้งค่าระบบ
          </h1>
          <p className="text-kram-500 mt-2">
            จัดการเนื้อหา ข้อมูลพื้นฐาน และการตั้งค่าระบบทั้งหมด
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-kram-100/50 shadow-lg shadow-kram-900/5 inline-flex">
            <TabsTrigger
              value="content"
              className="rounded-xl px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kram-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Newspaper className="w-4 h-4 mr-2" />
              เนื้อหา Landing Page
            </TabsTrigger>
            <TabsTrigger
              value="master"
              className="rounded-xl px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kram-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Database className="w-4 h-4 mr-2" />
              ข้อมูลพื้นฐาน
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-xl px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-kram-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              <Cog className="w-4 h-4 mr-2" />
              ตั้งค่าทั่วไป
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Content Management */}
          <TabsContent value="content" className="space-y-6 animate-fade-in">
            {activeSection === null ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TabSummaryCard
                  icon={Newspaper}
                  title="ข่าวสาร"
                  count={news.length}
                  description="จัดการข่าวสารและประกาศ"
                  gradient="from-amber-500 to-orange-500"
                  onClick={() => setActiveSection("news")}
                />
                <TabSummaryCard
                  icon={Calendar}
                  title="กำหนดการ"
                  count={schedules.length}
                  description="จัดการตารางกิจกรรม"
                  gradient="from-kram-500 to-cyan-500"
                  onClick={() => setActiveSection("schedule")}
                />
                <TabSummaryCard
                  icon={FileText}
                  title="Footer"
                  count={footerInfo.length}
                  description="ข้อมูลติดต่อ Footer"
                  gradient="from-emerald-500 to-teal-500"
                  onClick={() => setActiveSection("footer")}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setActiveSection(null)}
                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  กลับ
                </Button>

                {/* News Section */}
                {activeSection === "news" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Newspaper}
                        title="ข่าวสาร"
                        subtitle={`${news.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingNews(null);
                              setShowNewsDialog(true);
                            }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มข่าวสาร
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-kram-100/50">
                        {news.map((item) => (
                          <DataRow
                            key={item.id}
                            actions={
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                  onClick={() => {
                                    setEditingNews(item);
                                    setShowNewsDialog(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteNews(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            }
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-kram-900 truncate">
                                  {item.title}
                                </p>
                                <p className="text-sm text-kram-500">
                                  {new Date(item.publishedAt).toLocaleDateString("th-TH")}
                                </p>
                              </div>
                              <Badge
                                variant={item.isPublished ? "default" : "secondary"}
                                className={
                                  item.isPublished
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-kram-100 text-kram-600"
                                }
                              >
                                {item.isPublished ? "เผยแพร่" : "ฉบับร่าง"}
                              </Badge>
                            </div>
                          </DataRow>
                        ))}
                        {news.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีข่าวสาร</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Section */}
                {activeSection === "schedule" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Calendar}
                        title="กำหนดการ"
                        subtitle={`${schedules.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingSchedule(null);
                              setShowScheduleDialog(true);
                            }}
                            className="bg-gradient-to-r from-kram-500 to-cyan-500 hover:from-kram-600 hover:to-cyan-600 text-white shadow-lg shadow-kram-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มกำหนดการ
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {schedulesByDay.map(([day, daySchedules]) => (
                          <div key={day} className="space-y-3">
                            <h3 className="text-sm font-medium text-kram-600 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-kram-100 flex items-center justify-center text-xs font-bold text-kram-700">
                                {day}
                              </span>
                              วันที่ {day}
                            </h3>
                            <div className="divide-y divide-kram-100/50 rounded-xl border border-kram-100 overflow-hidden bg-white/50">
                              {daySchedules.map((item) => (
                                <DataRow
                                  key={item.id}
                                  actions={
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                        onClick={() => {
                                          setEditingSchedule(item);
                                          setShowScheduleDialog(true);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteSchedule(item.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  }
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[80px]">
                                      <p className="text-sm font-medium text-kram-700">
                                        {item.startTime}
                                      </p>
                                      <p className="text-xs text-kram-400">
                                        {item.endTime}
                                      </p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-kram-900 truncate">
                                        {item.title}
                                      </p>
                                      {item.location && (
                                        <p className="text-sm text-kram-500 flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {item.location}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </DataRow>
                              ))}
                            </div>
                          </div>
                        ))}
                        {schedules.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีกำหนดการ</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Footer Section */}
                {activeSection === "footer" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={FileText}
                        title="ข้อมูล Footer"
                        subtitle="ข้อมูลติดต่อผู้จัดงาน"
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-kram-700">ชื่อผู้จัดงาน</Label>
                          <Input
                            value={footerForm.organizerName}
                            onChange={(e) =>
                              setFooterForm({ ...footerForm, organizerName: e.target.value })
                            }
                            placeholder="ชื่อหน่วยงานผู้จัดงาน"
                            className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-kram-700">อีเมล</Label>
                          <Input
                            value={footerForm.email}
                            onChange={(e) =>
                              setFooterForm({ ...footerForm, email: e.target.value })
                            }
                            placeholder="email@example.com"
                            className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-kram-700">ที่อยู่</Label>
                          <Textarea
                            value={footerForm.address}
                            onChange={(e) =>
                              setFooterForm({ ...footerForm, address: e.target.value })
                            }
                            placeholder="ที่อยู่ติดต่อ"
                            rows={2}
                            className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-kram-700">โทรศัพท์</Label>
                          <Input
                            value={footerForm.phone}
                            onChange={(e) =>
                              setFooterForm({ ...footerForm, phone: e.target.value })
                            }
                            placeholder="เบอร์โทรศัพท์"
                            className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-kram-700">โทรสาร (Fax)</Label>
                          <Input
                            value={footerForm.fax}
                            onChange={(e) =>
                              setFooterForm({ ...footerForm, fax: e.target.value })
                            }
                            placeholder="เบอร์โทรสาร"
                            className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={handleSaveFooter}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          บันทึก
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Master Data */}
          <TabsContent value="master" className="space-y-6 animate-fade-in">
            {activeSection === null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TabSummaryCard
                  icon={LayoutGrid}
                  title="เขตสุขภาพ"
                  count={zones.length}
                  description="จัดการข้อมูลเขตสุขภาพ"
                  gradient="from-violet-500 to-purple-500"
                  onClick={() => setActiveSection("zones")}
                />
                <TabSummaryCard
                  icon={Building2}
                  title="โรงพยาบาล"
                  count={hospitals.length}
                  description="จัดการข้อมูลโรงพยาบาล"
                  gradient="from-kram-500 to-cyan-500"
                  onClick={() => setActiveSection("hospitals")}
                />
                <TabSummaryCard
                  icon={Hotel}
                  title="โรงแรม"
                  count={hotels.length}
                  description="จัดการข้อมูลที่พัก"
                  gradient="from-rose-500 to-pink-500"
                  onClick={() => setActiveSection("hotels")}
                />
                <TabSummaryCard
                  icon={Plane}
                  title="สายการบิน"
                  count={airlines.length}
                  description="จัดการข้อมูลสายการบิน"
                  gradient="from-sky-500 to-blue-500"
                  onClick={() => setActiveSection("airlines")}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <Button
                  variant="ghost"
                  onClick={() => setActiveSection(null)}
                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  กลับ
                </Button>

                {/* Zones Section */}
                {activeSection === "zones" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={LayoutGrid}
                        title="เขตสุขภาพ"
                        subtitle={`${zones.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingZone(null);
                              setShowZoneDialog(true);
                            }}
                            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มเขตสุขภาพ
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-kram-100/50">
                        {zones.map((item) => (
                          <DataRow
                            key={item.id}
                            actions={
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                  onClick={() => {
                                    setEditingZone(item);
                                    setShowZoneDialog(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteZone(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            }
                          >
                            <div className="flex items-center gap-4">
                              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                                {item.code}
                              </Badge>
                              <span className="font-medium text-kram-900">{item.name}</span>
                              <span className="text-sm text-kram-400">
                                ({hospitals.filter((h) => h.zoneCode === item.code).length} รพ.)
                              </span>
                            </div>
                          </DataRow>
                        ))}
                        {zones.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีเขตสุขภาพ</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hospitals Section */}
                {activeSection === "hospitals" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-kram-500 via-cyan-500 to-kram-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Building2}
                        title="โรงพยาบาล"
                        subtitle={`${hospitals.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingHospital(null);
                              setShowHospitalDialog(true);
                            }}
                            className="bg-gradient-to-r from-kram-500 to-cyan-500 hover:from-kram-600 hover:to-cyan-600 text-white shadow-lg shadow-kram-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มโรงพยาบาล
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-kram-100/50 max-h-[600px] overflow-y-auto">
                        {hospitals.map((item) => (
                          <DataRow
                            key={item.id}
                            actions={
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                  onClick={() => {
                                    setEditingHospital(item);
                                    setShowHospitalDialog(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteHospital(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            }
                          >
                            <div className="flex items-center gap-4">
                              <Badge className="bg-kram-100 text-kram-700 hover:bg-kram-200">
                                {item.code}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-kram-900 truncate">{item.name}</p>
                                <p className="text-sm text-kram-500">
                                  {item.province} • {item.zone?.name || "-"}
                                </p>
                              </div>
                            </div>
                          </DataRow>
                        ))}
                        {hospitals.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีโรงพยาบาล</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hotels Section */}
                {activeSection === "hotels" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Hotel}
                        title="โรงแรม"
                        subtitle={`${hotels.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingHotel(null);
                              setShowHotelDialog(true);
                            }}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มโรงแรม
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-kram-100/50">
                        {hotels.map((item) => (
                          <DataRow
                            key={item.id}
                            actions={
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                  onClick={() => {
                                    setEditingHotel(item);
                                    setShowHotelDialog(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteHotel(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            }
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-kram-900">{item.name}</p>
                                <p className="text-sm text-kram-500">{item.phone || "-"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={item.busFlag === "Y" ? "default" : "secondary"}
                                  className={
                                    item.busFlag === "Y"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-kram-100 text-kram-600"
                                  }
                                >
                                  {item.busFlag === "Y" ? "มีรถรับส่ง" : "ไม่มีรถ"}
                                </Badge>
                                <Badge
                                  variant={item.status === "y" ? "default" : "secondary"}
                                  className={
                                    item.status === "y"
                                      ? "bg-kram-100 text-kram-700"
                                      : "bg-red-100 text-red-600"
                                  }
                                >
                                  {item.status === "y" ? "ใช้งาน" : "ปิดใช้งาน"}
                                </Badge>
                              </div>
                            </div>
                          </DataRow>
                        ))}
                        {hotels.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <Hotel className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีโรงแรม</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Airlines Section */}
                {activeSection === "airlines" && (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-500" />
                    <CardHeader className="pb-4">
                      <SectionHeader
                        icon={Plane}
                        title="สายการบิน"
                        subtitle={`${airlines.length} รายการ`}
                        action={
                          <Button
                            onClick={() => {
                              setEditingAirline(null);
                              setShowAirlineDialog(true);
                            }}
                            className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มสายการบิน
                          </Button>
                        }
                      />
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-kram-100/50">
                        {airlines.map((item) => (
                          <DataRow
                            key={item.id}
                            actions={
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-kram-600 hover:text-kram-800 hover:bg-kram-50"
                                  onClick={() => {
                                    setEditingAirline(item);
                                    setShowAirlineDialog(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteAirline(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            }
                          >
                            <div className="flex items-center gap-4">
                              <Plane className="w-5 h-5 text-sky-500" />
                              <span className="font-medium text-kram-900">{item.name}</span>
                              <Badge
                                variant={item.status === "y" ? "default" : "secondary"}
                                className={
                                  item.status === "y"
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-red-100 text-red-600"
                                }
                              >
                                {item.status === "y" ? "ใช้งาน" : "ปิดใช้งาน"}
                              </Badge>
                            </div>
                          </DataRow>
                        ))}
                        {airlines.length === 0 && (
                          <div className="py-12 text-center text-kram-400">
                            <Plane className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>ยังไม่มีสายการบิน</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Site Configuration */}
          <TabsContent value="config" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Site Config */}
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
                <CardHeader className="pb-4">
                  <SectionHeader
                    icon={Globe}
                    title="ตั้งค่าเว็บไซต์"
                    subtitle="โลโก้และลิงก์"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-kram-700">URL โลโก้</Label>
                    <Input
                      value={siteConfigForm.logoUrl}
                      onChange={(e) =>
                        setSiteConfigForm({ ...siteConfigForm, logoUrl: e.target.value })
                      }
                      placeholder="https://example.com/logo.png"
                      className="rounded-xl border-kram-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-kram-700">URL Google Drive</Label>
                    <Input
                      value={siteConfigForm.googleDriveUrl}
                      onChange={(e) =>
                        setSiteConfigForm({ ...siteConfigForm, googleDriveUrl: e.target.value })
                      }
                      placeholder="https://drive.google.com/..."
                      className="rounded-xl border-kram-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    <p className="text-xs text-kram-500">
                      ลิงก์ดาวน์โหลดเอกสารงานประชุม
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSiteConfig}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      บันทึก
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-xl shadow-kram-900/5 overflow-hidden lg:row-span-2">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                <CardHeader className="pb-4">
                  <SectionHeader
                    icon={CreditCard}
                    title="ตั้งค่าการชำระเงิน"
                    subtitle="บัญชีธนาคารและค่าลงทะเบียน"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-kram-700">ชื่องานประชุม</Label>
                    <Input
                      value={paymentForm.name}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, name: e.target.value })
                      }
                      placeholder="ชื่องานประชุม"
                      className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-kram-50 to-cyan-50 border border-kram-100">
                    <h4 className="font-medium text-kram-800 mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      บัญชีผู้ลงทะเบียน
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-kram-600 text-sm">ชื่อบัญชี</Label>
                        <Input
                          value={paymentForm.accountName}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountName: e.target.value })
                          }
                          placeholder="ชื่อบัญชี"
                          className="rounded-xl border-kram-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-kram-600 text-sm">ธนาคาร</Label>
                        <Input
                          value={paymentForm.accountBank}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountBank: e.target.value })
                          }
                          placeholder="ธนาคาร"
                          className="rounded-xl border-kram-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-kram-600 text-sm">เลขที่บัญชี</Label>
                        <Input
                          value={paymentForm.accountNo}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountNo: e.target.value })
                          }
                          placeholder="เลขที่บัญชี"
                          className="rounded-xl border-kram-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-kram-600 text-sm">ค่าลงทะเบียน (บาท)</Label>
                        <Input
                          type="number"
                          value={paymentForm.meetPrice}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, meetPrice: e.target.value })
                          }
                          placeholder="0.00"
                          className="rounded-xl border-kram-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      บัญชีผู้ติดตาม
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-amber-700 text-sm">ชื่อบัญชี</Label>
                        <Input
                          value={paymentForm.accountFollowName}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountFollowName: e.target.value })
                          }
                          placeholder="ชื่อบัญชี"
                          className="rounded-xl border-amber-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-amber-700 text-sm">ธนาคาร</Label>
                        <Input
                          value={paymentForm.accountFollowBank}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountFollowBank: e.target.value })
                          }
                          placeholder="ธนาคาร"
                          className="rounded-xl border-amber-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-amber-700 text-sm">เลขที่บัญชี</Label>
                        <Input
                          value={paymentForm.accountFollowNo}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, accountFollowNo: e.target.value })
                          }
                          placeholder="เลขที่บัญชี"
                          className="rounded-xl border-amber-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-amber-700 text-sm">ค่าลงทะเบียน (บาท)</Label>
                        <Input
                          type="number"
                          value={paymentForm.meetPriceFollow}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, meetPriceFollow: e.target.value })
                          }
                          placeholder="0.00"
                          className="rounded-xl border-amber-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-kram-700">เงื่อนไขการชำระเงิน 1</Label>
                    <Textarea
                      value={paymentForm.condition1}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, condition1: e.target.value })
                      }
                      placeholder="เงื่อนไขการชำระเงิน"
                      rows={3}
                      className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-kram-700">เงื่อนไขการชำระเงิน 2</Label>
                    <Textarea
                      value={paymentForm.condition2}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, condition2: e.target.value })
                      }
                      placeholder="เงื่อนไขเพิ่มเติม"
                      rows={3}
                      className="rounded-xl border-kram-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePayment}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      บันทึก
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* News Dialog */}
      <NewsFormDialog
        open={showNewsDialog}
        onOpenChange={setShowNewsDialog}
        editingItem={editingNews}
        onSave={handleSaveNews}
        isSaving={isSaving}
      />

      {/* Schedule Dialog */}
      <ScheduleFormDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        editingItem={editingSchedule}
        onSave={handleSaveSchedule}
        isSaving={isSaving}
      />

      {/* Zone Dialog */}
      <ZoneFormDialog
        open={showZoneDialog}
        onOpenChange={setShowZoneDialog}
        editingItem={editingZone}
        onSave={handleSaveZone}
        isSaving={isSaving}
      />

      {/* Hospital Dialog */}
      <HospitalFormDialog
        open={showHospitalDialog}
        onOpenChange={setShowHospitalDialog}
        editingItem={editingHospital}
        zones={zones}
        onSave={handleSaveHospital}
        isSaving={isSaving}
      />

      {/* Hotel Dialog */}
      <HotelFormDialog
        open={showHotelDialog}
        onOpenChange={setShowHotelDialog}
        editingItem={editingHotel}
        onSave={handleSaveHotel}
        isSaving={isSaving}
      />

      {/* Airline Dialog */}
      <AirlineFormDialog
        open={showAirlineDialog}
        onOpenChange={setShowAirlineDialog}
        editingItem={editingAirline}
        onSave={handleSaveAirline}
        isSaving={isSaving}
      />
    </div>
  );
}

// ============ Form Dialog Components ============

function NewsFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: News | null;
  onSave: (data: Partial<News>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    isPublished: true,
  });

  // Reset form when dialog opens/closes or editing item changes
  useState(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title,
        content: editingItem.content,
        imageUrl: editingItem.imageUrl || "",
        isPublished: editingItem.isPublished,
      });
    } else {
      setForm({
        title: "",
        content: "",
        imageUrl: "",
        isPublished: true,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-500" />
            {editingItem ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสาร"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>หัวข้อข่าว *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="หัวข้อข่าว"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>เนื้อหา *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="เนื้อหาข่าว (รองรับ HTML)"
              rows={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL รูปภาพ</Label>
            <Input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isPublished}
              onCheckedChange={(checked) => setForm({ ...form, isPublished: checked })}
            />
            <Label>เผยแพร่</Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Schedule | null;
  onSave: (data: Partial<Schedule>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    dayNumber: 1,
    date: "",
    startTime: "",
    endTime: "",
    title: "",
    description: "",
    location: "",
    speaker: "",
    sortOrder: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      date: new Date(form.date),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-kram-500" />
            {editingItem ? "แก้ไขกำหนดการ" : "เพิ่มกำหนดการ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันที่ *</Label>
              <Input
                type="number"
                value={form.dayNumber}
                onChange={(e) => setForm({ ...form, dayNumber: parseInt(e.target.value) })}
                min={1}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>วันที่จริง *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>เวลาเริ่ม *</Label>
              <Input
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="08:00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>เวลาสิ้นสุด *</Label>
              <Input
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="09:00"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>หัวข้อ *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="หัวข้อกิจกรรม"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>รายละเอียด</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="รายละเอียดเพิ่มเติม"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>สถานที่</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="ห้องประชุม..."
              />
            </div>
            <div className="space-y-2">
              <Label>วิทยากร</Label>
              <Input
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                placeholder="ชื่อวิทยากร"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-kram-500 to-cyan-500 hover:from-kram-600 hover:to-cyan-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ZoneFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Zone | null;
  onSave: (data: Partial<Zone>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    code: "",
    name: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-violet-500" />
            {editingItem ? "แก้ไขเขตสุขภาพ" : "เพิ่มเขตสุขภาพ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>รหัสเขต *</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="เช่น Z01, Z02"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>ชื่อเขต *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="เช่น เขตสุขภาพที่ 1"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HospitalFormDialog({
  open,
  onOpenChange,
  editingItem,
  zones,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Hospital | null;
  zones: Zone[];
  onSave: (data: Partial<Hospital>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    province: "",
    hospitalType: "",
    zoneCode: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-kram-500" />
            {editingItem ? "แก้ไขโรงพยาบาล" : "เพิ่มโรงพยาบาล"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>รหัสโรงพยาบาล *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="เช่น H001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <select
                value={form.hospitalType}
                onChange={(e) => setForm({ ...form, hospitalType: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-kram-200 bg-white text-sm"
              >
                <option value="">-- เลือก --</option>
                <option value="A">รพศ. (A)</option>
                <option value="B">รพท. (B)</option>
                <option value="C">รพช. (C)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>ชื่อโรงพยาบาล *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อโรงพยาบาล"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>จังหวัด</Label>
              <Input
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                placeholder="จังหวัด"
              />
            </div>
            <div className="space-y-2">
              <Label>เขตสุขภาพ</Label>
              <select
                value={form.zoneCode}
                onChange={(e) => setForm({ ...form, zoneCode: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-kram-200 bg-white text-sm"
              >
                <option value="">-- เลือกเขต --</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.code}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-kram-500 to-cyan-500 hover:from-kram-600 hover:to-cyan-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function HotelFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Hotel | null;
  onSave: (data: Partial<Hotel>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    website: "",
    mapUrl: "",
    busFlag: "Y",
    status: "y",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-rose-500" />
            {editingItem ? "แก้ไขโรงแรม" : "เพิ่มโรงแรม"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ชื่อโรงแรม *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อโรงแรม"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>โทรศัพท์</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="เบอร์โทร"
              />
            </div>
            <div className="space-y-2">
              <Label>เว็บไซต์</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>ลิงก์ Google Maps</Label>
            <Input
              value={form.mapUrl}
              onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.busFlag === "Y"}
                onCheckedChange={(checked) =>
                  setForm({ ...form, busFlag: checked ? "Y" : "N" })
                }
              />
              <Label>มีรถรับส่ง</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.status === "y"}
                onCheckedChange={(checked) =>
                  setForm({ ...form, status: checked ? "y" : "n" })
                }
              />
              <Label>ใช้งาน</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AirlineFormDialog({
  open,
  onOpenChange,
  editingItem,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Airline | null;
  onSave: (data: Partial<Airline>) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    status: "y",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-500" />
            {editingItem ? "แก้ไขสายการบิน" : "เพิ่มสายการบิน"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ชื่อสายการบิน *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ชื่อสายการบิน"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.status === "y"}
              onCheckedChange={(checked) =>
                setForm({ ...form, status: checked ? "y" : "n" })
              }
            />
            <Label>ใช้งาน</Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
