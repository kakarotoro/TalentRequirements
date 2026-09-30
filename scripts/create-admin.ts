import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ywjsutaqoeoaqopzrehl.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_0mjxpgiUE5yNVeJanyc67A_9QeAGOrz";
const supabase = createClient(url, key);

export async function createOrUpdateAdmin(email: string, password?: string) {
  console.log(`Setting up Admin account for: ${email}`);

  // Check if exists in Supabase
  let userId: string | null = null;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "ADMIN" },
      },
    });

    if (error && !error.message.includes("already registered")) {
      console.error("Supabase auth error:", error);
      throw error;
    }

    if (data?.user?.id) {
      userId = data.user.id;
    }
  }

  if (!userId && existingUser) {
    userId = existingUser.id;
  }

  if (!userId) {
    // Check auth.users directly
    const authRecord: any = await prisma.$queryRaw`
      SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
    `;
    if (authRecord && authRecord[0]) {
      userId = authRecord[0].id;
    }
  }

  if (!userId) {
    console.error("Could not determine user ID for admin");
    return;
  }

  // Update auth metadata and email confirmed
  await prisma.$executeRawUnsafe(`
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"ADMIN"'::jsonb)
    WHERE id = '${userId}'::uuid
  `);

  // Upsert into Prisma User
  await prisma.user.upsert({
    where: { email },
    update: { id: userId, role: "ADMIN" },
    create: { id: userId, email, role: "ADMIN" },
  });

  console.log(`✓ Admin user successfully verified and configured: ${email}`);
}

async function main() {
  const email = process.argv[2] || "admin@shp-entertainment.com";
  const password = process.argv[3] || "AdminSHP2026!";
  await createOrUpdateAdmin(email, password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
