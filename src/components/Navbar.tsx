"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/server/actions/auth";

interface NavbarProps {
  user?: {
    email: string;
    role: "TALENT" | "ADMIN";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href={isAdmin ? "/admin" : user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 bg-white shadow-2xs">
              <Image
                src="/logo.webp"
                alt="SHP Entertainment Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                SHP <span className="text-blue-700">Entertainment</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                SPG & USHER Recruitment
              </span>
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
              {isAdmin ? (
                <>
                  {[
                    { href: "/admin", label: "Overview" },
                    { href: "/admin/reviews", label: "Review Pendaftar" },
                    { href: "/admin/talents", label: "Daftar Talent" },
                    { href: "/admin/events", label: "Event & Absensi" },
                    { href: "/admin/reports", label: "Laporan" },
                    { href: "/admin/settings", label: "Pengaturan" },
                  ].map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <>
                  {[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/profile", label: "Data Diri" },
                    { href: "/verification", label: "Verifikasi Berkas" },
                  ].map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">
                  {user.email}
                </span>
                <span className="text-[10px] font-semibold text-blue-700 tracking-wider">
                  ROLE: {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-150 cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all duration-150 active:scale-95"
              >
                Daftar Talent
              </Link>
              <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>
              <Link
                href="/admin/login"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-2xs"
                title="Portal Masuk Administrator"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Portal Admin</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
