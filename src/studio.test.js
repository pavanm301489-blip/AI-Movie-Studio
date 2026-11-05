import { describe, expect, it, vi } from 'vitest';
import { createScene, exportProject, requestGeneration, saveConfiguredEndpoint } from './studio.js';

describe('studio helpers', () => {
  it('creates an editable numbered scene record', () => {
    expect(createScene(2)).toMatchObject({ heading: '', body: '' });
    expect(createScene(2).id).toBeTruthy();
  });
  it('exports project data as a versioned backup', () => {
    const parsed = JSON.parse(exportProject({ id: 'p1', title: 'Test' }));
    expect(parsed.format).toBe('ai-movie-studio-project');
    expect(parsed.project.title).toBe('Test');
  });
  it('rejects insecure remote endpoints', () => {
    expect(() => saveConfiguredEndpoint('http://example.com/api')).toThrow(/HTTPS/);
  });
  it('sends a request to the configured endpoint and returns provider output', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ status: 'accepted' }) });
    await expect(requestGeneration('https://studio.example/api', { task: 'story-draft' }, fetch)).resolves.toEqual({ status: 'accepted' });
    expect(fetch).toHaveBeenCalledWith('https://studio.example/api', expect.objectContaining({ method: 'POST' }));
  });
  it('reports provider HTTP errors without treating them as success', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(requestGeneration('https://studio.example/api', {}, fetch)).rejects.toThrow('HTTP 503');
  });
});
