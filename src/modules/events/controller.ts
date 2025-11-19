import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { eventsRepo } from './repo';

export async function eventsRoutes(app: FastifyInstance) {
  app.post(
    '/events/search',
    { config: { rateLimit: { max: 120, timeWindow: '1 minute' } }, preHandler: [validate(z.object({ body: z.object({ termo: z.string().min(1), resultadoEncontrado: z.boolean(), musicaId: z.number().int().positive().optional() }) }))], schema: { tags: ['Eventos'], summary: 'Registrar busca', body: { $ref: 'EventSearchRequest#' }, response: { 204: { type: 'null', description: 'Registrado' } } } },
    async (req, reply) => {
      const body = (req as any).validated.body as { termo: string; resultadoEncontrado: boolean; musicaId?: number };
      await eventsRepo.insertSearch(body.termo, body.resultadoEncontrado, body.musicaId);
      return reply.code(204).send();
    }
  );

  app.post(
    '/events/category-click',
    { config: { rateLimit: { max: 120, timeWindow: '1 minute' } }, preHandler: [validate(z.object({ body: z.object({ categoriaId: z.number().int().positive() }) }))], schema: { tags: ['Eventos'], summary: 'Registrar clique em categoria', body: { $ref: 'EventCategoryClickRequest#' }, response: { 204: { type: 'null', description: 'Registrado' } } } },
    async (req, reply) => {
      const body = (req as any).validated.body as { categoriaId: number };
      await eventsRepo.insertCategoryClick(body.categoriaId);
      return reply.code(204).send();
    }
  );

  app.get(
    '/musicas/populares',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } }, schema: { tags: ['Musicas'], summary: 'Músicas populares por histórico', querystring: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50 } } }, response: { 200: { type: 'array', items: { type: 'object', properties: { id_musica: { type: 'integer' }, score: { type: 'integer' } }, required: ['id_musica', 'score'] } } } } },
    async (req, reply) => {
      const limit = Number((req.query as any)?.limit ?? 10);
      const lim = isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 50);
      const items = await eventsRepo.populares(lim);
      return reply.send(items);
    }
  );
}
