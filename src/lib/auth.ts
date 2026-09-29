import { createClient } from "./supabase/server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export interface AppUserSession {
  id: string;
  email: string;
  role: "TALENT" | "ADMIN";
  talentProfileId?: string;
  status?: string;
}

export async function getSession(): Promise<AppUserSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { talent: true },
    });

    if (!dbUser) {
      // In case user exists in Supabase Auth but not yet in User table, create default
      const role = (user.user_metadata?.role as "ADMIN" | "TALENT") || "TALENT";
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          role,
        },
      });

      return {
        id: created.id,
        email: created.email,
        role: created.role as "ADMIN" | "TALENT",
      };
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as "ADMIN" | "TALENT",
      talentProfileId: dbUser.talent?.id,
      status: dbUser.talent?.status,
    };
  } catch (error) {
    console.error("Error retrieving user session:", error);
    return null;
  }
}

export async function requireUser(): Promise<AppUserSession> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(
  allowedRoles: ("ADMIN" | "TALENT")[]
): Promise<AppUserSession> {
  const session = await requireUser();
  if (!allowedRoles.includes(session.role)) {
    if (session.role === "TALENT") {
      redirect("/dashboard");
    } else {
      redirect("/admin");
    }
  }
  return session;
}
