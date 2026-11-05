# Local AI engine (first phase)

The workspace now has an optional, browser-only text-model playground. It uses Transformers.js and quantized ONNX language models, runs inference in a Web Worker, prefers WebGPU, and attempts a WebAssembly fallback. No AI API key or provider endpoint is used by this local runtime. The existing optional backend setting remains separate.

## Use

Open **Local AI** from the floating control, choose one of the listed models, and press **Download & load**. This explicit action starts model asset downloads from public Hugging Face model hosting; the approximate sizes are estimates. Wait for the worker to report ready, then enter a prompt and generate. Unload the model when finished. Removing cached files only removes matching entries exposed through the browser Cache API; browser-managed storage may require clearing site data in browser settings.

The initial download requires internet. Later offline inference depends on the runtime files and model assets still being retained by the browser. Serve the app on HTTPS or localhost. Browser compatibility, storage quotas, WebGPU drivers, and available memory vary. Device memory APIs are estimates, not a guarantee of available GPU/RAM. A WebAssembly fallback is attempted if WebGPU model initialization fails.

## Scope and limitations

This is the first language-model phase, not the full requested multi-modal AI Director. It currently provides two model choices, a prompt playground, progress events from the model runtime, cancellation by terminating the worker, basic capability reporting, and best-effort Cache API inspection/removal. Model output can be copied into the existing authoring fields, but is not yet automatically saved into a movie project. Speech, image understanding, translation-specific routing, multiple concurrent downloads, pause/resume, exact storage accounting, and video generation are not implemented. No fake generation or video-rendering capability is provided.

Model identifiers and quantized ONNX artifacts are declared in `src/localAI.js`; runtime support and availability ultimately depend on the upstream model repository and Transformers.js backend. A model identifier does not guarantee that it will fit or run on a particular phone. Review model licenses and upstream files before production use.
