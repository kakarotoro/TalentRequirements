import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_...")) {
    return null;
  }
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Talent Team <noreply@spg-recruitment.com>";

export async function sendVerificationResultEmail(params: {
  to: string;
  fullName: string;
  decision: "APPROVED" | "REJECTED";
  note?: string | null;
}) {
  const resend = getResendClient();
  const isApproved = params.decision === "APPROVED";
  const subject = isApproved
    ? "Selamat! Akun Talent Anda Telah Terverifikasi"
    : "Update Status Verifikasi Akun Talent";

  const content = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Halo, ${params.fullName}</h2>
      <p>
        ${
          isApproved
            ? "Selamat! Profil Anda telah berhasil diverifikasi oleh tim kurasi kami. Anda sekarang dapat melihat dan melamar lowongan event SPG & Usher yang tersedia."
            : "Mohon maaf, pengajuan verifikasi profil Anda belum dapat kami setujui saat ini."
        }
      </p>
      ${
        params.note
          ? `<div style="background: #f4f4f5; padding: 12px; border-radius: 6px; margin: 16px 0;">
              <strong>Catatan Tim Reviewer:</strong>
              <p style="margin: 4px 0 0 0;">${params.note}</p>
            </div>`
          : ""
      }
      <p style="margin-top: 24px;">Salam,<br/>Tim Rekrutmen SPG / Usher</p>
    </div>
  `;

  if (!resend) {
    console.log(`[Email Simulation] To: ${params.to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: content,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error };
  }
}

export async function sendApplicationStatusEmail(params: {
  to: string;
  fullName: string;
  eventTitle: string;
  status: "SHORTLISTED" | "CONFIRMED" | "REJECTED";
}) {
  const resend = getResendClient();
  const subject = `Update Lamaran Event: ${params.eventTitle}`;

  const messageMap: Record<string, string> = {
    SHORTLISTED: "Profil Anda telah masuk ke dalam tahap shortlist untuk event ini. Mohon bersiap untuk konfirmasi selanjutnya.",
    CONFIRMED: "Selamat! Anda telah DIKONFIRMASI bertugas pada event ini. Pastikan hadir tepat waktu dan lakukan absensi di lokasi.",
    REJECTED: "Terima kasih telah melamar. Mohon maaf untuk event kali ini kualifikasi Anda belum sesuai dengan kebutuhan klien.",
  };

  const content = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Halo, ${params.fullName}</h2>
      <p>${messageMap[params.status]}</p>
      <p><strong>Event:</strong> ${params.eventTitle}</p>
      <p style="margin-top: 24px;">Salam,<br/>Tim Event Management</p>
    </div>
  `;

  if (!resend) {
    console.log(`[Email Simulation] To: ${params.to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: content,
    });
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send application status email:", err);
    return { success: false, error: err };
  }
}
