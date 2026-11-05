export const DB_NAME = 'ai-movie-studio';
export const DB_VERSION = 1;
export const PROJECTS_STORE = 'projects';
export const PROJECT_SCHEMA_VERSION = 2;

let databasePromise;

function openDatabase() {
  if (!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB is not available in this browser.'));
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { databasePromise = undefined; reject(request.error || new Error('Could not open the project database.')); };
    request.onblocked = () => reject(new Error('Database upgrade is blocked by another open tab.'));
  });
  return databasePromise;
}

function runRequest(mode, operation) {
  return openDatabase().then((db) => new Promise((resolve, reject) => {
    let transaction;
    try {
      transaction = db.transaction(PROJECTS_STORE, mode);
      const request = operation(transaction.objectStore(PROJECTS_STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Project storage request failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('Project storage transaction aborted.'));
    } catch (error) { reject(error); }
  }));
}

export function migrateProject(project) {
  if (!project || typeof project !== 'object' || Array.isArray(project)) throw new Error('Project data must be an object.');
  const now = new Date().toISOString();
  return {
    ...project,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: String(project.id || ''),
    title: String(project.title || 'Untitled project').slice(0, 100),
    idea: String(project.idea || ''),
    story: String(project.story || ''),
    screenplay: String(project.screenplay || ''),
    scenes: Array.isArray(project.scenes) ? project.scenes : [],
    characters: Array.isArray(project.characters) ? project.characters : [],
    locations: Array.isArray(project.locations) ? project.locations : [],
    storyboards: Array.isArray(project.storyboards) ? project.storyboards : [],
    assets: Array.isArray(project.assets) ? project.assets : [],
    timeline: Array.isArray(project.timeline) ? project.timeline : [],
    subtitles: typeof project.subtitles === 'string' ? project.subtitles : '',
    createdAt: project.createdAt || now,
    updatedAt: project.updatedAt || now,
  };
}

export function listProjects() {
  return runRequest('readonly', (store) => store.getAll()).then((projects) =>
    projects.map(migrateProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
}

export function saveProject(project) {
  return runRequest('readwrite', (store) => store.put(migrateProject(project)));
}

export function deleteProject(id) { return runRequest('readwrite', (store) => store.delete(id)); }

export function makeProject({ title, idea = '', genre = 'Science fiction', format = 'Short film' }) {
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) throw new Error('Give your project a title.');
  const now = new Date().toISOString();
  return migrateProject({
    id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: cleanTitle.slice(0, 100), idea: String(idea).trim().slice(0, 5000), genre, format,
    status: 'In development', createdAt: now, updatedAt: now,
  });
}

export function validateProjectImport(value) {
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { throw new Error('Backup is not valid JSON.'); }
  }
  const project = parsed?.format === 'ai-movie-studio-project' ? parsed.project : parsed;
  if (!project || typeof project !== 'object' || Array.isArray(project) || !String(project.title || '').trim()) {
    throw new Error('Backup does not contain a valid titled project.');
  }
  return migrateProject({ ...project, id: globalThis.crypto?.randomUUID?.() || `import-${Date.now()}-${Math.random().toString(16).slice(2)}` });
}
