"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({
      email,
      password,
      portal: "ADMIN",
    });

    if (!res.success) {
      setError(res.error || "Gagal masuk ke portal admin");
      setLoading(false);
    } else {
      router.push(res.redirectUrl || "/admin");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <Card className="border-slate-200/90 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border border-slate-100 bg-white shadow-2xs p-1 flex items-center justify-center">
            <Image
              src="/logo.webp"
              alt="SHP Entertainment Logo"
              width={64}
              height={64}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <CardTitle className="text-xl font-extrabold text-slate-900">
            Portal Masuk Administrator
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Panel Kurasi, Review Verifikasi & Manajemen Penugasan
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-3">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">🔒 Akses Terbatas Internal</span>
              Halaman ini dikhususkan bagi staf administrator. Pendaftaran akun admin baru dilakukan melalui otorisasi internal.
            </div>

            <Input
              label="Alamat Email Administrator"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@perusahaan.com"
              required
            />

            <Input
              label="Kata Sandi Administrator"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
              size="md"
              isLoading={loading}
            >
              Masuk Sebagai Admin
            </Button>

            <div className="pt-2 text-center border-t border-slate-100 w-full">
              <p className="text-xs text-slate-500">
                Bukan administrator?{" "}
                <Link href="/login" className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-2">
                  Masuk sebagai Talent
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
