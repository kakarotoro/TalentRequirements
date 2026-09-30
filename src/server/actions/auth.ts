"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/validations/auth";
import { logAudit } from "@/lib/audit";

export async function registerAction(data: RegisterInput) {
  if ((data as any)?.role === "ADMIN") {
    return {
      success: false,
      error: "Pendaftaran akun admin baru dinonaktifkan. Akun admin hanya dapat dibuat melalui otorisasi internal.",
    };
  }

  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { email, password, role } = parsed.data;

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Gagal membuat akun" };
    }

    // Auto-confirm email directly in database (offline / development mode: no email verification required)
    try {
      await prisma.$executeRaw`
        UPDATE auth.users 
        SET email_confirmed_at = NOW() 
        WHERE id = ${authData.user.id}::uuid
      `;
    } catch (confirmErr) {
      console.warn("Auto-confirm error:", confirmErr);
    }

    // Upsert into Prisma User
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email, role },
        create: {
          id: authData.user.id,
          email,
          role,
        },
      });

      await logAudit({
        actorId: authData.user.id,
        action: "REGISTER",
        targetType: "User",
        targetId: authData.user.id,
        meta: { email, role },
      });
    } catch (dbErr) {
      console.warn("Database upsert error during registration:", dbErr);
    }

    // Automatically sign in the user immediately so no login or email verification is needed
    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (loginErr) {
      console.warn("Auto-login error after registration:", loginErr);
    }

    return {
      success: true,
      user: { id: authData.user.id, email, role },
      redirectUrl: "/dashboard",
    };
  } catch (error: any) {
    console.error("Register action error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan internal" };
  }
}

export async function loginAction(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const { email, password, portal } = parsed.data;

  try {
    const supabase = await createClient();
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase reports email is not confirmed, auto-confirm directly in database and retry immediately
    if (
      authError &&
      (authError.message?.toLowerCase().includes("not confirmed") ||
        authError.message?.toLowerCase().includes("email_not_confirmed") ||
        authError.status === 400)
    ) {
      try {
        await prisma.$executeRaw`
          UPDATE auth.users 
          SET email_confirmed_at = NOW() 
          WHERE email = ${email}
        `;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (!retry.error && retry.data.user) {
          authData = retry.data;
          authError = null;
        }
      } catch (retryErr) {
        console.warn("Retry auto-confirm error:", retryErr);
      }
    }

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Email atau password salah" };
    }

    let role = (authData.user.user_metadata?.role as "ADMIN" | "TALENT") || "TALENT";

    // Get user details from DB if available
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: authData.user.id },
        include: { talent: true },
      });

      if (dbUser?.role) {
        role = dbUser.role as "ADMIN" | "TALENT";
      }

      await logAudit({
        actorId: authData.user.id,
        action: "LOGIN",
        targetType: "User",
        targetId: authData.user.id,
      });
    } catch (dbErr) {
      console.warn("DB not connected yet, using Supabase Auth metadata role:", role);
    }

    if (portal === "ADMIN" && role !== "ADMIN") {
      return {
        success: false,
        error: "Akses ditolak: Akun ini terdaftar sebagai Talent. Silakan gunakan portal login Talent.",
      };
    }

    return {
      success: true,
      role,
      redirectUrl: role === "ADMIN" ? "/admin" : "/dashboard",
    };
  } catch (error: any) {
    console.error("Login action error:", error);
    return { success: false, error: error.message || "Gagal masuk ke sistem" };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
