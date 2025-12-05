import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal/Sidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-kram-50/30 relative">
      {/* Animated background decorations - Dawn of Innovation feel */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Top-right cyan glow - represents hope/future */}
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/50 via-cyan-100/30 to-transparent rounded-full blur-3xl animate-pulse-soft" />

        {/* Bottom-left kram glow - represents stability */}
        <div className="absolute -bottom-40 -left-20 w-[700px] h-[700px] bg-gradient-to-tr from-kram-100/40 via-kram-50/20 to-transparent rounded-full blur-3xl" />

        {/* Center accent - subtle connection */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-50/20 via-transparent to-transparent rounded-full" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, #06128a 1px, transparent 1px), linear-gradient(to bottom, #06128a 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <PortalSidebar user={session.user} />
      <div className="lg:pl-64 relative">
        <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
