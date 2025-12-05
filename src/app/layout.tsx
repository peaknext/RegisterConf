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
  title:
    "ระบบลงทะเบียนงานประชุมวิชาการ ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป ประจำปี 2569",
  description:
    "ระบบลงทะเบียนงานประชุมวิชาการ ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป ประจำปี 2569",
  keywords: ["งานประชุมวิชาการ", "สาธารณสุข", "สกลนคร", "ลงทะเบียน"],
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
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
