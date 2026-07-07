# Plan-It — Implementation Plan

A mobile-first single-page app to manage home tasks, inspired by [Planify](https://useplanify.com/). Hosted on **GitHub Pages**, built with **HTML + CSS + TypeScript**, persisting data to **[jsonbin.io](https://jsonbin.io)**, and syncing across devices via **QR code**.

---

## 1. Goals & Scope

### Core requirements
- Clean, mobile-optimized web interface
- Schedule tasks (due date / time)
- Favorite tasks
- Task groups (projects / lists)
- Task tags
- Multi-device sync via QR code
- Persistence with jsonbin.io
- UI language switchable between **English (US)** and **Spanish (ES)**

### Non-goals (v1)
- User accounts / authentication server
- Real-time collaboration / push notifications
- Native app packaging
- Offline conflict-free merging (we use last-write-wins)

---

## 2. Tech Stack & Tooling

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety, better refactoring |
| Build | [Vite](https://vitejs.dev/) | Fast dev server, simple static output for Pages |
| UI | Vanilla TS + small render layer | No framework overhead; keeps bundle tiny |
| Styling | Plain CSS (custom properties) | Full control, mobile-first, no runtime cost |
| State | Custom store (pub/sub) | Predictable, testable, framework-free |
| Persistence | jsonbin.io REST API | Free hosted JSON store |
| QR | `qrcode` (generate) + `jsQR`/`html5-qrcode` (scan) | Encode/decode sync config |
| Icons | Inline SVG | No dependency, crisp on mobile |
| Hosting | GitHub Pages via GitHub Actions | Auto-deploy on push |

> **Alternative:** If you prefer zero build tooling, we can ship plain ES modules with no bundler. Vite is recommended for TS ergonomics and tree-shaking the QR libs.

---

## 3. Architecture

```
┌─────────────────────────────────────────────┐
│                   UI Layer                   │
│  views/ (Today, Groups, Task detail, Sync)   │
│  components/ (TaskItem, GroupList, TagChip)  │
└───────────────┬─────────────────────────────┘
                │ subscribe / dispatch
┌───────────────▼─────────────────────────────┐
│                 State Store                  │
│  in-memory model + pub/sub + selectors       │
└───────────────┬─────────────────────────────┘
                │ debounced save / load
┌───────────────▼─────────────────────────────┐
│              Persistence Layer               │
│  jsonbinClient  ·  localStorage cache        │
└───────────────┬─────────────────────────────┘
                │ config (binId + key)
┌───────────────▼─────────────────────────────┐
│                 Sync (QR)                    │
│  encode config → QR  ·  scan QR → config     │
└─────────────────────────────────────────────┘
```

### Data flow
1. On load, read sync config from `localStorage`; if present, fetch state from jsonbin.
2. All mutations go through the store → update UI → debounced push to jsonbin + cache to `localStorage`.
3. Sync: a new device scans the QR (containing bin ID + access key) → stores config → pulls state.

---

## 4. Data Model

```typescript
interface AppState {
  version: number;          // schema version for migrations
  updatedAt: string;        // ISO timestamp — used for last-write-wins
  tasks: Task[];
  groups: Group[];
  tags: Tag[];
}

interface Task {
  id: string;               // uuid
  title: string;
  notes?: string;
  groupId: string | null;
  tagIds: string[];
  scheduledAt: string | null;  // ISO date/time
  completed: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;            // manual sort within a group
}

interface Group {
  id: string;
  name: string;
  color: string;            // hex or CSS var key
  icon?: string;            // emoji or SVG id
  order: number;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}
```

### Sync config (encoded in QR)
```typescript
interface SyncConfig {
  binId: string;
  accessKey: string;        // jsonbin X-Access-Key (read+write) or X-Master-Key
  v: number;                // config format version
}
```

---

## 5. Persistence with jsonbin.io

### Setup
- Create a **private bin** holding the initial `AppState`.
- Generate an **Access Key** scoped to that bin (preferred over Master Key for QR sharing).

### Client operations
```
GET    https://api.jsonbin.io/v3/b/{binId}/latest   → read state
PUT    https://api.jsonbin.io/v3/b/{binId}          → write state
```
Headers: `X-Access-Key: <key>`, `Content-Type: application/json`.

### Strategy
- **Debounced writes** (e.g. 1.5s after last change) to avoid rate limits.
- **Optimistic UI**: update local state immediately, then persist.
- **Last-write-wins** on `updatedAt`; on load, compare remote vs. local cache and take the newer.
- **localStorage cache** as offline fallback and instant startup.

### ⚠️ Security note
The access key lives client-side. This is acceptable for a **personal, single-user** tool. Mitigations applied:
- Use a **bin-scoped Access Key**, not the Master Key.
- The QR does **not** contain the raw key — it contains a **passphrase-encrypted** payload (see §13). A scanned QR is useless without the passphrase.
- Treat the passphrase as the real secret; share it out-of-band (not alongside the QR).

---

## 6. QR Sync Flow

### Export (source device)
1. User opens **Sync** view → "Link a device" → enters a **passphrase**.
2. App serializes `SyncConfig` → JSON → **encrypts with the passphrase** (see §13) → base64.
3. Render QR with `qrcode` from the encrypted blob.

### Import (new device)
1. New device opens Sync view → "Scan" → will be prompted for the **passphrase**.
2. Camera scans via `html5-qrcode` (uses `getUserMedia`; requires HTTPS — GitHub Pages provides it).
3. Decode → **decrypt with passphrase** → validate → save config to `localStorage` → pull state from jsonbin.
4. Both devices now read/write the same bin. (Wrong passphrase → decryption fails, clear error shown.)

### Fallback
- Manual "copy config code" text field for devices without a camera.

---

## 7. UI / UX

### Views
1. **Today / Scheduled** — tasks grouped by date; overdue highlighted.
2. **Groups** — list of groups; tap to see group tasks.
3. **Favorites** — starred tasks.
4. **Tags** — filter view by tag chips.
5. **Task detail / editor** — bottom sheet modal (title, notes, schedule, group, tags, favorite).
6. **Sync** — QR generate/scan + connection status.

### Mobile-first principles
- Single-column layout, `max-width` cap for desktop.
- Bottom tab bar navigation (thumb-reachable).
- Bottom-sheet modals for editing.
- Large tap targets (≥44px), swipe-to-complete / swipe-to-delete.
- System font stack, light/dark via `prefers-color-scheme`.
- Safe-area insets for notched phones.

### Stretch UX
- Recurring tasks
- Drag-to-reorder
- PWA manifest + service worker (installable, offline)

---

## 8. Project Structure

```
plan-it/
├── index.html
├── src/
│   ├── main.ts                # bootstrap
│   ├── state/
│   │   ├── store.ts           # pub/sub store
│   │   ├── actions.ts         # mutations
│   │   └── selectors.ts
│   ├── model/
│   │   └── types.ts
│   ├── persistence/
│   │   ├── jsonbinClient.ts
│   │   ├── localCache.ts
│   │   └── sync.ts            # merge / last-write-wins
│   ├── qr/
│   │   ├── generate.ts
│   │   └── scan.ts
│   ├── crypto/
│   │   └── passphrase.ts      # Web Crypto: PBKDF2 + AES-GCM encrypt/decrypt
│   ├── views/
│   │   ├── TodayView.ts
│   │   ├── GroupsView.ts
│   │   ├── TaskEditor.ts
│   │   └── SyncView.ts
│   ├── components/
│   │   ├── TaskItem.ts
│   │   ├── TagChip.ts
│   │   └── BottomNav.ts
│   ├── i18n/
│   │   ├── translations.ts    # en / es dictionaries (typed keys)
│   │   └── i18n.ts            # t(), getLang/setLang, persistence, pub/sub
│   ├── lib/
│   │   ├── uuid.ts
│   │   ├── date.ts
│   │   └── debounce.ts
│   └── styles/
│       ├── reset.css
│       ├── tokens.css         # CSS custom properties
│       └── app.css
├── public/
│   └── manifest.webmanifest
├── .github/workflows/deploy.yml
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. GitHub Pages Deployment

- `vite.config.ts` → set `base: '/plan-it/'` (repo name) so asset paths resolve.
- GitHub Actions workflow: build on push to `main`, publish `dist/` to Pages.

```yaml
# .github/workflows/deploy.yml (sketch)
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

---

## 10. Implementation Phases

### Phase 0 — Scaffold ✅
- [x] Init Vite + TS project, tsconfig, base path (`/plan-it/`)
- [x] CSS tokens, reset, mobile shell, bottom nav
- [x] Hash-based router (Pages-friendly) + placeholder views
- [x] i18n layer (EN/ES) with header toggle, localStorage persistence, browser-language default
- [x] GitHub Actions Pages deploy workflow
- [x] Build verified (`npm run build`) + shell renders on mobile viewport (EN + ES)

### Phase 1 — Local task core ✅
- [x] Data model (`model/types.ts`) + pub/sub store (`state/store.ts`)
- [x] CRUD actions: create / edit / complete / favorite / delete (`state/actions.ts`)
- [x] localStorage persistence with schema version + corrupt-data fallback
- [x] Today view (active + completed sections) with FAB
- [x] Task editor bottom sheet (create + edit + delete), all strings i18n'd
- [x] Verified end-to-end in-browser (add/edit/complete/favorite/delete + reload persistence)

### Phase 2 — Organization
- [ ] Groups (CRUD, assign task to group)
- [ ] Tags (CRUD, assign, filter)
- [ ] Favorites (toggle + view)
- [ ] Scheduling (date/time picker, sort/overdue)

### Phase 3 — Cloud persistence
- [ ] jsonbin client (read/write)
- [ ] Debounced sync + last-write-wins merge
- [ ] Settings screen to enter/manage bin config
- [ ] Loading / error / offline states

### Phase 4 — QR sync
- [ ] Passphrase crypto helper (Web Crypto: PBKDF2 + AES-GCM)
- [ ] Generate QR from **encrypted** SyncConfig (prompt for passphrase)
- [ ] Scan QR (camera) + decrypt with passphrase + manual fallback
- [ ] Wrong-passphrase error handling
- [ ] End-to-end two-device test

### Phase 5 — Polish
- [ ] Swipe gestures, dark mode, empty states
- [ ] PWA manifest + service worker (optional)
- [ ] Accessibility pass (labels, focus, contrast, tap targets)

---

## 11. Key Risks & Decisions

| Risk | Mitigation |
|---|---|
| Access key exposed in QR | QR carries a **passphrase-encrypted** blob, not the raw key; bin-scoped key; personal use only |
| Passphrase lost | Key can be re-issued in jsonbin dashboard; re-link devices with a new passphrase |
| jsonbin rate limits | Debounce writes, cache locally |
| Concurrent edits on 2 devices | Last-write-wins; acceptable for single user |
| Camera requires HTTPS | GitHub Pages is HTTPS by default |
| Schema changes over time | `version` field + migration step on load |

### Decisions (locked)
1. **jsonbin key** — ✅ Bin-scoped **Access Key** (not Master Key). Embedded in the QR/encrypted payload.
2. **Build tooling** — ✅ **Vite**. Confirmed compatible with GitHub Pages (static `dist/` output; set `base: '/plan-it/'`).
3. **PWA/offline** — ⏭️ Deferred to a later stretch (not in v1).
4. **Sync payload** — ✅ **Passphrase-protected**. Config is encrypted before being encoded into the QR; the receiving device prompts for the passphrase to decrypt. See §6 and §13.

---

## 12. Definition of Done (v1)
- Create, schedule, favorite, tag, and group tasks on mobile.
- Data persists to jsonbin and survives reload.
- A second device scans the QR, enters the passphrase, and sees the same tasks.
- App is live on GitHub Pages via automated deploy.
- Entire UI is available in both English (US) and Spanish (ES), switchable at runtime.

> **i18n convention:** every user-facing string added in later phases must go through `t('key')` with entries in **both** `en` and `es` dictionaries. `TKey` is derived from the `en` dictionary, so a missing key is a compile error.

---

## 13. Passphrase Encryption (Sync Payload)

The QR encodes an **encrypted** `SyncConfig`, never the raw access key. Uses the built-in **Web Crypto API** (no external crypto dependency).

### Scheme
- **Key derivation**: PBKDF2 (SHA-256, ~150k iterations) from the passphrase + random 16-byte salt.
- **Encryption**: AES-GCM (256-bit) with a random 12-byte IV.
- **Payload**: `base64( salt || iv || ciphertext )` → this string goes into the QR.

### API sketch
```typescript
// crypto/passphrase.ts
async function encryptConfig(config: SyncConfig, passphrase: string): Promise<string>;
async function decryptConfig(blob: string, passphrase: string): Promise<SyncConfig>;
// decrypt throws on wrong passphrase (AES-GCM auth tag fails) → surfaced as a UX error.
```

### Notes
- No passphrase is ever stored or transmitted — it only exists in memory during link/scan.
- Same passphrase must be entered on both devices; share it out-of-band from the QR.
- Wrong passphrase = decryption failure with a clear, non-technical error message.
