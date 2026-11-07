import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createNoteSchema } from '@app/shared';
import type { NotesRepo } from '../lib/db.js';

/** MCP server exposing the notes resource as tools. Same repo the REST API uses. */
export function createMcpServer(notes: NotesRepo): McpServer {
  const server = new McpServer({ name: 'fullstack-starter', version: '0.1.0' });

  server.registerTool('list_notes', { description: 'List the most recent notes.' }, async () => ({
    content: [{ type: 'text', text: JSON.stringify(await notes.list(), null, 2) }],
  }));

  server.registerTool(
    'create_note',
    {
      description: 'Create a note with a title and optional body.',
      inputSchema: createNoteSchema.shape,
    },
    async (input) => {
      const note = await notes.create(input);
      return { content: [{ type: 'text', text: JSON.stringify(note, null, 2) }] };
    },
  );

  return server;
}
