"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await loginAction({ email, password });

    if (!res.success) {
      setError(res.error || "Gagal masuk ke akun");
      setLoading(false);
    } else {
      router.push(res.redirectUrl || "/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Masuk ke Akun Portal
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan email dan password terdaftar Anda
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {error}
              </div>
            )}

            <Input
              label="Alamat Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com atau talent@email.com"
              required
            />

            <Input
              label="Kata Sandi (Password)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" size="md" isLoading={loading}>
              Masuk Sekarang
            </Button>

            <div className="pt-2 text-center border-t border-slate-100 w-full">
              <p className="text-xs text-slate-500">
                Belum terdaftar sebagai talent?{" "}
                <Link href="/register" className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-2">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
