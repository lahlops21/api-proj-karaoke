import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { authGuard } from '../../middlewares/auth';
import { createAdmin, forgotPassword, login, resetPassword } from './service';

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/admin/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login do administrador',
        body: { $ref: 'AdminLoginRequest#' },
        response: {
          200: { $ref: 'AdminLoginResponse#' },
          401: { $ref: 'ErrorResponse#' }
        }
      },
      preHandler: validate(z.object({ body: z.object({ email: z.string().email(), senha: z.string().min(1) }) }))
    },
    async (req, reply) => {
      const { email, senha } = (req as any).validated.body as { email: string; senha: string };
      const res = await login(email, senha);
      if (!res) return reply.code(401).send({ message: 'Credenciais inválidas' });
      return reply.send(res);
    }
  );

  app.post(
    '/admin/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Solicitar reset de senha',
        body: { $ref: 'ForgotPasswordRequest#' },
        response: { 204: { type: 'null', description: 'Sem conteúdo' } }
      },
      preHandler: validate(z.object({ body: z.object({ email: z.string().email() }) }))
    },
    async (req, reply) => {
      const { email } = (req as any).validated.body as { email: string };
      await forgotPassword(email);
      return reply.code(204).send();
    }
  );

  app.post(
    '/admin/reset-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Resetar senha com token',
        body: { $ref: 'ResetPasswordRequest#' },
        response: { 204: { type: 'null', description: 'Senha atualizada' }, 400: { $ref: 'ErrorResponse#' } }
      },
      preHandler: validate(z.object({ body: z.object({ token: z.string().min(1), novaSenha: z.string().min(6) }) }))
    },
    async (req, reply) => {
      const { token, novaSenha } = (req as any).validated.body as { token: string; novaSenha: string };
      const ok = await resetPassword(token, novaSenha);
      if (!ok) return reply.code(400).send({ message: 'Token inválido ou expirado' });
      return reply.code(204).send();
    }
  );

  app.post(
    '/admin/logout',
    { schema: { tags: ['Auth'], summary: 'Logout', response: { 204: { type: 'null', description: 'Sem conteúdo' } } } },
    async (_req, reply) => reply.code(204).send()
  );

  app.post(
    '/admin',
    {
      preHandler: [authGuard, validate(z.object({ body: z.object({ name: z.string().min(1), email: z.string().email(), senha: z.string().min(6), endereco: z.string().optional() }) }))],
      schema: {
        tags: ['Auth'],
        summary: 'Criar administrador (protegido)',
        security: [{ bearerAuth: [] }],
        body: { $ref: 'CreateAdminRequest#' },
        response: { 201: { $ref: 'IdResponse#' }, 401: { $ref: 'ErrorResponse#' } }
      }
    },
    async (req, reply) => {
      const user = (req as any).user as { sub: number };
      const body = (req as any).validated.body as { name: string; email: string; senha: string; endereco?: string };
      const id = await createAdmin(user.sub, { nome: body.name, email: body.email, senha: body.senha, endereco: body.endereco ?? null });
      return reply.code(201).send({ id });
    }
  );
}
