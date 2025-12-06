"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  CreditCard,
  FileCheck,
  BarChart3,
  FileText,
  Menu,
  X,
  LogOut,
  Building2,
  ChevronRight,
  Settings,
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    memberType?: number;
  };
}

const menuItems = [
  { label: "หน้าแรก", href: "/portal/dashboard", icon: Home },
  { label: "ตรวจสอบการลงทะเบียน", href: "/portal/registration", icon: Users },
  { label: "แจ้งชำระเงิน", href: "/portal/payment", icon: CreditCard },
  { label: "ตรวจสอบชำระเงิน", href: "/portal/payment-status", icon: FileCheck, adminOnly: true },
  { label: "แดชบอร์ด", href: "/portal/stats", icon: BarChart3, adminOnly: true },
  { label: "รายงาน", href: "/portal/reports", icon: FileText, adminOnly: true },
  { label: "ตั้งค่า", href: "/portal/settings", icon: Settings, adminOnly: true },
];

export function PortalSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user.memberType === 99;

  const handleSignOut = () => {
    // Use dynamic origin for ngrok/external domain support
    const callbackUrl = typeof window !== "undefined"
      ? `${window.location.origin}/`
      : "/";
    signOut({ callbackUrl });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-kram-900 via-kram-800 to-kram-900">
      {/* Header with Logo */}
      <div className="p-5 border-b border-white/10">
        <Link
          href="/portal/dashboard"
          className="flex items-center gap-3 group"
        >
          <div className="w-11 h-11 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
            <Image
              src="/snlogo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-white">ระบบลงทะเบียน</p>
            <p className="text-xs text-cyan-300/80">งานประชุมวิชาการ</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 mx-3 mt-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-kram-500 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name || "โรงพยาบาล"}
            </p>
            <p className="text-xs text-kram-300 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 mt-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Skip admin-only items for non-admin users
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-kram-500/20 text-white border border-cyan-500/30"
                  : "text-kram-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "bg-gradient-to-br from-cyan-500 to-kram-600 shadow-lg shadow-cyan-500/25"
                    : "bg-white/10 group-hover:bg-white/15"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl py-3 h-auto"
          onClick={handleSignOut}
        >
          <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center mr-3">
            <LogOut className="w-5 h-5" />
          </div>
          ออกจากระบบ
        </Button>
      </div>

      {/* Version Info */}
      <div className="px-4 pb-4 text-center">
        <p className="text-xs text-kram-400">v1.0.0 • โรงพยาบาลสกลนคร</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-kram-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/portal/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Image
              src="/snlogo.png"
              alt="Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="font-semibold text-white">ระบบลงทะเบียน</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 w-72 h-full transform transition-transform duration-300 ease-out shadow-2xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 lg:flex-col shadow-2xl shadow-kram-900/50">
        <SidebarContent />
      </aside>

      {/* Mobile Header Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
