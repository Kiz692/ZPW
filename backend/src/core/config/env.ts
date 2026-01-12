import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
  skipAuth: process.env.SKIP_AUTH === 'true' || process.env.SKIP_AUTH === '1',
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (env.nodeEnv !== 'development' && env.nodeEnv !== 'test' && env.skipAuth) {
  throw new Error('SKIP_AUTH is only allowed when NODE_ENV=development or test');
}
