import { resolve } from 'node:path';
import { runner } from 'node-pg-migrate';
import { loadEnv } from '@app/config';

// Usage: migrate.ts [up|down]. "down" rolls back the latest migration only.
const direction = process.argv[2] === 'down' ? 'down' : 'up';
const { DATABASE_URL } = loadEnv();

await runner({
  databaseUrl: DATABASE_URL,
  dir: resolve(import.meta.dirname, '../migrations'),
  migrationsTable: 'pgmigrations',
  direction,
  count: direction === 'down' ? 1 : Infinity,
  checkOrder: true,
});
