# Pocket Vibe Core API

This is the Go-first backend skeleton for the mock walking path.

## Run

```bash
go run ./cmd/pocket-vibe-api
```

Default address:

```text
http://localhost:8080
```

## Mock Endpoints

- `GET /health`
- `GET /mock/repos`
- `GET /files/tree?projectId=mock-pocket-vibe`
- `GET /files/content?projectId=mock-pocket-vibe&filePath=src/reader/context.ts`
- `GET /reader/payload?projectId=mock-pocket-vibe&filePath=src/reader/context.ts`
- `GET /search?projectId=mock-pocket-vibe&query=context`
- `GET /capabilities?projectId=mock-pocket-vibe`
- `POST /context/resolve`
- `POST /chat/sessions`
- `GET /chat/sessions/{sessionId}/events`
- `POST /chat/sessions/{sessionId}/messages`
- `GET /notes?projectId=mock-pocket-vibe`
- `GET /notes/{noteId}?projectId=mock-pocket-vibe`
- `POST /notes`
- `GET /saved-answers?projectId=mock-pocket-vibe`
- `POST /saved-answers`
- `GET /annotations?projectId=mock-pocket-vibe`
- `POST /annotations`

The service now reads from a local fixture repo for code browsing and still keeps source code read-only. It only writes app-level mock knowledge records in memory.
