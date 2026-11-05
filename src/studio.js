const ENDPOINT_KEY = 'ai-movie-studio-provider-endpoint';

export function createScene(index = 0) {
  return { id: globalThis.crypto?.randomUUID?.() || `scene-${Date.now()}-${index}`, heading: '', body: '' };
}

export function getConfiguredEndpoint() {
  try { return globalThis.localStorage?.getItem(ENDPOINT_KEY) || ''; } catch { return ''; }
}

export function saveConfiguredEndpoint(value) {
  const endpoint = String(value || '').trim();
  if (endpoint) {
    let parsed;
    try { parsed = new URL(endpoint); } catch { throw new Error('Enter a valid HTTPS backend URL.'); }
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      throw new Error('Use HTTPS for the backend URL (HTTP is allowed only for localhost).');
    }
  }
  try {
    if (endpoint) globalThis.localStorage?.setItem(ENDPOINT_KEY, endpoint);
    else globalThis.localStorage?.removeItem(ENDPOINT_KEY);
  } catch { throw new Error('Could not save the endpoint in browser storage.'); }
  return endpoint;
}

export async function requestGeneration(endpoint, request, fetchImpl = globalThis.fetch) {
  if (!endpoint) throw new Error('Configure a backend endpoint first.');
  if (typeof fetchImpl !== 'function') throw new Error('Fetch is unavailable in this browser.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/plain' },
      body: JSON.stringify(request), signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
    const type = response.headers?.get?.('content-type') || '';
    if (type.includes('application/json')) return await response.json();
    return await response.text();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Provider request timed out after 60 seconds.');
    throw error;
  } finally { clearTimeout(timer); }
}

export function exportProject(project) {
  return JSON.stringify({ format: 'ai-movie-studio-project', version: 1, exportedAt: new Date().toISOString(), project }, null, 2);
}
