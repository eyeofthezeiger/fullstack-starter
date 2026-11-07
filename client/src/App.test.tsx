import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';

describe('App', () => {
  it('renders the heading and form', () => {
    const html = renderToString(<App />);
    expect(html).toContain('<h1>Notes</h1>');
    expect(html).toContain('New note');
  });
});
