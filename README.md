# AI Movie Studio

A mobile-friendly, local-first workspace for planning a film. The app builds on the existing React/Vite project and keeps production data in browser IndexedDB.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

## Implemented workflows

- Create, browse, edit, and delete local projects.
- Story concept and screenplay scene editing; basic character/location catalogs.
- Import and preview image, video, and audio media where browser support permits; maintain a simple saved edit order.
- Structured scene-breakdown and storyboard-frame data helpers.
- Project schema normalization and safe JSON backup import validation.
- SRT/VTT parsing/export utilities with time validation.
- JSON project backup and plain-text screenplay downloads.
- Optional generic HTTPS backend request boundary. The backend must keep secrets server-side.
- Offline project editing after the app has been loaded; installable PWA manifest and service-worker shell.

Check [FEATURE_STATUS.md](FEATURE_STATUS.md) for precise implementation status. A test file is not proof of passing tests: the project commands must be run before release.

## AI integration and privacy

No AI provider credentials or model runtime are bundled. The generic configured endpoint receives a JSON task request from this browser. Only connect a backend you trust, deploy HTTPS, validate/authenticate requests server-side, set provider spending limits and CORS, and keep provider keys out of this public repository. Without a configured backend, generation is unavailable; the app does not fabricate generated results.

## Offline behavior

Projects and authoring data are saved locally in the same browser profile. Offline mode does not imply a local AI model. Browser storage can be limited or cleared; export backups regularly. PWA/service-worker behavior should be checked on the actual Android Chrome version and deployment origin.

## Current limitations

There is no complete AI Director, provider-specific model adapter, background generation job tracker, local AI model, fully-featured storyboard UI, real nonlinear editor, speech-to-file/audio mixing, automatic speech recognition, or video renderer. MP4/WebM export is unavailable. The timeline is an edit plan, not a rendered movie. See the status table for module-by-module details.
