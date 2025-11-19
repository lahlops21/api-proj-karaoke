import { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env';

const allowedOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim());

export const corsOptions: FastifyCorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    try {
      const url = new URL(origin);
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isAllowed = isLocalhost || allowedOrigins.includes(`${url.protocol}//${url.hostname}`);
      cb(null, isAllowed);
    } catch {
      cb(null, false);
    }
  },
  credentials: true
};

