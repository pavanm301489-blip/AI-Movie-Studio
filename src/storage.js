export const DB_NAME = 'ai-movie-studio';
export const DB_VERSION = 1;
export const PROJECTS_STORE = 'projects';

let databasePromise;

function openDatabase() {
  if (!('indexedDB' in globalThis)) {
    return Promise.reject(new Error('IndexedDB is not available in this browser.'));
  }
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
    request.onerror = () => {
      databasePromise = undefined;
      reject(request.error || new Error('Could not open the project database.'));
    };
    request.onblocked = () => reject(new Error('Database upgrade is blocked by another open tab.'));
  });
  return databasePromise;
}

function runRequest(mode, operation) {
  return openDatabase().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(PROJECTS_STORE, mode);
    const request = operation(transaction.objectStore(PROJECTS_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Project storage request failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('Project storage transaction aborted.'));
  }));
}

export function listProjects() {
  return runRequest('readonly', (store) => store.getAll()).then((projects) =>
    projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
}

export function saveProject(project) {
  return runRequest('readwrite', (store) => store.put(project));
}

export function deleteProject(id) {
  return runRequest('readwrite', (store) => store.delete(id));
}

export function makeProject({ title, idea = '', genre = 'Science fiction', format = 'Short film' }) {
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) throw new Error('Give your project a title.');
  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: cleanTitle.slice(0, 100),
    idea: String(idea).trim().slice(0, 5000),
    genre,
    format,
    status: 'In development',
    createdAt: now,
    updatedAt: now,
  };
}
