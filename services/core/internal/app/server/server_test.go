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

// loginHelper 执行登录并返回 Bearer token。
func loginHelper(t *testing.T, ts *httptest.Server) string {
	t.Helper()
	body, _ := json.Marshal(map[string]string{"username": "demo", "password": "demo"})
	resp, err := http.Post(ts.URL+"/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("login request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("login status = %d", resp.StatusCode)
	}
	var loginResp struct {
		Session struct {
			Token string `json:"token"`
		} `json:"session"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		t.Fatalf("decode login response: %v", err)
	}
	if loginResp.Session.Token == "" {
		t.Fatal("expected session token")
	}
	return loginResp.Session.Token
}

// authGet 发送带 Bearer token 的 GET 请求。
func authGet(t *testing.T, url string, token string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		t.Fatalf("create request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	return resp
}

// authPost 发送带 Bearer token 的 POST 请求。
func authPost(t *testing.T, url string, token string, payload []byte) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		t.Fatalf("create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	return resp
}

func TestHealthIsPublic(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/health")
	if err != nil {
		t.Fatalf("health request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("health status = %d", resp.StatusCode)
	}
}

func TestLoginSuccess(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	token := loginHelper(t, ts)
	if token == "" {
		t.Fatal("expected non-empty token")
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	body, _ := json.Marshal(map[string]string{"username": "demo", "password": "wrong"})
	resp, err := http.Post(ts.URL+"/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("login request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

func TestProtectedRouteRequiresAuth(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/mock/repos")
	if err != nil {
		t.Fatalf("repos request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 without token, got %d", resp.StatusCode)
	}

	var apiErr struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiErr); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if apiErr.Error.Code != "AUTH_REQUIRED" {
		t.Fatalf("expected AUTH_REQUIRED, got %q", apiErr.Error.Code)
	}
}

func TestAuthMeEndpoint(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	token := loginHelper(t, ts)
	resp := authGet(t, ts.URL+"/auth/me", token)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("me status = %d", resp.StatusCode)
	}
	var user struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		t.Fatalf("decode user: %v", err)
	}
	if user.Username != "demo" {
		t.Fatalf("expected username demo, got %q", user.Username)
	}
}

func TestLogout(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()

	token := loginHelper(t, ts)

	req, _ := http.NewRequest(http.MethodPost, ts.URL+"/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("logout request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("logout status = %d", resp.StatusCode)
	}

	// token should be invalid after logout
	resp2 := authGet(t, ts.URL+"/auth/me", token)
	defer resp2.Body.Close()
	if resp2.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 after logout, got %d", resp2.StatusCode)
	}
}

func TestFilesAndCapabilitiesEndpoints(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()
	token := loginHelper(t, ts)

	resp := authGet(t, ts.URL+"/files/tree?projectId=mock-pocket-vibe", token)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("files/tree status = %d", resp.StatusCode)
	}
	if resp.Header.Get("X-Trace-Id") == "" {
		t.Fatal("expected X-Trace-Id header")
	}

	resp2 := authGet(t, ts.URL+"/capabilities?projectId=mock-pocket-vibe", token)
	defer resp2.Body.Close()
	if resp2.StatusCode != http.StatusOK {
		t.Fatalf("capabilities status = %d", resp2.StatusCode)
	}
}

func TestNotesLoopAndTraceIDError(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()
	token := loginHelper(t, ts)

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
	resp := authPost(t, ts.URL+"/notes", token, payload)
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

	resp2 := authGet(t, ts.URL+"/notes?projectId=mock-pocket-vibe", token)
	defer resp2.Body.Close()
	if resp2.StatusCode != http.StatusOK {
		t.Fatalf("list notes status = %d", resp2.StatusCode)
	}

	resp3 := authGet(t, ts.URL+"/notes/note_missing?projectId=mock-pocket-vibe", token)
	defer resp3.Body.Close()
	if resp3.StatusCode != http.StatusNotFound {
		t.Fatalf("missing note status = %d", resp3.StatusCode)
	}
	var apiErr struct {
		Error struct {
			TraceID string `json:"traceId"`
		} `json:"error"`
	}
	if err := json.NewDecoder(resp3.Body).Decode(&apiErr); err != nil {
		t.Fatalf("decode error payload: %v", err)
	}
	if apiErr.Error.TraceID == "" {
		t.Fatal("expected trace id in error response")
	}
}

func TestInvalidFilePathReturnsBadRequest(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()
	token := loginHelper(t, ts)

	resp := authGet(t, ts.URL+"/files/content?projectId=mock-pocket-vibe&filePath=../secret.txt", token)
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
	token := loginHelper(t, ts)

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
	resp := authPost(t, ts.URL+"/context/resolve", token, resolvePayload)
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

	resp2 := authPost(t, ts.URL+"/chat/sessions", token, []byte(`{}`))
	defer resp2.Body.Close()
	if resp2.StatusCode != http.StatusCreated {
		t.Fatalf("chat session status = %d", resp2.StatusCode)
	}
	var session struct {
		SessionID string `json:"sessionId"`
	}
	if err := json.NewDecoder(resp2.Body).Decode(&session); err != nil {
		t.Fatalf("decode chat session: %v", err)
	}
	if session.SessionID == "" {
		t.Fatal("expected session id")
	}

	resp3 := authGet(t, ts.URL+"/chat/sessions/"+session.SessionID+"/events?question=Explain%20selection", token)
	defer resp3.Body.Close()
	if resp3.StatusCode != http.StatusOK {
		t.Fatalf("chat events status = %d", resp3.StatusCode)
	}
	if contentType := resp3.Header.Get("Content-Type"); !strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("chat events content type = %q", contentType)
	}
	stream, err := io.ReadAll(resp3.Body)
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
	resp4 := authPost(t, ts.URL+"/saved-answers", token, answerPayload)
	defer resp4.Body.Close()
	if resp4.StatusCode != http.StatusCreated {
		t.Fatalf("create saved answer status = %d", resp4.StatusCode)
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
	resp5 := authPost(t, ts.URL+"/annotations", token, annotationPayload)
	defer resp5.Body.Close()
	if resp5.StatusCode != http.StatusCreated {
		t.Fatalf("create annotation status = %d", resp5.StatusCode)
	}

	resp6 := authGet(t, ts.URL+"/saved-answers?projectId=mock-pocket-vibe", token)
	defer resp6.Body.Close()
	var savedAnswers struct {
		SavedAnswers []struct {
			ID      string `json:"id"`
			Anchors []struct {
				FilePath string `json:"filePath"`
			} `json:"anchors"`
		} `json:"savedAnswers"`
	}
	if err := json.NewDecoder(resp6.Body).Decode(&savedAnswers); err != nil {
		t.Fatalf("decode saved answers: %v", err)
	}
	if len(savedAnswers.SavedAnswers) != 1 || len(savedAnswers.SavedAnswers[0].Anchors) != 1 {
		t.Fatalf("unexpected saved answers: %+v", savedAnswers)
	}

	resp7 := authGet(t, ts.URL+"/annotations?projectId=mock-pocket-vibe", token)
	defer resp7.Body.Close()
	var annotations struct {
		Annotations []struct {
			ID    string `json:"id"`
			Range struct {
				FilePath string `json:"filePath"`
			} `json:"range"`
		} `json:"annotations"`
	}
	if err := json.NewDecoder(resp7.Body).Decode(&annotations); err != nil {
		t.Fatalf("decode annotations: %v", err)
	}
	if len(annotations.Annotations) != 1 || annotations.Annotations[0].Range.FilePath != "src/reader/context.ts" {
		t.Fatalf("unexpected annotations: %+v", annotations)
	}
}

func TestMockReposWithAuth(t *testing.T) {
	ts := httptest.NewServer(New())
	defer ts.Close()
	token := loginHelper(t, ts)

	resp := authGet(t, ts.URL+"/mock/repos", token)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("mock repos status = %d", resp.StatusCode)
	}
	var result struct {
		Repos []struct {
			ID     string `json:"id"`
			Source string `json:"source"`
		} `json:"repos"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("decode repos: %v", err)
	}
	if len(result.Repos) != 1 || result.Repos[0].ID != "mock-pocket-vibe" {
		t.Fatalf("unexpected repos: %+v", result.Repos)
	}
	if result.Repos[0].Source != "fixture" {
		t.Fatalf("expected source fixture, got %q", result.Repos[0].Source)
	}
}
