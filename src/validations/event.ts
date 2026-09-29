import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Judul event minimal 3 karakter"),
  clientName: z.string().min(2, "Nama klien wajib diisi"),
  description: z.string().optional(),

  venueName: z.string().min(2, "Nama venue wajib diisi"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().min(10).max(5000).default(100),

  startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Waktu mulai tidak valid",
  }),
  endsAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Waktu selesai tidak valid",
  }),
  checkInOpensMinutesBefore: z.coerce.number().min(15).max(180).default(60),

  requiredCount: z.coerce.number().min(1, "Jumlah talent minimal 1 orang"),
  category: z.enum(["SPG", "USHER", "BOTH"]),
  fee: z.coerce.number().min(0).optional(),
  requirements: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "ONGOING", "DONE", "CANCELLED"]).default("OPEN"),
}).refine(
  (data) => new Date(data.endsAt) > new Date(data.startsAt),
  {
    message: "Waktu selesai harus setelah waktu mulai",
    path: ["endsAt"],
  }
);

export type EventInput = z.infer<typeof eventSchema>;
