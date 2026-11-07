import { Router } from 'express';
import { createNoteSchema } from '@app/shared';
import type { NotesRepo } from '../lib/db.js';

const parseId = (raw: string): number | undefined => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

export function notesRouter(notes: NotesRepo): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await notes.list());
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const note = id ? await notes.get(id) : undefined;
    if (!note) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(note);
  });

  router.post('/', async (req, res) => {
    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid note', issues: parsed.error.issues });
      return;
    }
    res.status(201).json(await notes.create(parsed.data));
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    const removed = id ? await notes.remove(id) : false;
    res.status(removed ? 204 : 404).end();
  });

  return router;
}
