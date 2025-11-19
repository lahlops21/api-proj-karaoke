import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASS: z.string().default(''),
  DB_NAME: z.string().default('singjam'),
  JWT_SECRET: z.string().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.coerce.number().int().positive().default(1800),
  CORS_ORIGINS: z.string().default('http://localhost,http://127.0.0.1'),
  RESET_TOKEN_TTL: z.coerce.number().int().positive().default(3600)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Erro de validação das variáveis de ambiente:', parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;

