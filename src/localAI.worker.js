import { LOCAL_MODELS } from './localAI.js';

let generator;
let activeModel;
let activeRuntime;

self.onmessage = async ({ data }) => {
  if (data.type === 'load') {
    try {
      const model = LOCAL_MODELS.find((item) => item.id === data.modelId);
      if (!model) throw new Error('Unknown local model identifier.');
      const { env, pipeline } = await import('@huggingface/transformers');
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useBrowserCache = true;
      const runtimes = self.navigator?.gpu ? ['webgpu', 'wasm'] : ['wasm'];
      let lastError;
      for (const device of runtimes) {
        try {
          generator = await pipeline(model.task, model.id, {
            dtype: model.dtype,
            device,
            progress_callback: (event) => {
              if (event.status === 'progress' || event.status === 'download') self.postMessage({ type: 'progress', file: event.file || '', progress: event.progress });
            },
          });
          activeModel = model;
          activeRuntime = device;
          self.postMessage({ type: 'ready', modelId: model.id, runtime: device });
          return;
        } catch (error) {
          lastError = error;
          generator = undefined;
          if (device !== 'webgpu') throw error;
        }
      }
      throw lastError || new Error('No supported browser inference runtime was found.');
    } catch (error) {
      self.postMessage({ type: 'error', message: `Model could not be loaded: ${error?.message || String(error)}. Check browser support, storage, and available memory.` });
    }
  }
  if (data.type === 'generate') {
    if (!generator || !activeModel) { self.postMessage({ type: 'error', message: 'Load a model before generating.' }); return; }
    try {
      const { TextStreamer } = await import('@huggingface/transformers');
      const streamer = new TextStreamer(generator.tokenizer, { skip_prompt: true, skip_special_tokens: true, callback_function: (text) => self.postMessage({ type: 'chunk', text }) });
      await generator(data.prompt, { max_new_tokens: Math.min(Math.max(Number(data.maxNewTokens) || 256, 1), 512), temperature: Math.min(Math.max(Number(data.temperature) || 0.7, 0.1), 1.5), do_sample: true, streamer });
      self.postMessage({ type: 'complete', modelId: activeModel.id, runtime: activeRuntime });
    } catch (error) {
      self.postMessage({ type: 'error', message: `Generation failed: ${error?.message || String(error)}` });
    }
  }
};
