package server

import (
	"net/http"
	"strings"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	chatmod "pocket-vibe-v3/services/core/internal/modules/chat"
	contextmod "pocket-vibe-v3/services/core/internal/modules/context"
	knowledgemod "pocket-vibe-v3/services/core/internal/modules/knowledge"
	readermmod "pocket-vibe-v3/services/core/internal/modules/reader"
	repomod "pocket-vibe-v3/services/core/internal/modules/repo"
	searchmod "pocket-vibe-v3/services/core/internal/modules/search"
)

// Handlers 持有所有模块服务的引用，HTTP handler 方法仅负责请求解析和响应写入，
// 不包含业务逻辑。业务逻辑全部委托给对应模块的 Service 接口。
type Handlers struct {
	Repo      repomod.RepoService
	Reader    readermmod.ReaderService
	Search    searchmod.SearchService
	Context   contextmod.ContextService
	Chat      chatmod.ChatService
	Knowledge knowledgemod.KnowledgeService
}

// handleHealth 返回服务健康状态和运行模式。
func (h *Handlers) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
		"mode":   "mock",
	})
}

// handleMockRepos 返回 walking skeleton 阶段的 mock 仓库列表。
func (h *Handlers) handleMockRepos(w http.ResponseWriter, r *http.Request) {
	repos, err := h.Repo.ListRepos(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrRepoPrivateOrUnreachable, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"repos": repos,
	})
}

// handleReaderPayload 根据 projectId 和 filePath 返回代码阅读器载荷。
func (h *Handlers) handleReaderPayload(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	filePath := r.URL.Query().Get("filePath")

	payload, err := h.Reader.GetPayload(r.Context(), projectID, filePath)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrIndexNotReady, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, payload)
}

// handleSearch 在指定仓库内执行全文本搜索。
func (h *Handlers) handleSearch(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	query := r.URL.Query().Get("query")

	resp, err := h.Search.Search(r.Context(), projectID, query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrIndexNotReady, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// handleContextResolve 将前端选中的 ContextChip 解析为结构化上下文。
func (h *Handlers) handleContextResolve(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Chips []contract.ContextChip `json:"chips"`
	}
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
		return
	}

	result, err := h.Context.Resolve(r.Context(), req.Chips)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrContextTooLarge, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// handleChatSessions 创建一个新的对话会话。
func (h *Handlers) handleChatSessions(w http.ResponseWriter, r *http.Request) {
	session, err := h.Chat.CreateSession(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, session)
}

// handleChatSessionSubroutes 路由对话会话的子路径（events 流式推送 / messages 同步消息）。
func (h *Handlers) handleChatSessionSubroutes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/chat/sessions/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 {
		writeError(w, http.StatusNotFound, contract.ErrNotFound, "Unknown chat route.")
		return
	}

	switch {
	case r.Method == http.MethodGet && parts[1] == "events":
		h.handleChatEvents(w, r, parts[0])
	case r.Method == http.MethodPost && parts[1] == "messages":
		h.handleChatMessage(w, r, parts[0])
	default:
		writeError(w, http.StatusNotFound, contract.ErrNotFound, "Unknown chat route.")
	}
}

// handleChatEvents 以 SSE 方式流式推送对话事件。
func (h *Handlers) handleChatEvents(w http.ResponseWriter, r *http.Request, sessionID string) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, contract.ErrStreamUnsupported, "SSE is not supported.")
		return
	}

	question := strings.TrimSpace(r.URL.Query().Get("question"))

	events, err := h.Chat.StreamEvents(r.Context(), sessionID, question)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for evt := range events {
		switch evt.Type {
		case contract.ChatEventTool:
			sendEvent(w, flusher, "tool", evt.Payload)
		case contract.ChatEventDelta:
			sendEvent(w, flusher, "delta", evt.Payload)
		case contract.ChatEventDone:
			sendEvent(w, flusher, "done", evt.Payload)
		}
	}
}

// handleChatMessage 发送一条消息到指定会话，返回同步的对话响应。
func (h *Handlers) handleChatMessage(w http.ResponseWriter, r *http.Request, sessionID string) {
	var req contract.ChatMessageRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
		return
	}

	resp, err := h.Chat.SendMessage(r.Context(), sessionID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// handleNotes 创建一篇学习笔记（内部委托 KnowledgeService.CreateNoteDocument）。
// POST /notes 端点保持前端兼容性，内部映射到知识模块的 NoteDocument 创建。
func (h *Handlers) handleNotes(w http.ResponseWriter, r *http.Request) {
	var req contract.CreateNoteDocumentRequest
	if err := readJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
		return
	}

	note, err := h.Knowledge.CreateNoteDocument(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, note)
}
