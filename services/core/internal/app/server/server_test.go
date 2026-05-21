package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFilesAndCapabilitiesEndpoints(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/files/tree?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("files/tree request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("files/tree status = %d", resp.StatusCode)
	}
	if resp.Header.Get("X-Trace-Id") == "" {
		t.Fatal("expected X-Trace-Id header")
	}

	resp, err = http.Get(ts.URL + "/capabilities?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("capabilities request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("capabilities status = %d", resp.StatusCode)
	}
}

func TestNotesLoopAndTraceIDError(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	createBody := map[string]any{
		"projectId": "mock-pocket-vibe",
		"title":     "Fixture note",
		"body":      "Saved from test",
		"anchors": []map[string]any{{
			"filePath":  "src/reader/context.ts",
			"startLine": 3,
			"endLine":   12,
		}},
	}
	payload, _ := json.Marshal(createBody)
	resp, err := http.Post(ts.URL+"/notes", "application/json", bytes.NewReader(payload))
	if err != nil {
		t.Fatalf("create note request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create note status = %d", resp.StatusCode)
	}
	var created struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatalf("decode created note: %v", err)
	}
	if created.ID == "" {
		t.Fatal("expected created note id")
	}

	resp, err = http.Get(ts.URL + "/notes?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("list notes request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("list notes status = %d", resp.StatusCode)
	}

	resp, err = http.Get(ts.URL + "/notes/missing?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("missing note request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("missing note status = %d", resp.StatusCode)
	}
	var apiErr struct {
		Error struct {
			TraceID string `json:"traceId"`
		} `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiErr); err != nil {
		t.Fatalf("decode error payload: %v", err)
	}
	if apiErr.Error.TraceID == "" {
		t.Fatal("expected trace id in error response")
	}
}
