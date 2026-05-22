package server

import (
	"net/http"

	capabilitymod "pocket-vibe-v3/services/core/internal/modules/capability"
	chatmod "pocket-vibe-v3/services/core/internal/modules/chat"
	contextmod "pocket-vibe-v3/services/core/internal/modules/context"
	filemod "pocket-vibe-v3/services/core/internal/modules/file"
	knowledgemod "pocket-vibe-v3/services/core/internal/modules/knowledge"
	readermmod "pocket-vibe-v3/services/core/internal/modules/reader"
	repomod "pocket-vibe-v3/services/core/internal/modules/repo"
	searchmod "pocket-vibe-v3/services/core/internal/modules/search"
)

func New() http.Handler {
	files := &filemod.LocalFixtureService{}
	knowledge := knowledgemod.NewMemoryKnowledgeService()
	reader := &readermmod.FixtureReaderService{Files: files}
	search := &searchmod.FixtureSearchService{Files: files}

	h := &Handlers{
		Repo:       &repomod.FixtureRepoService{},
		Files:      files,
		Reader:     reader,
		Search:     search,
		Context:    &contextmod.MockContextService{},
		Chat:       &chatmod.MockChatService{},
		Knowledge:  knowledge,
		Capability: &capabilitymod.StaticService{},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", h.handleHealth)
	mux.HandleFunc("GET /mock/repos", h.handleMockRepos)
	mux.HandleFunc("GET /files/tree", h.handleFilesTree)
	mux.HandleFunc("GET /files/content", h.handleFileContent)
	mux.HandleFunc("GET /reader/payload", h.handleReaderPayload)
	mux.HandleFunc("GET /search", h.handleSearch)
	mux.HandleFunc("GET /capabilities", h.handleCapabilities)
	mux.HandleFunc("POST /context/resolve", h.handleContextResolve)
	mux.HandleFunc("POST /chat/sessions", h.handleChatSessions)
	mux.HandleFunc("/chat/sessions/", h.handleChatSessionSubroutes)
	mux.HandleFunc("/notes/", h.handleNoteSubroutes)
	mux.HandleFunc("/notes", h.handleNotes)
	mux.HandleFunc("/saved-answers", h.handleSavedAnswers)
	mux.HandleFunc("/annotations", h.handleAnnotations)

	return withCORS(withTraceID(withRequestLog(mux)))
}
