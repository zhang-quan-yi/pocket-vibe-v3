package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

func readJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json failed: %v", err)
	}
}

func writeRequestError(w http.ResponseWriter, r *http.Request, status int, code string, message string) {
	apiErr := contract.NewApiError(code, message, false)
	apiErr.TraceID = traceIDFromContext(r.Context())
	writeJSON(w, status, map[string]any{"error": apiErr})
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
