import { ZodSchema } from 'zod';
import { FastifyReply, FastifyRequest } from 'fastify';

export function validate(schema: ZodSchema<any>) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const data = {
      body: (req as any).body,
      query: (req as any).query,
      params: (req as any).params,
      headers: req.headers
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Erro de validação', issues: parsed.error.errors });
    }
    (req as any).validated = parsed.data;
  };
}

