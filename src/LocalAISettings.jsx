import { useEffect, useState } from 'react';
import { LOCAL_MODELS, getDeviceCapabilities, getCachedModelBytes, removeCachedModel } from './localAI.js';
import './localAI.css';

const initialPrompt = 'Write a concise, cinematic story premise about an unexpected friendship. Include a protagonist, a conflict, and an emotional turn.';

export default function LocalAISettings() {
  const [open, setOpen] = useState(false);
  const [modelId, setModelId] = useState(() => localStorage.getItem('ams-local-ai-model') || LOCAL_MODELS[0].id);
  const [capabilities, setCapabilities] = useState(null);
  const [worker, setWorker] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [cacheBytes, setCacheBytes] = useState(null);
  const selectedModel = LOCAL_MODELS.find((model) => model.id === modelId) || LOCAL_MODELS[0];

  useEffect(() => {
    getDeviceCapabilities().then(setCapabilities);
    getCachedModelBytes().then(setCacheBytes);
    return () => worker?.terminate();
  }, [worker]);

  const stopWorker = () => { worker?.terminate(); setWorker(null); };
  const selectModel = (value) => { setModelId(value); localStorage.setItem('ams-local-ai-model', value); setOutput(''); setError(''); };

  const start = () => {
    if (!capabilities?.secureContext) { setError('Local model runtime requires HTTPS or localhost (a secure browser context).'); return; }
    if (!capabilities?.online) { setError('The selected model is not cached yet. Connect to the internet to download it.'); return; }
    setError(''); setOutput(''); setStatus('downloading');
    const instance = new Worker(new URL('./localAI.worker.js', import.meta.url), { type: 'module' });
    setWorker(instance);
    instance.onmessage = ({ data }) => {
      if (data.type === 'progress') setProgress(data);
      if (data.type === 'ready') { setStatus('ready'); setProgress(null); }
      if (data.type === 'chunk') setOutput((current) => current + data.text);
      if (data.type === 'complete') { setStatus('ready'); setProgress(null); }
      if (data.type === 'error') { setError(data.message); setStatus('error'); setProgress(null); stopWorker(); }
    };
    instance.onerror = () => { setError('The model worker stopped unexpectedly. Your project data is unaffected.'); setStatus('error'); stopWorker(); };
    instance.postMessage({ type: 'load', modelId });
  };

  const generate = () => {
    if (!prompt.trim()) return;
    if (!worker || status !== 'ready') { setError('Load a model before generating.'); return; }
    setError(''); setOutput(''); setStatus('generating');
    worker.postMessage({ type: 'generate', prompt: prompt.trim(), maxNewTokens: 256, temperature: 0.7 });
  };
  const cancel = () => { stopWorker(); setStatus('idle'); setProgress(null); setError('Loading or generation cancelled.'); };
  const unload = () => { stopWorker(); setStatus('idle'); setProgress(null); setOutput(''); };
  const remove = async () => {
    if (!window.confirm(`Remove cached files for ${selectedModel.name} from this browser?`)) return;
    unload();
    try { await removeCachedModel(selectedModel.id); setCacheBytes(await getCachedModelBytes()); setError('Cached files removed where the browser Cache API exposed them. Check browser storage settings for any remaining site data.'); }
    catch (e) { setError(e.message || 'Could not remove cached model files.'); }
  };

  if (!open) return <button className="local-ai-launcher" onClick={() => setOpen(true)} aria-label="Open local AI models">◈ <span>Local AI</span></button>;

  return <div className="local-ai-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
    <section className="local-ai-panel" role="dialog" aria-modal="true" aria-labelledby="local-ai-title">
      <header className="local-ai-header"><div><span className="eyebrow">PRIVATE, ON-DEVICE INFERENCE</span><h2 id="local-ai-title">Local AI models</h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close local AI">×</button></header>
      <p className="local-ai-intro">Run a text model in this browser. Model downloads are large and start only after you choose <b>Download &amp; load</b>. Prompts are processed locally after loading.</p>
      <div className="local-ai-device"><strong>Device compatibility</strong><span>{capabilities ? `${capabilities.webgpu ? 'WebGPU available' : 'WebGPU unavailable'} · ${capabilities.wasm ? 'WebAssembly available' : 'WebAssembly unavailable'} · ${capabilities.profile} profile` : 'Checking browser…'}</span><small>{capabilities?.deviceMemory ? `Approx. device memory: ${capabilities.deviceMemory} GB (browser estimate only)` : 'Browser does not expose a device-memory estimate.'} {capabilities?.secureContext ? 'Secure context.' : 'HTTPS or localhost required.'}</small><small>{capabilities?.hardwareConcurrency || 'Unknown'} CPU threads · {capabilities?.online ? 'online' : 'offline'}</small></div>
      <label className="local-ai-label">Model<select value={modelId} onChange={(event) => selectModel(event.target.value)} disabled={status === 'downloading' || status === 'generating'}>{LOCAL_MODELS.map((model) => <option key={model.id} value={model.id}>{model.name} · {model.estimatedSize}</option>)}</select></label>
      <p className="local-ai-model-note">{selectedModel.description} Model size is an estimate; actual download and memory requirements vary by browser and cache. WebGPU initialization falls back to WebAssembly when available.</p>
      <div className="local-ai-actions">{(status === 'idle' || status === 'error') && <button className="button button-primary" onClick={start}>Download &amp; load</button>}{status === 'downloading' && <button className="button button-quiet" onClick={cancel}>Cancel</button>}{status === 'ready' && <button className="button button-quiet" onClick={unload}>Unload model</button>}{status === 'generating' && <button className="button button-quiet" onClick={cancel}>Stop</button>}<button className="button button-quiet" onClick={remove}>Remove cached files</button></div>
      <div className="local-ai-status" role="status">Status: {status}{progress?.file && ` · ${progress.file}`}{progress?.progress != null && ` · ${Math.round(progress.progress)}%`}</div>
      {progress?.progress != null && <progress max="100" value={progress.progress} aria-label="Model download progress" />}
      {cacheBytes != null && <small className="local-ai-cache">Transformers cache reported: {(cacheBytes / (1024 ** 2)).toFixed(1)} MB. Totals may include other models and browser-managed assets.</small>}
      <label className="local-ai-label">Playground prompt<textarea rows="3" maxLength="4000" value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
      <button className="button button-primary" onClick={generate} disabled={status !== 'ready' || !prompt.trim()}>Generate locally</button>
      {error && <p className="local-ai-error" role="alert">{error}</p>}
      {output && <pre className="local-ai-output" aria-live="polite">{output}</pre>}
      <footer className="local-ai-footnote">This first phase supports local text generation only. Initial downloads need internet; offline use depends on browser cache retention. No video, image, audio, or speech generation is claimed. Local AI output is not yet automatically written into a movie project—copy approved text into the editor. Existing project storage is unchanged.</footer>
    </section>
  </div>;
}
