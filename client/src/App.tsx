import { useEffect, useState, type FormEvent } from 'react';
import type { Note } from '@app/shared';
import { api } from './api.js';

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    api.listNotes().then(setNotes, (err: Error) => setError(err.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      const note = await api.createNote({ title });
      setNotes((prev) => [note, ...prev]);
      setTitle('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDelete(id: number) {
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <main>
      <h1>Notes</h1>
      <form onSubmit={onSubmit}>
        <input
          aria-label="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New note"
        />
        <button type="submit">Add</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.title}
            <button onClick={() => void onDelete(note.id)} aria-label={`Delete ${note.title}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
