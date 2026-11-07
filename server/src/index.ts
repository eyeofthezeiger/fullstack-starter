import { createClient, type RedisClientType } from 'redis';
import { loadEnv } from '@app/config';
import { createApp } from './app.js';
import { createPool, pgNotesRepo } from './lib/db.js';
import { redisHitCounter } from './lib/rate-limit.js';

const env = loadEnv();

const pool = createPool(env.DATABASE_URL);
const redis: RedisClientType = createClient({ url: env.REDIS_URL });
redis.on('error', (err: Error) => console.warn('redis:', err.message));
await redis.connect().catch((err: Error) => console.warn('redis connect failed:', err.message));

const app = createApp({
  notes: pgNotesRepo(pool),
  counter: redisHitCounter(redis),
  health: { db: () => pool.query('SELECT 1'), redis: () => redis.ping() },
  corsOrigin: env.CORS_ORIGIN,
  rateLimitPerMinute: env.RATE_LIMIT_PER_MINUTE,
});

const server = app.listen(env.PORT, () => {
  console.log(`API on http://localhost:${env.PORT} (MCP at /mcp)`);
});

const shutdown = () => {
  server.close(() => {
    void Promise.allSettled([pool.end(), redis.quit()]).then(() => process.exit(0));
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
