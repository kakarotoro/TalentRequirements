"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/validations/auth";
import { logAudit } from "@/lib/audit";

export async function registerAction(data: RegisterInput) {
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

    // Upsert into Prisma User
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

    return {
      success: true,
      user: { id: authData.user.id, email, role },
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

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Email atau password salah" };
    }

    // Get user details
    const dbUser = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { talent: true },
    });

    const role = dbUser?.role || "TALENT";

    await logAudit({
      actorId: authData.user.id,
      action: "LOGIN",
      targetType: "User",
      targetId: authData.user.id,
    });

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
