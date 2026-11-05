# AI Movie Studio

A mobile-friendly, local-first workspace for organizing movie ideas. This repository is being built in phases; this first working release focuses on the responsive application shell, offline app-shell caching, and private local project management.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`; run the small unit-test suite with `npm test`.

## What works now

- Responsive dark workspace with dashboard, project library, and individual project workspace.
- Create projects with a title, premise, genre, and format; browse, edit notes, and delete them.
- Project records are stored in the browser's IndexedDB on the current device. No account or project upload is involved.
- Displays browser network connectivity and listens for online/offline changes. This is a connectivity indicator only, not a check that an AI provider is usable.
- PWA manifest and service worker cache the application shell for repeat visits while offline (after an initial successful visit). Production hosting must serve the site over HTTPS for service workers.
- Input limits and a confirmation step before deleting a project.

## Not implemented yet

This is not yet an AI generation service or movie editor. Story/screenplay generation, local AI models, cloud provider adapters, character and media generation, audio, timeline editing, subtitle tools, video rendering/export, cloud task queues, and automatic job recovery are not implemented. Those controls are labeled as future work rather than returning fabricated results. No AI provider or paid service is required or configured.

IndexedDB and cached app assets are browser-local. Clearing site data, using another browser/device, or uninstalling the browser profile may remove them. Generated video assets and project backup import/export are not supported yet. The initial Vite development server is not itself a deployment; Cloudflare Pages deployment is not configured in this commit.

## Offline behavior

Once the production app shell has been cached by a successful visit, the service worker can serve the UI when the network is unavailable. Projects remain accessible locally as long as browser storage is retained. The app does not download or run language, image, video, or audio AI models offline. External Google Fonts are an optional visual enhancement and are not bundled; offline display falls back to system fonts.

## Build status

Automated unit tests are included for project record validation. They have not been executed in this environment. No claim is made that production build, Android-device, PWA-install, offline-recovery, or video-export checks have passed; run the commands above and test on target devices before deployment.
