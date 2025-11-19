import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validate } from '../../middlewares/validate';
import { authGuard } from '../../middlewares/auth';
import { musicaRepo } from './repo';
import { createMusica, getMusicaDetalhe, updateMusica } from './service';
import { getPagination, parseSort } from '../../utils/pagination';

export async function musicasRoutes(app: FastifyInstance) {
  // Admin - criar música
  app.post(
    '/admin/musicas',
    {
      preHandler: [authGuard, validate(z.object({
        body: z.object({
          titulo: z.string().min(1),
          codigo_musica: z.string().min(1),
          letra_musica: z.string().optional(),
          interprete_musica: z.string().optional(),
          artistaIds: z.array(z.number().int().positive()).optional(),
          categoriaIds: z.array(z.number().int().positive()).optional()
        })
      }))],
      schema: {
        tags: ['Admin - Musicas'],
        summary: 'Cadastrar música',
        security: [{ bearerAuth: [] }],
        body: { $ref: 'CreateMusicaRequest#' },
        response: { 201: { $ref: 'IdResponse#' }, 401: { $ref: 'ErrorResponse#' } }
      }
    },
    async (req, reply) => {
      const body = (req as any).validated.body as any;
      const id = await createMusica(body);
      return reply.code(201).send({ id });
    }
  );

  // Admin - atualizar música
  app.put(
    '/admin/musicas/:id',
    {
      preHandler: [authGuard, validate(z.object({
        params: z.object({ id: z.coerce.number().int().positive() }),
        body: z.object({
          titulo: z.string().optional(),
          codigo_musica: z.string().optional(),
          letra_musica: z.string().optional().nullable(),
          interprete_musica: z.string().optional().nullable(),
          artistaIds: z.array(z.number().int().positive()).optional(),
          categoriaIds: z.array(z.number().int().positive()).optional()
        })
      }))],
      schema: { tags: ['Admin - Musicas'], summary: 'Atualizar música', security: [{ bearerAuth: [] }], body: { $ref: 'UpdateMusicaRequest#' }, response: { 200: { type: 'object', properties: { updated: { type: 'boolean' } }, required: ['updated'], description: 'Atualizada' }, 401: { $ref: 'ErrorResponse#' } } }
    },
    async (req, reply) => {
      const { id } = (req as any).validated.params as { id: number };
      const body = (req as any).validated.body as any;
      await updateMusica(id, body);
      return reply.send({ updated: true });
    }
  );

  // Admin - remover música
  app.delete(
    '/admin/musicas/:id',
    { preHandler: [authGuard, validate(z.object({ params: z.object({ id: z.coerce.number().int().positive() }) }))], schema: { tags: ['Admin - Musicas'], summary: 'Remover música', security: [{ bearerAuth: [] }], response: { 204: { type: 'null', description: 'Removida' }, 401: { $ref: 'ErrorResponse#' } } } },
    async (req, reply) => {
      const { id } = (req as any).validated.params as { id: number };
      await musicaRepo.remove(id);
      return reply.code(204).send();
    }
  );

  // Admin - listar músicas
  app.get(
    '/admin/musicas',
    {
      preHandler: [authGuard, validate(z.object({
        query: z.object({ page: z.coerce.number().optional(), limit: z.coerce.number().optional(), sort: z.string().optional(), order: z.string().optional() })
      }))],
      schema: { tags: ['Admin - Musicas'], summary: 'Listar músicas (admin)', security: [{ bearerAuth: [] }], response: { 200: { $ref: 'PaginatedMusicas#' }, 401: { $ref: 'ErrorResponse#' } } }
    },
    async (req, reply) => {
      const q = (req as any).validated.query as any;
      const { limit, offset, page } = getPagination(q.page, q.limit);
      const sortSql = parseSort(q.sort, ['titulo', 'codigo_musica'], q.order);
      const rows = await musicaRepo.listAdmin({ limit, offset, sortSql });
      return reply.send({ page, limit, items: rows });
    }
  );

  // Público - busca por título
  app.get(
    '/musicas/search',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      preHandler: [
        validate(
          z.object({
            query: z.object({
              titulo: z.string().optional(),
              artista: z.string().optional(),
              letra: z.string().optional(),
              page: z.coerce.number().optional(),
              limit: z.coerce.number().optional()
            })
          })
        )
      ],
      schema: {
        tags: ['Musicas'],
        summary: 'Buscar músicas por título, artista ou letra',
        querystring: {
          type: 'object',
          properties: {
            titulo: { type: 'string' },
            artista: { type: 'string' },
            letra: { type: 'string' },
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 }
          }
        },
        response: { 200: { type: 'array', items: { $ref: 'MusicaBasic#' } }, 400: { $ref: 'ErrorResponse#' } }
      }
    },
    async (req, reply) => {
      const q = (req as any).validated.query as { titulo?: string; artista?: string; letra?: string; page?: number; limit?: number };
      const { limit, offset } = getPagination(q.page, q.limit);
      if (q.titulo) return reply.send(await musicaRepo.searchByTitle(q.titulo, limit, offset));
      if (q.artista) return reply.send(await musicaRepo.searchByArtist(q.artista, limit, offset));
      if (q.letra) return reply.send(await musicaRepo.searchByLyric(q.letra, limit, offset));
      return reply.code(400).send({ message: 'Informe ao menos um dos parâmetros: titulo, artista ou letra' });
    }
  );

  // Público - detalhe
  app.get(
    '/musicas/:id',
    { preHandler: [validate(z.object({ params: z.object({ id: z.coerce.number().int().positive() }) }))], schema: { tags: ['Musicas'], summary: 'Detalhe da música', params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] }, response: { 200: { $ref: 'MusicaDetalhe#' }, 404: { $ref: 'ErrorResponse#' } } } },
    async (req, reply) => {
      const { id } = (req as any).validated.params as { id: number };
      const det = await getMusicaDetalhe(id);
      if (!det) return reply.code(404).send({ message: 'Música não encontrada' });
      // Opcional: retornar letra parcial
      if (det.letra && det.letra.length > 500) det.letra = det.letra.slice(0, 500);
      return reply.send(det);
    }
  );
}
