import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data...");

  // 1. Seed AppSettings
  const settings = [
    { key: "faceMatchThreshold", value: 85 },
    { key: "defaultGeofenceRadius", value: 100 },
    { key: "maxReuploadPerDay", value: 3 },
    { key: "maxLateMinutes", value: 15 },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log("✓ AppSettings seeded");

  // 2. Seed Admin User
  const adminId = "00000000-0000-0000-0000-000000000001";
  const adminEmail = "admin@spg-agency.com";

  const admin = await prisma.user.upsert({
    where: { id: adminId },
    update: { role: "ADMIN", email: adminEmail },
    create: {
      id: adminId,
      email: adminEmail,
      role: "ADMIN",
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // 3. Seed Sample Events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0);

  await prisma.event.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      title: "Gaikindo Indonesia International Auto Show (GIIAS) - Brand Booth",
      clientName: "PT Otomotif Prima Nusantara",
      description: "Dibutuhkan 6 Usher profesional untuk bertugas di booth VIP Hall 7 ICE BSD.",
      venueName: "ICE BSD City Hall 7",
      address: "Jl. BSD Grand Boulevard No.1, Pagedangan, Tangerang, Banten",
      latitude: -6.3023,
      longitude: 106.6375,
      radiusMeters: 150,
      startsAt: tomorrow,
      endsAt: tomorrowEnd,
      checkInOpensMinutesBefore: 60,
      requiredCount: 6,
      category: "USHER",
      fee: 850000,
      requirements: "Tinggi min 168 cm, berpenampilan menarik, ramah, menguasai Bahasa Inggris dasar.",
      status: "OPEN",
      createdById: admin.id,
    },
  });

  console.log("✓ Sample event seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
