import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: number; // id_administrador
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function authGuard(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Token ausente' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as any).user = payload;
  } catch {
    return reply.code(401).send({ message: 'Token inválido' });
  }
}

