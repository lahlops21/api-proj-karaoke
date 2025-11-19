import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { adminRepo } from './repo';
import { createResetToken, useResetToken } from './tokenStore';

export async function login(email: string, senha: string) {
  const admin = await adminRepo.findByEmail(email);
  if (!admin) return null;
  const ok = await bcrypt.compare(senha, admin.senha_administrador);
  if (!ok) return null;

  const token = jwt.sign(
    { sub: admin.id_administrador, email: admin.email_administrador, name: admin.nome_administrador },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
  return { token, expiresIn: env.JWT_EXPIRES_IN };
}

export async function forgotPassword(email: string) {
  const admin = await adminRepo.findByEmail(email);
  if (!admin) return; // 204 mesmo se não existir
  const token = createResetToken(admin.id_administrador, admin.email_administrador);
  // Aqui enviaríamos email com link contendo o token.
  // Por ora, apenas logamos para referência de dev.
  // eslint-disable-next-line no-console
  console.log('Token de reset gerado (dev):', token);
}

export async function resetPassword(token: string, novaSenha: string) {
  const info = useResetToken(token);
  if (!info) return false;
  const hash = await bcrypt.hash(novaSenha, 10);
  await adminRepo.updatePassword(info.adminId, hash);
  return true;
}

export async function createAdmin(
  requesterId: number,
  data: { nome: string; email: string; senha: string; endereco?: string | null }
) {
  // Em um sistema real, validaríamos se requesterId tem permissão.
  const hash = await bcrypt.hash(data.senha, 10);
  const id = await adminRepo.create({ nome: data.nome, email: data.email, senhaHash: hash, endereco: data.endereco });
  return id;
}

