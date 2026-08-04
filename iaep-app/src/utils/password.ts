import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;

/**
 * Secure password hashing (scrypt) — SEC-04 Phase 2.
 *
 * Plaintext passwords are never stored. Stored values use the format:
 *   scrypt$<saltHex>$<hashHex>
 * where <saltHex> is a random 16-byte salt and <hashHex> is a 64-byte scrypt digest.
 */
export function hashPassword(plaintext: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plaintext, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/**
 * Verify a plaintext password against a stored credential.
 *
 * - If the stored value is a scrypt hash, it is verified with constant-time comparison.
 * - Otherwise (legacy placeholder, e.g. an in-memory super-admin env credential that is
 *   never persisted to disk), it falls back to a constant-time comparison so existing
 *   authentication compatibility is preserved.
 */
export function verifyPassword(plaintext: string, stored: string): boolean {
  if (!stored) return false;

  if (stored.startsWith("scrypt$")) {
    const [, salt, hash] = stored.split("$");
    if (!salt || !hash) return false;
    try {
      const derived = scryptSync(plaintext, salt, SCRYPT_KEYLEN);
      const expected = Buffer.from(hash, "hex");
      return derived.length === expected.length && timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  // Legacy constant-time comparison (used only for non-hashed in-memory credentials).
  const a = Buffer.from(plaintext);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}
