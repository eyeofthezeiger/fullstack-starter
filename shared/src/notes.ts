import { z } from 'zod';

/** One schema, used by the API to validate and by the client for types. */
export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(10_000).default(''),
});

export const noteSchema = createNoteSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.string(),
});

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type Note = z.infer<typeof noteSchema>;
