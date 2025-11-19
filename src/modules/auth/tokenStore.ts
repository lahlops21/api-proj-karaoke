import { env } from '../../config/env';

type ResetToken = { adminId: number; email: string; expiresAt: number };

const store = new Map<string, ResetToken>();

export function createResetToken(adminId: number, email: string) {
  const token = randomToken();
  const expiresAt = Date.now() + env.RESET_TOKEN_TTL * 1000;
  store.set(token, { adminId, email, expiresAt });
  return token;
}

export function useResetToken(token: string): ResetToken | null {
  const info = store.get(token);
  if (!info) return null;
  if (info.expiresAt < Date.now()) {
    store.delete(token);
    return null;
  }
  store.delete(token);
  return info;
}

function randomToken() {
  // Simples e suficiente para PoC; para produção use crypto aleatório forte
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

