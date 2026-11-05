# AI Movie Studio

A mobile-friendly, local-first workspace for planning a film. This repository now includes practical authoring tools for scripts, scene boards, character profiles, locations, media organization, audio notes, timeline planning, project backups, and an installable PWA shell.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Run checks and create a production build with `npm test` and `npm run build`.

## Working features

- Create, browse, edit, and delete projects stored in the browser's IndexedDB.
- Draft story concepts, add screenplay scenes and storyboard notes, maintain character/location catalogs, and write subtitle/audio notes.
- Import image, audio, and video files into project-local IndexedDB records (subject to browser storage quotas); preview supported media and arrange a simple saved edit list.
- Export a JSON project backup and plain-text screenplay. The app does not claim to render MP4/WebM video.
- Optional provider integration: configure a trusted HTTPS backend in Settings. Requests are POSTed to that endpoint with a task name, project metadata, and prompt content. Provider credentials belong on the backend, never in this public frontend.
- Browser speech synthesis can preview narration where supported; it does not create an audio file.
- Online/offline connectivity indicator and offline project editing. Production service worker caches the app shell and same-origin assets after an initial successful visit.
- Responsive Android-friendly interface and web app manifest.

## Provider request contract

The configured backend receives JSON such as `{ "task": "story-draft", "project": { "id": "…", "title": "…", "genre": "…" }, "prompt": "…" }`. Other task names currently include `image-or-video` and `voice-audio`. The backend must enforce its own authentication, provider credentials, request limits, content policy, and CORS. This repository does not include a provider service or embed API keys. Only connect a backend you trust.

## Not implemented / limitations

Real AI story/image/video/audio generation requires a separately deployed compatible backend and configured provider. There is no built-in local AI model. The timeline is an edit plan, not a nonlinear video renderer; transitions, timed subtitle rendering, audio synchronization, MP4/WebM export, import of project backups, and cloud-job recovery are not implemented. Imported media consumes browser storage and may be evicted or lost if site data is cleared. Back up important work.

## Offline behavior

After the first successful online load, the service worker caches the app shell and eligible same-origin resources for later startup. IndexedDB projects remain available in the same browser profile. Provider calls require connectivity. Browser cache and storage behavior varies; offline installation and recovery must be verified on each target device. HTTPS is required for service workers outside localhost.
