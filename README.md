# Pocket Vibe v3

Pocket Vibe v3 is starting with the engineering walking skeleton:

```text
Open app
  -> choose mock repo
  -> open mock file
  -> select code
  -> add context
  -> ask mock chat
  -> save note
  -> jump back to source
```

## Local Development

Start the Go mock API:

```bash
npm run dev:api
```

Start the Web/PWA shell:

```bash
npm install
npm run dev:web
```

The Web app expects the API at `http://localhost:8080`. Override it with `VITE_API_BASE` if needed.

Run checks:

```bash
npm run build:web
npm run test:api
```

## Current Scope

- Web/PWA frontend: `apps/web`
- Go mock API: `services/core`
- Product and architecture docs: `docs`

This skeleton intentionally does not implement real GitHub import, LSP, shell, source edits, commits, or PRs.
