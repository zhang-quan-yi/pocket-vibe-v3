package server

import (
	"errors"
	"net/http"
	"regexp"
	"strings"

	capabilitymod "pocket-vibe-v3/services/core/internal/modules/capability"
	chatmod "pocket-vibe-v3/services/core/internal/modules/chat"
	contextmod "pocket-vibe-v3/services/core/internal/modules/context"
	filemod "pocket-vibe-v3/services/core/internal/modules/file"
	knowledgemod "pocket-vibe-v3/services/core/internal/modules/knowledge"
	readermmod "pocket-vibe-v3/services/core/internal/modules/reader"
	repomod "pocket-vibe-v3/services/core/internal/modules/repo"
	searchmod "pocket-vibe-v3/services/core/internal/modules/search"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

type Handlers struct {
	Repo       repomod.RepoService
	Files      filemod.Service
	Reader     readermmod.ReaderService
	Search     searchmod.SearchService
	Context    contextmod.ContextService
	Chat       chatmod.ChatService
	Knowledge  knowledgemod.KnowledgeService
	Capability capabilitymod.Service
}

var noteIDPattern = regexp.MustCompile(`^note_[a-z0-9]+$`)

func (h *Handlers) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "mode": "mock"})
}

func (h *Handlers) handleMockRepos(w http.ResponseWriter, r *http.Request) {
	repos, err := h.Repo.ListRepos(r.Context())
	if err != nil {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrRepoPrivateOrUnreachable, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"repos": repos})
}

func (h *Handlers) handleFilesTree(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	tree, err := h.Files.ListTree(r.Context(), projectID)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"projectId": projectID, "tree": tree})
}

func (h *Handlers) handleFileContent(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	filePath := r.URL.Query().Get("filePath")
	content, err := h.Files.GetContent(r.Context(), projectID, filePath)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, content)
}

func (h *Handlers) handleReaderPayload(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	filePath := r.URL.Query().Get("filePath")
	payload, err := h.Reader.GetPayload(r.Context(), projectID, filePath)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, payload)
}

func (h *Handlers) handleSearch(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	query := r.URL.Query().Get("query")
	resp, err := h.Search.Search(r.Context(), projectID, query)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *Handlers) handleCapabilities(w http.ResponseWriter, r *http.Request) {
	projectID := r.URL.Query().Get("projectId")
	resp, err := h.Capability.GetProjectCapabilities(r.Context(), projectID)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *Handlers) handleContextResolve(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Chips []contract.ContextChip `json:"chips"`
	}
	if err := readJSON(r, &req); err != nil {
		writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
		return
	}
	result, err := h.Context.Resolve(r.Context(), req.Chips)
	if err != nil {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrContextTooLarge, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handlers) handleChatSessions(w http.ResponseWriter, r *http.Request) {
	session, err := h.Chat.CreateSession(r.Context())
	if err != nil {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, session)
}

func (h *Handlers) handleChatSessionSubroutes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/chat/sessions/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 {
		writeRequestError(w, r, http.StatusNotFound, contract.ErrNotFound, "Unknown chat route.")
		return
	}
	switch {
	case r.Method == http.MethodGet && parts[1] == "events":
		h.handleChatEvents(w, r, parts[0])
	case r.Method == http.MethodPost && parts[1] == "messages":
		h.handleChatMessage(w, r, parts[0])
	default:
		writeRequestError(w, r, http.StatusNotFound, contract.ErrNotFound, "Unknown chat route.")
	}
}

func (h *Handlers) handleChatEvents(w http.ResponseWriter, r *http.Request, sessionID string) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrStreamUnsupported, "SSE is not supported.")
		return
	}
	question := strings.TrimSpace(r.URL.Query().Get("question"))
	events, err := h.Chat.StreamEvents(r.Context(), sessionID, question)
	if err != nil {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
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

func (h *Handlers) handleChatMessage(w http.ResponseWriter, r *http.Request, sessionID string) {
	var req contract.ChatMessageRequest
	if err := readJSON(r, &req); err != nil {
		writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
		return
	}
	resp, err := h.Chat.SendMessage(r.Context(), sessionID, req)
	if err != nil {
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *Handlers) handleNotes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var req contract.CreateNoteDocumentRequest
		if err := readJSON(r, &req); err != nil {
			writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
			return
		}
		note, err := h.Knowledge.CreateNoteDocument(r.Context(), req)
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, note)
	case http.MethodGet:
		projectID := r.URL.Query().Get("projectId")
		notes, err := h.Knowledge.ListNoteDocuments(r.Context(), projectID)
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"notes": notes})
	default:
		writeRequestError(w, r, http.StatusMethodNotAllowed, contract.ErrNotFound, "Method not allowed.")
	}
}

func (h *Handlers) handleNoteSubroutes(w http.ResponseWriter, r *http.Request) {
	noteID := strings.TrimPrefix(r.URL.Path, "/notes/")
	if noteID == "" || strings.Contains(noteID, "/") {
		writeRequestError(w, r, http.StatusNotFound, contract.ErrNotFound, "Unknown note route.")
		return
	}
	if !noteIDPattern.MatchString(noteID) {
		writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadRequest, "Invalid note ID.")
		return
	}
	note, err := h.Knowledge.GetNoteDocument(r.Context(), r.URL.Query().Get("projectId"), noteID)
	if err != nil {
		h.writeServiceError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, note)
}

func (h *Handlers) handleSavedAnswers(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var req contract.CreateSavedAnswerRequest
		if err := readJSON(r, &req); err != nil {
			writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
			return
		}
		answer, err := h.Knowledge.CreateSavedAnswer(r.Context(), req)
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, answer)
	case http.MethodGet:
		answers, err := h.Knowledge.ListSavedAnswers(r.Context(), r.URL.Query().Get("projectId"))
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"savedAnswers": answers})
	default:
		writeRequestError(w, r, http.StatusMethodNotAllowed, contract.ErrNotFound, "Method not allowed.")
	}
}

func (h *Handlers) handleAnnotations(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var req contract.CreateAnnotationRequest
		if err := readJSON(r, &req); err != nil {
			writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
			return
		}
		annotation, err := h.Knowledge.CreateAnnotation(r.Context(), req)
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, annotation)
	case http.MethodGet:
		annotations, err := h.Knowledge.ListAnnotations(r.Context(), r.URL.Query().Get("projectId"))
		if err != nil {
			writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"annotations": annotations})
	default:
		writeRequestError(w, r, http.StatusMethodNotAllowed, contract.ErrNotFound, "Method not allowed.")
	}
}

func (h *Handlers) writeServiceError(w http.ResponseWriter, r *http.Request, err error) {
	switch {
	case errors.Is(err, serviceerrors.ErrProjectNotFound), errors.Is(err, serviceerrors.ErrFileNotFound), errors.Is(err, serviceerrors.ErrNoteNotFound):
		writeRequestError(w, r, http.StatusNotFound, contract.ErrNotFound, err.Error())
	case errors.Is(err, serviceerrors.ErrInvalidFilePath):
		writeRequestError(w, r, http.StatusBadRequest, contract.ErrBadJSON, err.Error())
	default:
		writeRequestError(w, r, http.StatusInternalServerError, contract.ErrModelProviderError, err.Error())
	}
}
