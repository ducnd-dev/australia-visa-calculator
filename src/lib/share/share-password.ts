import { hash, compare } from "bcryptjs";

const ROUNDS = 10;

export async function hashSharePassword(password: string): Promise<string> {
  return hash(password.trim(), ROUNDS);
}

export async function verifySharePassword(password: string, hashValue: string): Promise<boolean> {
  if (!password.trim() || !hashValue) return false;
  return compare(password.trim(), hashValue);
}

export function shareUnlockCookieName(token: string): string {
  return `share_unlock_${token}`;
}
