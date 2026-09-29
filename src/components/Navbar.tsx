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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isAdmin ? "/admin" : user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              SPG/Usher Portal
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              {isAdmin ? (
                <>
                  <Link
                    href="/admin"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname === "/admin" ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/admin/reviews"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/admin/reviews") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Review Pendaftar
                  </Link>
                  <Link
                    href="/admin/talents"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/admin/talents") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Daftar Talent
                  </Link>
                  <Link
                    href="/admin/events"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/admin/events") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Event & Absensi
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/admin/reports") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Laporan
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/admin/settings") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Pengaturan
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname === "/dashboard" ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname === "/profile" ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Data Diri
                  </Link>
                  <Link
                    href="/verification"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname === "/verification" ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Verifikasi KTP & Video
                  </Link>
                  <Link
                    href="/events"
                    className={`transition-colors hover:text-blue-600 ${
                      pathname.startsWith("/events") ? "text-blue-600" : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Cari Lowongan
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-zinc-500 font-medium">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
