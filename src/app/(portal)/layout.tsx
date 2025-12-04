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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-kram-50/30">
      {/* Subtle background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-kram-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <PortalSidebar user={session.user} />
      <div className="lg:pl-64 relative">
        <main className="p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
