/**
 * Indonesian NIK (Nomor Induk Kependudukan) validator
 * Structure: 16 digits
 * - Digits 1-2: Kode Provinsi
 * - Digits 3-4: Kode Kota / Kabupaten
 * - Digits 5-6: Kode Kecamatan
 * - Digits 7-8: Tanggal Lahir (untuk wanita: tanggal + 40)
 * - Digits 9-10: Bulan Lahir (01-12)
 * - Digits 11-12: 2 digit terakhir tahun lahir (YY)
 * - Digits 13-16: Nomor urut (0001-9999)
 */

export interface NikValidationResult {
  isValid: boolean;
  error?: string;
  parsedDate?: Date;
  parsedGender?: "MALE" | "FEMALE";
}

export function validateNikStructure(nik: string): NikValidationResult {
  const cleaned = nik.trim();
  if (!/^\d{16}$/.test(cleaned)) {
    return {
      isValid: false,
      error: "NIK harus terdiri dari 16 digit angka",
    };
  }

  let day = parseInt(cleaned.substring(6, 8), 10);
  const month = parseInt(cleaned.substring(8, 10), 10);
  const year2Digits = parseInt(cleaned.substring(10, 12), 10);

  let gender: "MALE" | "FEMALE" = "MALE";
  if (day > 40) {
    gender = "FEMALE";
    day -= 40;
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: "Tanggal pada NIK tidak valid" };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Bulan pada NIK tidak valid" };
  }

  // Calculate year estimate: assume person is between 15 and 80 years old
  const currentYear = new Date().getFullYear();
  const currentYear2Digits = currentYear % 100;
  const fullYear =
    year2Digits <= currentYear2Digits
      ? 2000 + year2Digits
      : 1900 + year2Digits;

  const parsedDate = new Date(Date.UTC(fullYear, month - 1, day));

  return {
    isValid: true,
    parsedDate,
    parsedGender: gender,
  };
}

/**
 * Validates consistency between NIK, birth date, and declared gender.
 */
export function verifyNikConsistency(
  nik: string,
  birthDate: Date,
  gender: "MALE" | "FEMALE"
): { isConsistent: boolean; reason?: string } {
  const validation = validateNikStructure(nik);
  if (!validation.isValid || !validation.parsedDate || !validation.parsedGender) {
    return { isConsistent: false, reason: validation.error || "NIK tidak valid" };
  }

  if (validation.parsedGender !== gender) {
    return {
      isConsistent: false,
      reason: `Jenis kelamin NIK (${validation.parsedGender}) tidak sesuai dengan input (${gender})`,
    };
  }

  const bYear = birthDate.getFullYear() % 100;
  const bMonth = birthDate.getMonth() + 1;
  const bDay = birthDate.getDate();

  const pYear = validation.parsedDate.getFullYear() % 100;
  const pMonth = validation.parsedDate.getMonth() + 1;
  const pDay = validation.parsedDate.getDate();

  if (bYear !== pYear || bMonth !== pMonth || bDay !== pDay) {
    return {
      isConsistent: false,
      reason: "Tanggal lahir pada NIK tidak cocok dengan tanggal lahir yang diinput",
    };
  }

  return { isConsistent: true };
}
