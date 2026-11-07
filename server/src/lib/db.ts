import pg from 'pg';
import type { CreateNoteInput, Note } from '@app/shared';

export function createPool(databaseUrl: string): pg.Pool {
  return new pg.Pool({ connectionString: databaseUrl, max: 10 });
}

/** Data access for notes. Routes and MCP tools depend on this interface, not on pg. */
export interface NotesRepo {
  list(): Promise<Note[]>;
  get(id: number): Promise<Note | undefined>;
  create(input: CreateNoteInput): Promise<Note>;
  remove(id: number): Promise<boolean>;
}

interface NoteRow {
  id: number;
  title: string;
  body: string;
  created_at: Date;
}

const toNote = (row: NoteRow): Note => ({
  id: row.id,
  title: row.title,
  body: row.body,
  createdAt: row.created_at.toISOString(),
});

export function pgNotesRepo(pool: pg.Pool): NotesRepo {
  return {
    async list() {
      const { rows } = await pool.query<NoteRow>('SELECT * FROM notes ORDER BY id DESC LIMIT 100');
      return rows.map(toNote);
    },
    async get(id) {
      const { rows } = await pool.query<NoteRow>('SELECT * FROM notes WHERE id = $1', [id]);
      return rows[0] ? toNote(rows[0]) : undefined;
    },
    async create({ title, body = '' }) {
      const { rows } = await pool.query<NoteRow>(
        'INSERT INTO notes (title, body) VALUES ($1, $2) RETURNING *',
        [title, body],
      );
      return toNote(rows[0]!);
    },
    async remove(id) {
      const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
      return (rowCount ?? 0) > 0;
    },
  };
}
