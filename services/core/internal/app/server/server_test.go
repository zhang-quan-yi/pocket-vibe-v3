package server

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
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

	resp, err = http.Get(ts.URL + "/notes/note_missing?projectId=mock-pocket-vibe")
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

func TestInvalidFilePathReturnsBadRequest(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/files/content?projectId=mock-pocket-vibe&filePath=../secret.txt")
	if err != nil {
		t.Fatalf("invalid file request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("invalid file status = %d", resp.StatusCode)
	}

	var apiErr struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiErr); err != nil {
		t.Fatalf("decode error payload: %v", err)
	}
	if apiErr.Error.Code != "BAD_REQUEST" {
		t.Fatalf("error code = %q", apiErr.Error.Code)
	}
}

func TestContextResolveChatAndKnowledgeLoop(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	chip := map[string]any{
		"id":      "selection:src/reader/context.ts:3",
		"kind":    "selection",
		"label":   "Selected context builder",
		"summary": "Selected lines from the context basket fixture.",
		"range": map[string]any{
			"filePath":  "src/reader/context.ts",
			"startLine": 3,
			"endLine":   12,
		},
	}
	resolvePayload, _ := json.Marshal(map[string]any{"chips": []map[string]any{chip}})
	resp, err := http.Post(ts.URL+"/context/resolve", "application/json", bytes.NewReader(resolvePayload))
	if err != nil {
		t.Fatalf("context resolve request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("context resolve status = %d", resp.StatusCode)
	}
	var resolved struct {
		EstimatedToken int `json:"estimatedToken"`
		Chips          []struct {
			ID string `json:"id"`
		} `json:"chips"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&resolved); err != nil {
		t.Fatalf("decode resolved context: %v", err)
	}
	if resolved.EstimatedToken == 0 || len(resolved.Chips) != 1 {
		t.Fatalf("unexpected resolved context: %+v", resolved)
	}

	resp, err = http.Post(ts.URL+"/chat/sessions", "application/json", bytes.NewReader([]byte(`{}`)))
	if err != nil {
		t.Fatalf("chat session request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("chat session status = %d", resp.StatusCode)
	}
	var session struct {
		SessionID string `json:"sessionId"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&session); err != nil {
		t.Fatalf("decode chat session: %v", err)
	}
	if session.SessionID == "" {
		t.Fatal("expected session id")
	}

	resp, err = http.Get(ts.URL + "/chat/sessions/" + session.SessionID + "/events?question=Explain%20selection")
	if err != nil {
		t.Fatalf("chat events request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("chat events status = %d", resp.StatusCode)
	}
	if contentType := resp.Header.Get("Content-Type"); !strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("chat events content type = %q", contentType)
	}
	stream, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read chat stream: %v", err)
	}
	streamText := string(stream)
	for _, eventName := range []string{"event: tool", "event: delta", "event: done"} {
		if !strings.Contains(streamText, eventName) {
			t.Fatalf("missing %s in stream %q", eventName, streamText)
		}
	}

	answerPayload, _ := json.Marshal(map[string]any{
		"projectId": "mock-pocket-vibe",
		"sessionId": session.SessionID,
		"question":  "Explain selection",
		"answer":    "The context basket makes implicit context visible.",
		"anchors": []map[string]any{{
			"filePath":  "src/reader/context.ts",
			"startLine": 3,
			"endLine":   12,
		}},
	})
	resp, err = http.Post(ts.URL+"/saved-answers", "application/json", bytes.NewReader(answerPayload))
	if err != nil {
		t.Fatalf("create saved answer request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create saved answer status = %d", resp.StatusCode)
	}

	annotationPayload, _ := json.Marshal(map[string]any{
		"projectId": "mock-pocket-vibe",
		"range": map[string]any{
			"filePath":  "src/reader/context.ts",
			"startLine": 3,
			"endLine":   12,
		},
		"body": "This is the visible context handoff.",
	})
	resp, err = http.Post(ts.URL+"/annotations", "application/json", bytes.NewReader(annotationPayload))
	if err != nil {
		t.Fatalf("create annotation request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create annotation status = %d", resp.StatusCode)
	}

	resp, err = http.Get(ts.URL + "/saved-answers?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("list saved answers request failed: %v", err)
	}
	defer resp.Body.Close()
	var savedAnswers struct {
		SavedAnswers []struct {
			ID      string `json:"id"`
			Anchors []struct {
				FilePath string `json:"filePath"`
			} `json:"anchors"`
		} `json:"savedAnswers"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&savedAnswers); err != nil {
		t.Fatalf("decode saved answers: %v", err)
	}
	if len(savedAnswers.SavedAnswers) != 1 || len(savedAnswers.SavedAnswers[0].Anchors) != 1 {
		t.Fatalf("unexpected saved answers: %+v", savedAnswers)
	}

	resp, err = http.Get(ts.URL + "/annotations?projectId=mock-pocket-vibe")
	if err != nil {
		t.Fatalf("list annotations request failed: %v", err)
	}
	defer resp.Body.Close()
	var annotations struct {
		Annotations []struct {
			ID    string `json:"id"`
			Range struct {
				FilePath string `json:"filePath"`
			} `json:"range"`
		} `json:"annotations"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&annotations); err != nil {
		t.Fatalf("decode annotations: %v", err)
	}
	if len(annotations.Annotations) != 1 || annotations.Annotations[0].Range.FilePath != "src/reader/context.ts" {
		t.Fatalf("unexpected annotations: %+v", annotations)
	}
}
