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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Antrean Review
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
