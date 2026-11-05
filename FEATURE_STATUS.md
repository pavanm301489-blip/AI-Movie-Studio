# Repository audit and feature status

Audit date: 2026-11-05. Scope: current `main` branch after the initial production-studio update.

## Baseline observed

The repository is a small React/Vite application with a local IndexedDB project store, single-page navigation, local story/scene editing, character and location lists, imported media records, a simple timeline plan, optional generic backend request, and a basic service worker/PWA manifest. The existing project and storage helper tests cover project validation and basic provider request behavior. No backend, provider SDK, rendering engine, end-to-end browser test setup, or deployment workflow was present in the inspected tree.

## This upgrade increment

- Versioned project normalization/migration and safe JSON backup import validation.
- Structured scene-breakdown and storyboard-frame data helpers, scene duplication, and reorder utility.
- SRT/VTT parsing and export primitives with timing validation.
- Shared image/video/audio file validation helper.
- Unit tests for these helpers.

## Status meanings

- **COMPLETE**: implemented in the repository and covered by tests, but still requires the listed test command to be run in a real environment before release verification.
- **PARTIAL**: usable implementation exists with documented limitations.
- **PLANNED**: not implemented.
- **BLOCKED**: requires infrastructure, credentials, or external capability not included here.

## Feature status

| Module/capability | Status | Notes |
| --- | --- | --- |
| Local projects / IndexedDB | PARTIAL | CRUD exists; schema normalization added. Browser storage quotas and eviction remain browser-controlled. |
| Story and basic scene editor | PARTIAL | User-editable content persists; no automated story generation or screenplay typesetting. |
| Structured scene breakdown | PARTIAL | Data helpers and model fields exist; no complete scene-breakdown UI or screenplay parser yet. |
| Character and location lists | PARTIAL | Basic profiles/catalogs exist; relationships, reference management and scene linking remain incomplete. |
| Storyboard frames | PARTIAL | Structured frame data helper exists; full storyboard UI and generated/uploaded frame linkage remain incomplete. |
| AI image/video generation | BLOCKED | Generic optional endpoint call exists; no bundled provider adapters, job polling or credentials backend. |
| Voice/audio | PARTIAL | Browser speech preview and audio notes; no saved synthesized output or mixing engine. |
| Timeline/editor | PARTIAL | Saved ordered edit plan and media preview; no trim/split/transitions or rendered output. |
| Subtitles | PARTIAL | SRT/VTT data functions added; subtitle editing/import UI not yet connected. |
| Video rendering/export | BLOCKED | No MP4/WebM renderer. JSON backup and screenplay text exports are available. |
| Offline PWA | PARTIAL | Service-worker app shell and IndexedDB editing; target-device offline install needs manual verification. |
| Android/mobile layout | PARTIAL | Responsive base; real Android Chrome/touch/accessibility checks not run. |
| Automated tests/build | PARTIAL | Tests added/retained; no shell runner is available in this task, so test/build status is unverified. |

## Verification still required

Run `npm install`, `npm test`, and `npm run build` in the repository environment. Then manually check mobile Chrome installation/offline reload, IndexedDB persistence, and provider error behavior. Do not mark the application release-ready until these checks pass.
