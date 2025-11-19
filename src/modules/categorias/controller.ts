import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { categoriasRepo } from './repo';
import { musicaRepo } from '../musicas/repo';
import { getPagination } from '../../utils/pagination';

export async function categoriasRoutes(app: FastifyInstance) {
  app.get('/categorias', { schema: { tags: ['Categorias'], summary: 'Listar categorias', response: { 200: { type: 'array', items: { $ref: 'CategoriaItem#' } } } } }, async (_req, reply) => {
    const items = await categoriasRepo.listAll();
    return reply.send(items);
  });

  app.get(
    '/categorias/:id/musicas',
    { preHandler: [validate(z.object({ params: z.object({ id: z.coerce.number().int().positive() }), query: z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional() }) }))], schema: { tags: ['Categorias'], summary: 'Músicas por categoria', params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] }, querystring: { type: 'object', properties: { page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 } } }, response: { 200: { $ref: 'PaginatedMusicas#' } } } },
    async (req, reply) => {
      const { id } = (req as any).validated.params as { id: number };
      const q = (req as any).validated.query as { page?: number; limit?: number };
      const { limit, offset, page } = getPagination(q.page, q.limit);
      const items = await musicaRepo.listByCategory(id, limit, offset);
      return reply.send({ page, limit, items });
    }
  );
}
