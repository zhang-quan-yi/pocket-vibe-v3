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
- `GET /reader/payload?projectId=mock-pocket-vibe&filePath=src/reader/context.ts`
- `GET /search?projectId=mock-pocket-vibe&query=context`
- `POST /context/resolve`
- `POST /chat/sessions`
- `GET /chat/sessions/{sessionId}/events`
- `POST /chat/sessions/{sessionId}/messages`
- `POST /notes`

The service is intentionally read-only for source code. It only writes app-level mock notes.
