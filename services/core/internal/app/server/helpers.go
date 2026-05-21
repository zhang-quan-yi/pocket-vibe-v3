package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// readJSON 从 HTTP 请求体解码 JSON 到目标结构体，自动关闭请求体。
func readJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(target)
}

// writeJSON 将载荷以 JSON 格式写入 HTTP 响应，设置 Content-Type 和状态码。
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("write json failed: %v", err)
	}
}

// writeError 写入结构化错误响应，符合 ApiError 模型。
func writeError(w http.ResponseWriter, status int, code string, message string) {
	apiErr := contract.NewApiError(code, message, false)
	writeJSON(w, status, map[string]any{
		"error": apiErr,
	})
}

// sendEvent 向 SSE 流写入一个事件，包含事件名和载荷，并立即刷新缓冲区。
func sendEvent(w http.ResponseWriter, flusher http.Flusher, event string, payload any) {
	data, err := json.Marshal(payload)
	if err != nil {
		data = []byte(`{"error":"marshal failed"}`)
	}
	fmt.Fprintf(w, "event: %s\n", event)
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}
