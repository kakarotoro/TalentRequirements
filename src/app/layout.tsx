import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Platform Rekrutmen & Absensi SPG / Usher",
  description: "Platform digital rekrutmen dan absensi berbasis GPS & AI Face Verification untuk SPG dan Usher",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans">
        <Navbar user={session ? { email: session.email, role: session.role } : null} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
          <p>© 2026 SPG/Usher Recruitment & Attendance Platform. UU PDP Compliant.</p>
        </footer>
      </body>
    </html>
  );
}
