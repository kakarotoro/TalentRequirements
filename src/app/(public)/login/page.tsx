"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
          <CardTitle className="text-xl font-bold text-slate-900">
            Masuk ke Portal Talent
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan email dan kata sandi akun Anda
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
              placeholder="talent@email.com"
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

            <div className="pt-2 text-center border-t border-slate-100 w-full space-y-1.5">
              <p className="text-xs text-slate-500">
                Belum terdaftar sebagai talent?{" "}
                <Link href="/register" className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-2">
                  Daftar di sini
                </Link>
              </p>
              <p className="text-xs text-slate-400">
                Staf / Administrator?{" "}
                <Link href="/admin/login" className="text-slate-600 hover:text-blue-700 font-medium underline underline-offset-2">
                  Masuk ke Portal Admin
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
