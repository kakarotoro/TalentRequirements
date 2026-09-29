"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"TALENT" | "ADMIN">("TALENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await registerAction({
      email,
      password,
      confirmPassword,
      role,
    });

    if (!res.success) {
      setError(res.error || "Gagal membuat akun");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 animate-fade-in">
      <Card className="border-slate-200/90 shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Daftar Akun Baru
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Bergabung dengan platform resmi SPG & Usher
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-3">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Tipe Akun Pendaftaran
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole("TALENT")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    role === "TALENT"
                      ? "bg-white text-blue-800 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Talent (SPG / Usher)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    role === "ADMIN"
                      ? "bg-white text-blue-800 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Admin / Reviewer
                </button>
              </div>
            </div>

            <Input
              label="Alamat Email Resmi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />

            <Input
              label="Kata Sandi (Min. 8 Karakter)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" className="w-full" size="md" isLoading={loading}>
              Daftar Sekarang
            </Button>

            <div className="pt-2 text-center border-t border-slate-100 w-full">
              <p className="text-xs text-slate-500">
                Sudah memiliki akun?{" "}
                <Link href="/login" className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-2">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
