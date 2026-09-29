"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptNik, hashNik } from "@/lib/crypto";
import { verifyNikConsistency } from "@/lib/nik";
import { talentProfileSchema, TalentProfileInput } from "@/validations/talent";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getTalentProfileAction() {
  const user = await requireUser();
  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
    include: {
      verifications: {
        orderBy: { attemptNo: "desc" },
        take: 1,
        include: { video: true },
      },
    },
  });

  return { success: true, profile };
}

export async function saveTalentProfileAction(data: TalentProfileInput) {
  const user = await requireUser();
  const parsed = talentProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const payload = parsed.data;
  const birthDateObj = new Date(payload.birthDate);

  // 1. Verify NIK consistency with birth date & gender
  const consistency = verifyNikConsistency(
    payload.nik,
    birthDateObj,
    payload.gender
  );

  if (!consistency.isConsistent) {
    return {
      success: false,
      error: `Validasi NIK gagal: ${consistency.reason}`,
    };
  }

  // 2. Hash NIK for uniqueness check
  const calculatedNikHash = hashNik(payload.nik);

  // Check duplicate NIK across accounts
  const existingWithNik = await prisma.talentProfile.findUnique({
    where: { nikHash: calculatedNikHash },
  });

  if (existingWithNik && existingWithNik.userId !== user.id) {
    return {
      success: false,
      error: "NIK ini sudah terdaftar pada akun lain. 1 NIK hanya dapat digunakan untuk 1 akun.",
    };
  }

  // 3. Encrypt NIK with AES-256-GCM
  const encryptedNik = encryptNik(payload.nik);

  try {
    const profile = await prisma.talentProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName: payload.fullName,
        nikEncrypted: encryptedNik,
        nikHash: calculatedNikHash,
        birthPlace: payload.birthPlace,
        birthDate: birthDateObj,
        gender: payload.gender,
        phone: payload.phone,
        city: payload.city,
        instagram: payload.instagram || null,
        category: payload.category,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        clothingSize: payload.clothingSize || null,
        shoeSize: payload.shoeSize || null,
        experience: payload.experience || null,
        languages: payload.languages,
        specialNotes: payload.specialNotes || null,
        consentAt: new Date(),
        consentVersion: "v1.0-UU-PDP",
      },
      create: {
        userId: user.id,
        fullName: payload.fullName,
        nikEncrypted: encryptedNik,
        nikHash: calculatedNikHash,
        birthPlace: payload.birthPlace,
        birthDate: birthDateObj,
        gender: payload.gender,
        phone: payload.phone,
        city: payload.city,
        instagram: payload.instagram || null,
        category: payload.category,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        clothingSize: payload.clothingSize || null,
        shoeSize: payload.shoeSize || null,
        experience: payload.experience || null,
        languages: payload.languages,
        specialNotes: payload.specialNotes || null,
        consentAt: new Date(),
        consentVersion: "v1.0-UU-PDP",
      },
    });

    await logAudit({
      actorId: user.id,
      action: "UPDATE_PROFILE",
      targetType: "TalentProfile",
      targetId: profile.id,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true, profileId: profile.id };
  } catch (error: any) {
    console.error("Save profile error:", error);
    return { success: false, error: error.message || "Gagal menyimpan data diri" };
  }
}
