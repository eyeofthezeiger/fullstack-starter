import { Router } from 'express';

export interface HealthChecks {
  db: () => Promise<unknown>;
  redis: () => Promise<unknown>;
}

const status = async (check: () => Promise<unknown>) => {
  try {
    await check();
    return 'ok';
  } catch {
    return 'down';
  }
};

export function healthRouter(checks: HealthChecks): Router {
  const router = Router();
  // Liveness: the process is up.
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  // Readiness: dependencies are reachable.
  router.get('/ready', async (_req, res) => {
    const [db, redis] = await Promise.all([status(checks.db), status(checks.redis)]);
    const ok = db === 'ok' && redis === 'ok';
    res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', db, redis });
  });
  return router;
}
