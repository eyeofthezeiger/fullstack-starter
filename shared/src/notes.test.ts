import { describe, expect, it } from 'vitest';
import { createNoteSchema } from './notes.js';

describe('createNoteSchema', () => {
  it('trims the title and defaults the body', () => {
    expect(createNoteSchema.parse({ title: '  hi  ' })).toEqual({ title: 'hi', body: '' });
  });

  it('rejects an empty title', () => {
    expect(createNoteSchema.safeParse({ title: '   ' }).success).toBe(false);
  });
});
