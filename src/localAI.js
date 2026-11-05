export const LOCAL_MODELS = [
  {
    id: 'onnx-community/Qwen2.5-0.5B-Instruct',
    name: 'Qwen2.5 0.5B Instruct (quantized ONNX)',
    task: 'text-generation',
    estimatedSize: 'about 350 MB',
    description: 'Compact general-purpose instruction model suitable for short writing and story-development prompts. Quantized model; output quality and speed depend on device.',
    dtype: 'q4',
  },
  {
    id: 'onnx-community/SmolLM2-360M-Instruct',
    name: 'SmolLM2 360M Instruct (quantized ONNX)',
    task: 'text-generation',
    estimatedSize: 'about 300 MB',
    description: 'Small instruction-tuned language model for lightweight drafting and prompt experiments. Multilingual and creative-writing quality is not guaranteed.',
    dtype: 'q4',
  },
];

export function getDeviceCapabilities(navigatorObject = globalThis.navigator, windowObject = globalThis.window) {
  const memory = Number.isFinite(navigatorObject?.deviceMemory) ? navigatorObject.deviceMemory : null;
  const cores = Number.isFinite(navigatorObject?.hardwareConcurrency) ? navigatorObject.hardwareConcurrency : null;
  const webgpu = Boolean(navigatorObject?.gpu);
  const wasm = Boolean(globalThis.WebAssembly);
  const profile = memory != null ? (memory <= 4 ? 'low-end' : memory <= 8 ? 'mid-range' : 'high-performance') : (cores != null && cores <= 4 ? 'low-end' : 'unknown');
  return Promise.resolve({ webgpu, wasm, secureContext: Boolean(windowObject?.isSecureContext), online: navigatorObject?.onLine !== false, deviceMemory: memory, hardwareConcurrency: cores, profile });
}

export async function getCachedModelBytes() {
  if (!globalThis.caches) return 0;
  let total = 0;
  for (const name of await caches.keys()) {
    if (!/transformers/i.test(name)) continue;
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      const response = await cache.match(request);
      const size = Number(response?.headers?.get('content-length'));
      if (Number.isFinite(size)) total += size;
    }
  }
  return total;
}

export async function removeCachedModel(modelId) {
  if (!globalThis.caches) throw new Error('The Cache API is unavailable in this browser.');
  let removed = 0;
  for (const name of await caches.keys()) {
    if (!/transformers/i.test(name)) continue;
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      let url;
      try { url = decodeURIComponent(request.url); } catch { url = request.url; }
      if (url.includes(encodeURIComponent(modelId)) || url.includes(modelId)) {
        if (await cache.delete(request)) removed += 1;
      }
    }
  }
  return removed;
}

export function chooseRuntime(capabilities) {
  if (capabilities?.webgpu) return ['webgpu', 'wasm'];
  if (capabilities?.wasm) return ['wasm'];
  return [];
}

export function routeTask(task) {
  const text = String(task || '').toLowerCase();
  if (/story|screenplay|dialogue|character|scene|script|creative/.test(text)) return 'text-generation';
  return 'text-generation';
}
