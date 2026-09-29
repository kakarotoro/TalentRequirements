import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewPanel } from "@/components/admin/ReviewPanel";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["ADMIN"]);

  const verification = await prisma.verification.findUnique({
    where: { id },
    include: {
      talent: {
        include: { user: true },
      },
      video: true,
    },
  });

  if (!verification) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/reviews" className="text-xs text-blue-600 hover:underline">
          ← Kembali ke Antrean Review
        </Link>
      </div>

      <ReviewPanel
        verification={{
          ...verification,
          submittedAt: verification.submittedAt.toISOString(),
          talent: {
            ...verification.talent,
            birthDate: verification.talent.birthDate.toISOString(),
          },
        }}
      />
    </div>
  );
}
