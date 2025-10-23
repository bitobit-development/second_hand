import { hash, compare } from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 number
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
