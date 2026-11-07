import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { ErrorRequestHandler } from 'express';
import type { NotesRepo } from './lib/db.js';
import { rateLimit, type HitCounter } from './lib/rate-limit.js';
import { mcpRouter } from './mcp/http.js';
import { healthRouter, type HealthChecks } from './routes/health.js';
import { notesRouter } from './routes/notes.js';

export interface AppDeps {
  notes: NotesRepo;
  counter: HitCounter;
  health: HealthChecks;
  corsOrigin: string;
  rateLimitPerMinute: number;
}

/** Builds the Express app from its dependencies, so tests can pass fakes. */
export function createApp(deps: AppDeps): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));

  app.use(healthRouter(deps.health));
  app.use('/api', rateLimit(deps.counter, deps.rateLimitPerMinute));
  app.use('/api/notes', notesRouter(deps.notes));
  app.use('/mcp', mcpRouter(deps.notes));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  const onError: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  };
  app.use(onError);
  return app;
}
