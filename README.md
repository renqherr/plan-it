# Plan-It

To-Do web application with steroids — a mobile-first single-page app to manage home tasks, inspired by [Planify](https://useplanify.com/). Built with TypeScript + Vite, persists to [jsonbin.io](https://jsonbin.io), and syncs across devices via passphrase-protected QR codes. Hosted on GitHub Pages.

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the full design and roadmap.

## Development

```bash
npm install
npm run dev        # dev server (http://localhost:5173/plan-it/)
npm run build      # typecheck + production build to dist/
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. Enable Pages → "GitHub Actions" as the source in the repo settings once.

Live at: `https://renqherr.github.io/plan-it/`

## Status

- [x] **Phase 0** — Scaffold: Vite + TS, mobile shell, bottom-nav routing, i18n (EN/ES), Pages deploy
- [x] **Phase 1** — Local task core: model, store, CRUD, localStorage, Today view + editor
- [x] **Phase 2** — Groups (list+detail), tags + filter, Favorites view, scheduling (overdue/sort)
- [ ] **Phase 3** — jsonbin cloud persistence
- [ ] **Phase 4** — QR sync (passphrase-encrypted)
- [ ] **Phase 5** — Polish
