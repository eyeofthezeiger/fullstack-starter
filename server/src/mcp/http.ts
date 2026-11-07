import { Router } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { NotesRepo } from '../lib/db.js';
import { createMcpServer } from './server.js';

/**
 * Streamable HTTP endpoint at POST /mcp, stateless: a fresh server per request.
 * Add auth in front of this before exposing it publicly.
 */
export function mcpRouter(notes: NotesRepo): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const server = createMcpServer(notes);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // Stateless mode has no sessions, so GET (SSE stream) and DELETE are not supported.
  router.all('/', (_req, res) => {
    res.status(405).json({ error: 'Method not allowed' });
  });

  return router;
}
