import bcrypt from "bcrypt";
import { createHash } from "crypto";

const BCRYPT_ROUNDS = 12;

// MD5 hash function for legacy password verification (migration only)
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 * Supports both bcrypt (new) and MD5 (legacy) formats
 * Returns { valid: boolean, needsRehash: boolean }
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  const isBcryptHash = /^\$2[aby]\$/.test(hash);

  if (isBcryptHash) {
    const valid = await bcrypt.compare(password, hash);
    return { valid, needsRehash: false };
  }

  // Legacy MD5 hash (32 hex characters)
  const md5Hash = md5(password);
  const valid = hash === md5Hash;
  return { valid, needsRehash: valid }; // If valid MD5, needs rehash to bcrypt
}

/**
 * Check if password needs to be migrated from MD5 to bcrypt
 */
export function isMd5Hash(hash: string): boolean {
  // MD5 hashes are 32 hexadecimal characters
  return /^[a-f0-9]{32}$/i.test(hash);
}

/**
 * Validate password complexity
 * Returns error message if invalid, null if valid
 */
export function validatePasswordComplexity(password: string): string | null {
  if (password.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
  }

  // At least one number
  if (!/[0-9]/.test(password)) {
    return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
  }

  return null;
}

/**
 * Simple password validation (minimum length only)
 * For backward compatibility during migration
 */
export function validatePasswordMinLength(password: string, minLength: number = 6): string | null {
  if (!password || password.length < minLength) {
    return `รหัสผ่านต้องมีอย่างน้อย ${minLength} ตัวอักษร`;
  }
  return null;
}
