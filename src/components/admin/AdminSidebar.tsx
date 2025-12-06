/**
 * Admin panel sidebar navigation component.
 *
 * Provides navigation for admin-specific functionality including:
 * - Content management (news, schedule, slideshow)
 * - Master data management (hotels, members, settings)
 * - Payment approval workflow
 *
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Active route highlighting (supports nested routes)
 * - Quick link back to portal dashboard
 * - User info display with avatar initial
 * - Sign out with dynamic origin support
 *
 * Menu items:
 * - แดชบอร์ด (Dashboard) - Admin overview
 * - ข่าวสาร (News) - News article management
 * - กำหนดการ (Schedule) - Conference schedule
 * - สไลด์โชว์ (Slideshow) - Landing page carousel
 * - โรงแรม (Hotels) - Hotel information
 * - อนุมัติชำระเงิน (Payments) - Payment approval
 * - จัดการสมาชิก (Members) - User management
 * - ตั้งค่า (Settings) - System configuration
 *
 * @module components/admin/AdminSidebar
 * @see {@link ../portal/Sidebar.tsx} for portal sidebar
 *
 * @example
 * // In admin layout
 * import { AdminSidebar } from "@/components/admin/AdminSidebar";
 *
 * export default function AdminLayout({ children }) {
 *   const session = await auth();
 *   return (
 *     <div className="flex">
 *       <AdminSidebar user={session.user} />
 *       <main className="lg:ml-64">{children}</main>
 *     </div>
 *   );
 * }
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Image,
  Hotel,
  CreditCard,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";

/**
 * Props for the AdminSidebar component.
 */
interface AdminSidebarProps {
  /** User object from session for display */
  user: {
    /** Admin display name */
    name?: string | null;
    /** Admin email address (first letter used as avatar) */
    email?: string | null;
  };
}

/**
 * Admin navigation menu items.
 * Active state detection supports nested routes (e.g., /admin/news/create).
 */
const menuItems = [
  { label: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
  { label: "ข่าวสาร", href: "/admin/news", icon: Newspaper },
  { label: "กำหนดการ", href: "/admin/schedule", icon: Calendar },
  { label: "สไลด์โชว์", href: "/admin/slideshow", icon: Image },
  { label: "โรงแรม", href: "/admin/hotels", icon: Hotel },
  { label: "อนุมัติชำระเงิน", href: "/admin/payments", icon: CreditCard },
  { label: "จัดการสมาชิก", href: "/admin/members", icon: Users },
  { label: "ตั้งค่า", href: "/admin/settings", icon: Settings },
];

/**
 * Admin sidebar component with content management navigation.
 *
 * Renders a responsive sidebar that:
 * - Highlights active routes (including nested paths)
 * - Provides mobile hamburger menu on small screens
 * - Shows admin user info with email initial avatar
 * - Includes quick link back to portal
 *
 * @component
 * @param props - Component props
 * @param props.user - Admin user session data for display
 */
export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Handle admin sign out with dynamic origin detection.
   * Uses window.location.origin to support ngrok/external domains.
   */
  const handleSignOut = () => {
    // Use dynamic origin for ngrok/external domain support
    const callbackUrl = typeof window !== "undefined"
      ? `${window.location.origin}/`
      : "/";
    signOut({ callbackUrl });
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b bg-indigo-900">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-900" />
          </div>
          <div>
            <p className="font-semibold text-white">Admin Panel</p>
            <p className="text-xs text-indigo-200">ระบบจัดการ</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-indigo-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.email?.[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name || "Admin"}
            </p>
            <p className="text-xs text-indigo-200 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-white text-indigo-900"
                  : "text-indigo-100 hover:bg-indigo-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Portal & Logout */}
      <div className="p-4 border-t border-indigo-800">
        <Link href="/portal/dashboard">
          <Button
            variant="ghost"
            className="w-full justify-start text-indigo-200 hover:text-white hover:bg-indigo-800 mb-2"
          >
            <Users className="w-5 h-5 mr-3" />
            กลับหน้า Portal
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-900/30"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          ออกจากระบบ
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-indigo-900 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-900" />
          </div>
          <span className="font-semibold text-white">Admin Panel</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-white hover:bg-indigo-800"
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
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 w-72 h-full bg-indigo-900 transform transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col lg:bg-indigo-900">
        <SidebarContent />
      </aside>

      {/* Mobile Header Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
