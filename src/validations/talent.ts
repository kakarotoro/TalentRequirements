import { z } from "zod";
import { validateNikStructure } from "@/lib/nik";

export const talentProfileSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .refine((val) => validateNikStructure(val).isValid, {
      message: "Format struktur NIK tidak valid",
    }),
  birthPlace: z.string().min(2, "Tempat lahir wajib diisi"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Tanggal lahir tidak valid",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    errorMap: () => ({ message: "Pilih jenis kelamin" }),
  }),
  phone: z
    .string()
    .min(10, "Nomor WhatsApp minimal 10 digit")
    .max(15, "Nomor WhatsApp maksimal 15 digit")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format nomor telepon/WhatsApp Indonesia tidak valid"),
  city: z.string().min(2, "Kota domisili wajib diisi"),
  instagram: z.string().optional().or(z.literal("")),

  category: z.enum(["SPG", "USHER", "BOTH"], {
    errorMap: () => ({ message: "Pilih kategori talent" }),
  }),
  heightCm: z.coerce.number().min(140, "Tinggi minimal 140 cm").max(210, "Tinggi maksimal 210 cm"),
  weightKg: z.coerce.number().min(35, "Berat minimal 35 kg").max(120, "Berat maksimal 120 kg"),
  clothingSize: z.string().optional(),
  shoeSize: z.coerce.number().min(34).max(48).optional(),
  experience: z.string().max(1000).optional(),
  languages: z.array(z.string()).default(["Bahasa Indonesia"]),
  specialNotes: z.string().max(500).optional(),

  consent: z.literal(true, {
    errorMap: () => ({ message: "Anda harus menyetujui pemrosesan data pribadi (UU PDP)" }),
  }),
});

export type TalentProfileInput = z.infer<typeof talentProfileSchema>;
