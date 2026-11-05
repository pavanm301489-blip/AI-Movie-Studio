const makeId = (prefix) => globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const SHOT_TYPES = ['Establishing shot', 'Wide shot', 'Medium shot', 'Close-up', 'Extreme close-up', 'Over-the-shoulder', 'Tracking shot', 'Aerial shot'];

export function createScene(index = 0) {
  return { id: makeId('scene'), number: index + 1, heading: '', interiorExterior: '', location: '', timeOfDay: '', characters: [], body: '', dialogue: '', camera: '', shotTypes: [], visualStyle: '', lighting: '', mood: '', imageRequirements: '', videoRequirements: '', audioRequirements: '', estimatedSeconds: 30, status: 'planned' };
}

export function createStoryboardFrame(scene, index = 0) {
  return { id: makeId('frame'), sceneId: scene.id, number: index + 1, description: '', cameraAngle: '', cameraMovement: '', subjectPosition: '', environment: scene.location || '', lighting: scene.lighting || '', characterIds: [...(scene.characters || [])], imagePrompt: '', estimatedSeconds: 5, imageAssetId: null, status: 'planned' };
}

export function reorderItems(items, fromIndex, toIndex) {
  if (!Array.isArray(items)) throw new Error('Items must be an array.');
  if (![fromIndex, toIndex].every(Number.isInteger) || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    throw new Error('Move position is outside the list.');
  }
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export function duplicateScene(scene, index = 0) {
  if (!scene || typeof scene !== 'object') throw new Error('A scene is required.');
  return { ...scene, id: makeId('scene'), number: index + 1, characters: [...(scene.characters || [])], status: 'planned' };
}

export function parseSubtitles(input, format = 'srt') {
  const text = String(input || '').replace(/^\uFEFF/, '').trim();
  if (!text) return [];
  if (format.toLowerCase() === 'vtt') {
    const content = text.replace(/^WEBVTT[^\n]*\n/i, '').trim();
    return content.split(/\n\s*\n/).map((block) => parseCue(block, true)).filter(Boolean);
  }
  return text.split(/\n\s*\n/).map((block) => parseCue(block, false)).filter(Boolean);
}

function parseCue(block, allowIdentifier) {
  const lines = block.split(/\r?\n/).map((line) => line.trimEnd());
  let timingIndex = lines.findIndex((line) => line.includes('-->'));
  if (timingIndex < 0 || (timingIndex > 0 && !allowIdentifier && !/^\d+$/.test(lines[0].trim()))) return null;
  const timing = lines[timingIndex].match(/^(\S+)\s+-->\s+(\S+)/);
  if (!timing) return null;
  const start = toSeconds(timing[1]); const end = toSeconds(timing[2]);
  if (start === null || end === null || end < start) return null;
  const content = lines.slice(timingIndex + 1).join('\n').trim();
  if (!content) return null;
  return { id: makeId('subtitle'), start, end, text: content };
}

function toSeconds(time) {
  const match = String(time).match(/^(?:(\d{2,}):)?([0-5]?\d):([0-5]?\d)[,.](\d{1,3})$/);
  if (!match) return null;
  const hours = Number(match[1] || 0); const minutes = Number(match[2]); const seconds = Number(match[3]);
  const millis = Number(match[4].padEnd(3, '0'));
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

function stamp(seconds, decimal = ',') {
  const safe = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safe / 3600); const m = Math.floor((safe % 3600) / 60); const s = Math.floor(safe % 60);
  const ms = Math.round((safe - Math.floor(safe)) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${decimal}${String(ms).padStart(3, '0')}`;
}

export function exportSubtitles(cues, format = 'srt') {
  if (!Array.isArray(cues)) throw new Error('Subtitle cues must be an array.');
  const vtt = format.toLowerCase() === 'vtt';
  const blocks = cues.map((cue, index) => {
    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.end < cue.start) throw new Error(`Subtitle cue ${index + 1} has invalid timing.`);
    const timing = `${stamp(cue.start, vtt ? '.' : ',')} --> ${stamp(cue.end, vtt ? '.' : ',')}`;
    return `${vtt ? '' : `${index + 1}\n`}${timing}\n${String(cue.text || '').trim()}`;
  });
  return `${vtt ? 'WEBVTT\n\n' : ''}${blocks.join('\n\n')}${blocks.length ? '\n' : ''}`;
}

export function makeProjectBackup(project) {
  return JSON.stringify({ format: 'ai-movie-studio-project', version: 2, exportedAt: new Date().toISOString(), project }, null, 2);
}

export function validateAssetFile(file, maxBytes = 250 * 1024 * 1024) {
  if (!file || typeof file.name !== 'string' || !Number.isFinite(file.size)) throw new Error('Choose a valid file.');
  if (file.size <= 0) throw new Error('The selected file is empty.');
  if (file.size > maxBytes) throw new Error(`File exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB per-file limit.`);
  if (!/^(image|video|audio)\//i.test(file.type || '')) throw new Error('Only image, video, and audio files are supported.');
  return true;
}
