import { FastifyInstance } from 'fastify';

export function setupErrorHandling(app: FastifyInstance) {
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Rota não encontrada' });
  });

  app.setErrorHandler((err, _req, reply) => {
    const status = err.statusCode ?? 500;
    const payload = {
      message: err.message || 'Erro interno do servidor'
    } as Record<string, unknown>;

    if (process.env.NODE_ENV !== 'production') {
      payload.stack = err.stack;
    }

    reply.code(status).send(payload);
  });
}

