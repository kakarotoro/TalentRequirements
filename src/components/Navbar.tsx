"use client";

import Link from "next/link";
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
            <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                SPG & Usher <span className="text-blue-700">Portal</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                Enterprise Recruitment
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
                    { href: "/events", label: "Cari Lowongan" },
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
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-blue-700 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all duration-150 active:scale-95"
              >
                Daftar Talent
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
