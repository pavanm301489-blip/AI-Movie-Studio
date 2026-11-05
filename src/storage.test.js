import { describe, expect, it } from 'vitest';
import { makeProject } from './storage.js';

describe('makeProject', () => {
  it('trims and stores project details with defaults', () => {
    const project = makeProject({ title: '  Moonlight  ', idea: 'A quiet journey' });
    expect(project.title).toBe('Moonlight');
    expect(project.idea).toBe('A quiet journey');
    expect(project.genre).toBe('Science fiction');
    expect(project.format).toBe('Short film');
    expect(project.status).toBe('In development');
    expect(project.id).toBeTruthy();
  });

  it('rejects an empty title', () => {
    expect(() => makeProject({ title: '   ' })).toThrow('Give your project a title.');
  });

  it('limits user-provided title and idea lengths', () => {
    const project = makeProject({ title: 'x'.repeat(120), idea: 'y'.repeat(6000) });
    expect(project.title).toHaveLength(100);
    expect(project.idea).toHaveLength(5000);
  });
});
