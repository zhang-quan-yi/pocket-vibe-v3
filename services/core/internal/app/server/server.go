package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type Repo struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	RecommendedFile string `json:"recommendedFile"`
}

type SourceRange struct {
	FilePath  string `json:"filePath"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
}

type CodeLine struct {
	Number int    `json:"number"`
	Text   string `json:"text"`
}

type SymbolRef struct {
	Name  string      `json:"name"`
	Kind  string      `json:"kind"`
	Range SourceRange `json:"range"`
}

type ReaderPayload struct {
	ProjectID          string      `json:"projectId"`
	FilePath           string      `json:"filePath"`
	Language           string      `json:"language"`
	Lines              []CodeLine  `json:"lines"`
	Symbols            []SymbolRef `json:"symbols"`
	SuggestedSelection SourceRange `json:"suggestedSelection"`
}

type SearchResult struct {
	FilePath string      `json:"filePath"`
	Line     int         `json:"line"`
	Preview  string      `json:"preview"`
	Range    SourceRange `json:"range"`
}

type ContextChip struct {
	ID      string      `json:"id"`
	Kind    string      `json:"kind"`
	Label   string      `json:"label"`
	Summary string      `json:"summary"`
	Range   SourceRange `json:"range"`
}

type ResolvedContext struct {
	Chips          []ContextChip `json:"chips"`
	EstimatedToken int           `json:"estimatedToken"`
	Warnings       []string      `json:"warnings"`
}

type ChatSession struct {
	SessionID string `json:"sessionId"`
	CreatedAt string `json:"createdAt"`
}

type Note struct {
	ID        string        `json:"id"`
	Title     string        `json:"title"`
	Body      string        `json:"body"`
	Anchors   []SourceRange `json:"anchors"`
	CreatedAt string        `json:"createdAt"`
}

type noteRequest struct {
	Title   string        `json:"title"`
	Body    string        `json:"body"`
	Anchors []SourceRange `json:"anchors"`
}

type contextRequest struct {
	Chips []ContextChip `json:"chips"`
}

type chatMessageRequest struct {
	Question string        `json:"question"`
	Context  []ContextChip `json:"context"`
}

var mockRepo = Repo{
	ID:              "mock-pocket-vibe",
	Name:            "pocket-vibe-mock",
	Description:     "A tiny source-reading fixture for the Read -> Ask -> Save skeleton.",
	RecommendedFile: "src/reader/context.ts",
}

var mockLines = []string{
	"import type { ContextChip, SourceRange } from './types';",
	"",
	"export function buildContextBasket(selection: SourceRange): ContextChip[] {",
	"  const baseChip: ContextChip = {",
	"    id: `selection:${selection.filePath}:${selection.startLine}` ,",
	"    kind: 'selection',",
	"    label: `Lines ${selection.startLine}-${selection.endLine}` ,",
	"    source: selection,",
	"  };",
	"",
	"  return [baseChip, createReaderTrailChip(selection.filePath)];",
	"}",
	"",
	"function createReaderTrailChip(filePath: string): ContextChip {",
	"  return {",
	"    id: `trail:${filePath}` ,",
	"    kind: 'readingTrail',",
	"    label: 'Current reading trail',",
	"    source: { filePath, startLine: 1, endLine: 1 },",
	"  };",
	"}",
}

func New() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("GET /mock/repos", handleMockRepos)
	mux.HandleFunc("GET /reader/payload", handleReaderPayload)
	mux.HandleFunc("GET /search", handleSearch)
	mux.HandleFunc("POST /context/resolve", handleContextResolve)
	mux.HandleFunc("POST /chat/sessions", handleChatSessions)
	mux.HandleFunc("/chat/sessions/", handleChatSessionSubroutes)
	mux.HandleFunc("POST /notes", handleNotes)

	return withCORS(withRequestLog(mux))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"mode":   "mock",
	})
}

func handleMockRepos(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"repos": []Repo{mockRepo},
	})
}

func handleReaderPayload(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("filePath")
	if filePath == "" {
		filePath = mockRepo.RecommendedFile
	}

	payload := ReaderPayload{
		ProjectID: mockRepo.ID,
		FilePath:  filePath,
		Language:  "typescript",
		Lines:     toCodeLines(mockLines),
		Symbols: []SymbolRef{
			{
				Name:  "buildContextBasket",
				Kind:  "function",
				Range: SourceRange{FilePath: filePath, StartLine: 3, EndLine: 12},
			},
			{
				Name:  "createReaderTrailChip",
				Kind:  "function",
				Range: SourceRange{FilePath: filePath, StartLine: 14, EndLine: 21},
			},
		},
		SuggestedSelection: SourceRange{FilePath: filePath, StartLine: 3, EndLine: 12},
	}

	writeJSON(w, http.StatusOK, payload)
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(strings.ToLower(r.URL.Query().Get("query")))
	if query == "" {
		query = "context"
	}

	results := make([]SearchResult, 0)
	for i, line := range mockLines {
		if strings.Contains(strings.ToLower(line), query) {
			lineNo := i + 1
			results = append(results, SearchResult{
				FilePath: mockRepo.RecommendedFile,
				Line:     lineNo,
				Preview:  strings.TrimSpace(line),
				Range: SourceRange{
					FilePath:  mockRepo.RecommendedFile,
					StartLine: lineNo,
					EndLine:   lineNo,
				},
			})
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"query":   query,
		"results": results,
	})
}

func handleContextResolve(w http.ResponseWriter, r *http.Request) {
	var req contextRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", err.Error())
		return
	}

	warnings := make([]string, 0)
	if len(req.Chips) == 0 {
		warnings = append(warnings, "No context chips were selected.")
	}

	writeJSON(w, http.StatusOK, ResolvedContext{
		Chips:          req.Chips,
		EstimatedToken: 160 + len(req.Chips)*80,
		Warnings:       warnings,
	})
}

func handleChatSessions(w http.ResponseWriter, r *http.Request) {
	session := ChatSession{
		SessionID: "chat_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	writeJSON(w, http.StatusCreated, session)
}

func handleChatSessionSubroutes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/chat/sessions/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "Unknown chat route.")
		return
	}

	switch {
	case r.Method == http.MethodGet && parts[1] == "events":
		handleChatEvents(w, r, parts[0])
	case r.Method == http.MethodPost && parts[1] == "messages":
		handleChatMessage(w, r, parts[0])
	default:
		writeError(w, http.StatusNotFound, "NOT_FOUND", "Unknown chat route.")
	}
}

func handleChatEvents(w http.ResponseWriter, r *http.Request, sessionID string) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "STREAM_UNSUPPORTED", "SSE is not supported.")
		return
	}

	question := strings.TrimSpace(r.URL.Query().Get("question"))
	if question == "" {
		question = "Explain this code."
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	sendEvent(w, flusher, "tool", map[string]any{
		"sessionId": sessionID,
		"name":      "read_file",
		"summary":   "Reading src/reader/context.ts around the selected range.",
	})
	time.Sleep(180 * time.Millisecond)
	sendEvent(w, flusher, "tool", map[string]any{
		"sessionId": sessionID,
		"name":      "resolve_context",
		"summary":   "Resolving selected lines plus current reading trail.",
	})

	chunks := []string{
		"The selected code builds a small context basket from the current source range. ",
		"It creates one explicit selection chip, then adds a reading-trail chip so the AI can keep the local navigation path in mind. ",
		"For the MVP, this is exactly the trust layer we need: the user can see what context will be sent before asking.",
	}
	for _, chunk := range chunks {
		time.Sleep(220 * time.Millisecond)
		sendEvent(w, flusher, "delta", map[string]string{"text": chunk})
	}

	sendEvent(w, flusher, "done", map[string]any{
		"source": SourceRange{FilePath: mockRepo.RecommendedFile, StartLine: 3, EndLine: 12},
	})
}

func handleChatMessage(w http.ResponseWriter, r *http.Request, sessionID string) {
	var req chatMessageRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"sessionId": sessionID,
		"answer":    "The selected code creates visible context chips, then uses them as the source of truth for the AI request.",
		"toolCalls": []map[string]string{
			{"name": "read_file", "status": "completed"},
			{"name": "resolve_context", "status": "completed"},
		},
	})
}

func handleNotes(w http.ResponseWriter, r *http.Request) {
	var req noteRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", err.Error())
		return
	}
	if strings.TrimSpace(req.Title) == "" {
		req.Title = "Context basket explanation"
	}

	note := Note{
		ID:        "note_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		Title:     req.Title,
		Body:      req.Body,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	writeJSON(w, http.StatusCreated, note)
}

func toCodeLines(lines []string) []CodeLine {
	result := make([]CodeLine, len(lines))
	for i, line := range lines {
		result[i] = CodeLine{Number: i + 1, Text: line}
	}
	return result
}

func sendEvent(w http.ResponseWriter, flusher http.Flusher, event string, payload any) {
	data, err := json.Marshal(payload)
	if err != nil {
		data = []byte(`{"error":"marshal failed"}`)
	}
	fmt.Fprintf(w, "event: %s\n", event)
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}

func readJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(target)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json failed: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, map[string]any{
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

func withRequestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
