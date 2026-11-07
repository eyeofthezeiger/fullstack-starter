import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { Note } from '@app/shared';
import { createApp } from '../src/app.js';
import type { NotesRepo } from '../src/lib/db.js';
import type { HitCounter } from '../src/lib/rate-limit.js';

function memoryNotes(): NotesRepo {
  const rows: Note[] = [];
  return {
    list: () => Promise.resolve([...rows].reverse()),
    get: (id) => Promise.resolve(rows.find((n) => n.id === id)),
    create: ({ title, body = '' }) => {
      const note = { id: rows.length + 1, title, body, createdAt: new Date().toISOString() };
      rows.push(note);
      return Promise.resolve(note);
    },
    remove: (id) => {
      const index = rows.findIndex((n) => n.id === id);
      if (index >= 0) rows.splice(index, 1);
      return Promise.resolve(index >= 0);
    },
  };
}

function memoryCounter(): HitCounter {
  const hits = new Map<string, number>();
  return {
    hit: (key) => {
      hits.set(key, (hits.get(key) ?? 0) + 1);
      return Promise.resolve(hits.get(key)!);
    },
  };
}

const makeApp = (rateLimitPerMinute = 100) =>
  createApp({
    notes: memoryNotes(),
    counter: memoryCounter(),
    health: { db: () => Promise.resolve(), redis: () => Promise.reject(new Error('down')) },
    corsOrigin: '*',
    rateLimitPerMinute,
  });

describe('API', () => {
  it('GET /health is ok', async () => {
    const res = await request(makeApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /ready reports a down dependency', async () => {
    const res = await request(makeApp()).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ db: 'ok', redis: 'down' });
  });

  it('creates and lists notes', async () => {
    const app = makeApp();
    const created = await request(app).post('/api/notes').send({ title: 'First' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ id: 1, title: 'First', body: '' });

    const list = await request(app).get('/api/notes');
    expect(list.body).toHaveLength(1);
  });

  it('rejects an invalid note', async () => {
    const res = await request(makeApp()).post('/api/notes').send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('rate limits /api', async () => {
    const app = makeApp(1);
    expect((await request(app).get('/api/notes')).status).toBe(200);
    expect((await request(app).get('/api/notes')).status).toBe(429);
  });
});
