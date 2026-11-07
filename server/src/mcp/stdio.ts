import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadEnv } from '@app/config';
import { createPool, pgNotesRepo } from '../lib/db.js';
import { createMcpServer } from './server.js';

// stdout carries the MCP protocol, so log to stderr only.
const env = loadEnv();
const pool = createPool(env.DATABASE_URL);
const server = createMcpServer(pgNotesRepo(pool));
await server.connect(new StdioServerTransport());
console.error('MCP server ready on stdio');
