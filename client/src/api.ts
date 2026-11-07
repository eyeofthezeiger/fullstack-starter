import type { CreateNoteInput, Note } from '@app/shared';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  listNotes: () => request<Note[]>('/api/notes'),
  createNote: (input: CreateNoteInput) =>
    request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(input) }),
  deleteNote: (id: number) => request<undefined>(`/api/notes/${id}`, { method: 'DELETE' }),
};
