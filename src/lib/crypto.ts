import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.NIK_ENCRYPTION_KEY;
  if (!keyBase64) {
    // Fallback key for development if not set
    return Buffer.from("01234567890123456789012345678901", "utf-8");
  }
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) {
    throw new Error("NIK_ENCRYPTION_KEY must be exactly 32 bytes (256 bits)");
  }
  return key;
}

function getPepper(): string {
  return process.env.NIK_HASH_PEPPER || "spg-default-pepper-secret-2026";
}

/**
 * Encrypt NIK with AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encryptNik(nik: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(nik, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypt NIK with AES-256-GCM.
 */
export function decryptNik(encryptedPayload: string): string {
  const combined = Buffer.from(encryptedPayload, "base64");

  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload length");
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const cipherText = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(cipherText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Hash NIK using HMAC-SHA256 with pepper.
 * Allows uniqueness checking (1 NIK = 1 account) without decrypting.
 */
export function hashNik(nik: string): string {
  const pepper = getPepper();
  return crypto.createHmac("sha256", pepper).update(nik.trim()).digest("hex");
}
