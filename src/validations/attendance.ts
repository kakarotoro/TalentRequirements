import { z } from "zod";

export const attendanceSchema = z.object({
  applicationId: z.string().uuid("Application ID tidak valid"),
  type: z.enum(["CHECK_IN", "CHECK_OUT"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().optional(),
  selfiePath: z.string().min(1, "Path foto selfie absensi wajib disertakan"),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
