import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบลงทะเบียนงานประชุมวิชาการ | สำนักงานสาธารณสุขจังหวัดสกลนคร",
  description: "ระบบลงทะเบียนงานประชุมวิชาการประจำปี 2568 สำนักงานสาธารณสุขจังหวัดสกลนคร",
  keywords: ["งานประชุมวิชาการ", "สาธารณสุข", "สกลนคร", "ลงทะเบียน"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className={`${sarabun.variable} font-sans`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
