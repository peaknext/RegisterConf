"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${Math.random() * 20 + 5}px`,
            height: `${Math.random() * 20 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(135deg,
              ${i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#0891b2" : "#06128a"},
              transparent)`,
            animation: `floatParticle ${
              15 + Math.random() * 20
            }s linear infinite`,
            animationDelay: `${-Math.random() * 20}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Animated rings component
function AnimatedRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: `${200 + i * 150}px`,
            height: `${200 + i * 150}px`,
            animation: `pulseRing ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulseRing {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/portal/dashboard");
        router.refresh();
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [{ icon: Building2, text: "สำหรับตัวแทนโรงพยาบาล" }];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Dawn Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-kram-600 to-kram-900" />

        {/* Animated mesh gradient */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(8, 145, 178, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(6, 18, 138, 0.3) 0%, transparent 70%)
            `,
          }}
        />

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Animated Rings */}
        <AnimatedRings />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - Logo */}
          <div
            className={cn(
              "flex items-center gap-4 transition-all duration-1000",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-xl">
              <Image
                src="/snlogo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <p className="text-white/90 font-medium text-lg">
                โรงพยาบาลสกลนคร
              </p>
              <p className="text-white/60 text-sm">Sakon Nakhon Hospital</p>
            </div>
          </div>

          {/* Center - Main Message */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <div
              className={cn(
                "space-y-6 transition-all duration-1000 delay-200",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-white/90 text-sm font-medium">
                  งานประชุมวิชาการ
                </span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                พัฒนาศักยภาพ
                <br />
                <span className="text-cyan-300">ผู้บริหารโรงพยาบาล</span>
              </h1>

              <p className="text-white/70 text-lg max-w-md leading-relaxed">
                ระบบลงทะเบียนและจัดการงานประชุมวิชาการ
                สำหรับโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป
              </p>

              {/* Features */}
              <div className="space-y-4 pt-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 transition-all duration-700",
                        mounted
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-8"
                      )}
                      style={{ transitionDelay: `${400 + index * 150}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-white/80">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom - Stats */}
          <div
            className={cn(
              "grid grid-cols-3 gap-6 transition-all duration-1000 delay-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {[
              { value: "100+", label: "โรงพยาบาล" },
              { value: "500+", label: "ผู้ลงทะเบียน" },
              { value: "13", label: "เขตสุขภาพ" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-100/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div
          className={cn(
            "w-full max-w-md relative z-10 transition-all duration-1000 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-kram-700 flex items-center justify-center shadow-lg shadow-kram-700/25">
              <Image
                src="/snlogo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p className="text-kram-900 font-semibold">งานประชุมวิชาการ</p>
              <p className="text-kram-500 text-sm">โรงพยาบาลสกลนคร</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-kram-900 mb-2">
              ยินดีต้อนรับ
            </h2>
            <p className="text-kram-500">เข้าสู่ระบบเพื่อจัดการการลงทะเบียน</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-kram-700 font-medium flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                อีเมล
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@hospital.go.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "h-12 pl-4 pr-4 bg-white border-2 rounded-xl transition-all duration-300",
                    "placeholder:text-kram-300",
                    focusedField === "email"
                      ? "border-cyan-500 ring-4 ring-cyan-500/10"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-kram-500/20 opacity-0 transition-opacity duration-300 pointer-events-none -z-10",
                    focusedField === "email" && "opacity-100"
                  )}
                  style={{ filter: "blur(20px)" }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-kram-700 font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                รหัสผ่าน
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isLoading}
                  className={cn(
                    "h-12 pl-4 pr-4 bg-white border-2 rounded-xl transition-all duration-300",
                    "placeholder:text-kram-300",
                    focusedField === "password"
                      ? "border-cyan-500 ring-4 ring-cyan-500/10"
                      : "border-kram-200 hover:border-kram-300"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-kram-500/20 opacity-0 transition-opacity duration-300 pointer-events-none -z-10",
                    focusedField === "password" && "opacity-100"
                  )}
                  style={{ filter: "blur(20px)" }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full h-12 text-base font-semibold rounded-xl relative overflow-hidden",
                "bg-gradient-to-r from-kram-700 via-kram-600 to-cyan-600",
                "hover:from-kram-600 hover:via-kram-500 hover:to-cyan-500",
                "shadow-lg shadow-kram-700/25 hover:shadow-xl hover:shadow-kram-700/30",
                "transition-all duration-300 hover:-translate-y-0.5",
                "group"
              )}
              disabled={isLoading}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  เข้าสู่ระบบ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-kram-100">
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-kram-600 hover:text-kram-800 transition-colors group"
              >
                <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                กลับหน้าแรก
              </Link>
            </div>
          </div>

          {/* Support Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-kram-400">
              ต้องการความช่วยเหลือ?{" "}
              <a
                href="mailto:saraban_skonpho@moph.go.th"
                className="text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
              >
                ติดต่อเรา
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
