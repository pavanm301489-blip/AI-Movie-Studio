import { describe, expect, it } from 'vitest';
import { LOCAL_MODELS, chooseRuntime, getDeviceCapabilities, routeTask } from './localAI.js';

describe('local AI catalog and device routing', () => {
  it('exposes distinct quantized text models with task metadata', () => {
    expect(LOCAL_MODELS.length).toBeGreaterThan(1);
    expect(new Set(LOCAL_MODELS.map((model) => model.id)).size).toBe(LOCAL_MODELS.length);
    expect(LOCAL_MODELS.every((model) => model.task === 'text-generation' && model.dtype)).toBe(true);
  });

  it('detects WebGPU, WebAssembly, secure context, and a cautious memory profile', async () => {
    const nav = { gpu: {}, deviceMemory: 4, hardwareConcurrency: 8, onLine: true };
    const result = await getDeviceCapabilities(nav, { isSecureContext: true });
    expect(result).toMatchObject({ webgpu: true, secureContext: true, deviceMemory: 4, profile: 'low-end' });
    expect(result.wasm).toBe(true);
  });

  it('selects WASM when WebGPU is missing and reports no runtime when neither exists', () => {
    expect(chooseRuntime({ webgpu: false, wasm: true })).toEqual(['wasm']);
    expect(chooseRuntime({ webgpu: false, wasm: false })).toEqual([]);
  });

  it('routes movie-writing tasks to text generation', () => {
    for (const task of ['story writing', 'screenplay', 'dialogue', 'scene breakdown', 'character development']) expect(routeTask(task)).toBe('text-generation');
  });
});
