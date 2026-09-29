import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { decryptNik } from "@/lib/crypto";

export default async function TalentProfilePage() {
  const user = await requireRole(["TALENT"]);

  const profile = await prisma.talentProfile.findUnique({
    where: { userId: user.id },
  });

  let decryptedNik = "";
  if (profile?.nikEncrypted) {
    try {
      decryptedNik = decryptNik(profile.nikEncrypted);
    } catch {
      decryptedNik = "";
    }
  }

  const initialData = profile
    ? {
        ...profile,
        nik: decryptedNik,
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Data Diri & Profil Talent
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Lengkapi data identitas resmi, karakteristik fisik, dan riwayat pengalaman event Anda.
        </p>
      </div>

      <ProfileForm initialData={initialData} />
    </div>
  );
}
