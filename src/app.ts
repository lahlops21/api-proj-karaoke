import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { setupSwagger } from './config/swagger';
import { registerJsonSchemas } from './docs/registerSchemas';
import { pingDatabase, pool } from './db/pool';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './modules/auth/controller';
import { musicasRoutes } from './modules/musicas/controller';
import { categoriasRoutes } from './modules/categorias/controller';
import { eventsRoutes } from './modules/events/controller';
import { setupErrorHandling } from './middlewares/error';

async function buildApp() {
  const app = Fastify({ logger: true });

  // Segurança e CORS
  await app.register(cors, corsOptions);
  await app.register(helmet, { global: true });

  // Registrar JSON Schemas para validação ($ref por $id)
  await registerJsonSchemas(app);

  // Swagger
  await setupSwagger(app);

  // Healthcheck
  app.get('/health', async () => {
    const dbUp = await pingDatabase();
    return {
      name: 'SingJam!',
      status: 'ok',
      db: dbUp ? 'up' : 'down',
      time: new Date().toISOString()
    };
  });

  // Tratadores de erro/not found
  setupErrorHandling(app);

  // Rate limit básico para rotas públicas sensíveis
  await app.register(rateLimit, {
    global: false
  });

  // Rotas
  await authRoutes(app);
  await musicasRoutes(app);
  await categoriasRoutes(app);
  await eventsRoutes(app);

  return app;
}

async function start() {
  const app = await buildApp();
  const port = env.PORT;
  const host = '0.0.0.0';

  const close = async () => {
    app.log.info('Encerrando servidor...');
    try {
      await app.close();
      await pool.end();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  try {
    await app.listen({ port, host });
    app.log.info(`SingJam! em http://localhost:${port}`);
    app.log.info(`Docs em http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Início
start();
