import { describe, expect, it } from 'vitest';
import { createScene, createStoryboardFrame, duplicateScene, exportSubtitles, parseSubtitles, reorderItems, validateAssetFile } from './production.js';
import { migrateProject, validateProjectImport } from './storage.js';

describe('production data helpers', () => {
  it('creates scene breakdown and storyboard records with linked locations', () => {
    const scene = { ...createScene(0), location: 'Observatory', lighting: 'Blue hour' };
    expect(scene.number).toBe(1);
    expect(createStoryboardFrame(scene, 1)).toMatchObject({ sceneId: scene.id, number: 2, environment: 'Observatory', lighting: 'Blue hour' });
  });
  it('duplicates a scene with a new identity and independent character list', () => {
    const scene = { ...createScene(), characters: ['a'] };
    const copy = duplicateScene(scene, 1);
    copy.characters.push('b');
    expect(copy.id).not.toBe(scene.id);
    expect(copy.number).toBe(2);
    expect(scene.characters).toEqual(['a']);
  });
  it('reorders, and rejects invalid reorder requests', () => {
    expect(reorderItems(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(() => reorderItems(['a'], 0, 2)).toThrow(/outside/);
  });
  it('round-trips SRT subtitles and imports VTT', () => {
    const cues = [{ start: 1.25, end: 3.5, text: 'Hello, world.' }];
    const srt = exportSubtitles(cues);
    expect(parseSubtitles(srt)).toMatchObject([{ start: 1.25, end: 3.5, text: 'Hello, world.' }]);
    expect(parseSubtitles('WEBVTT\n\n00:00:01.000 --> 00:00:02.500\nHi', 'vtt')).toMatchObject([{ start: 1, end: 2.5, text: 'Hi' }]);
  });
  it('rejects malformed or invalid subtitle timings', () => {
    expect(parseSubtitles('not a cue')).toEqual([]);
    expect(() => exportSubtitles([{ start: 5, end: 2, text: 'bad' }])).toThrow(/invalid timing/);
  });
  it('validates media file type, size and empty files', () => {
    expect(validateAssetFile({ name: 'still.png', size: 10, type: 'image/png' })).toBe(true);
    expect(() => validateAssetFile({ name: 'script.exe', size: 10, type: 'application/x-msdownload' })).toThrow(/Only image/);
    expect(() => validateAssetFile({ name: 'big.mp4', size: 20, type: 'video/mp4' }, 10)).toThrow(/limit/);
  });
});

describe('versioned project data', () => {
  it('migrates older projects without losing existing content', () => {
    expect(migrateProject({ id: 'legacy', title: 'Old', idea: 'Story' })).toMatchObject({ schemaVersion: 2, idea: 'Story', scenes: [], storyboards: [], timeline: [] });
  });
  it('validates backup imports and assigns a new project ID', () => {
    const imported = validateProjectImport(JSON.stringify({ format: 'ai-movie-studio-project', version: 1, project: { id: 'original', title: 'Backup' } }));
    expect(imported.title).toBe('Backup');
    expect(imported.id).not.toBe('original');
    expect(() => validateProjectImport('{broken')).toThrow(/valid JSON/);
  });
});
