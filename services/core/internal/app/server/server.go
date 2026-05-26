package server

import (
	"net/http"

	authmod "pocket-vibe-v3/services/core/internal/modules/auth"
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
	authService := authmod.NewMemoryAuthService()
	files := &filemod.LocalFixtureService{}
	knowledge := knowledgemod.NewMemoryKnowledgeService()
	reader := &readermmod.FixtureReaderService{Files: files}
	search := &searchmod.FixtureSearchService{Files: files}

	h := &Handlers{
		Auth:       authService,
		Repo:       &repomod.FixtureRepoService{},
		Files:      files,
		Reader:     reader,
		Search:     search,
		Context:    &contextmod.MockContextService{},
		Chat:       &chatmod.MockChatService{},
		Knowledge:  knowledge,
		Capability: &capabilitymod.StaticService{},
	}

	// 公开路由（不需要认证）
	publicMux := http.NewServeMux()
	publicMux.HandleFunc("GET /health", h.handleHealth)
	publicMux.HandleFunc("POST /auth/login", h.handleLogin)

	// 需认证路由
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("POST /auth/logout", h.handleLogout)
	protectedMux.HandleFunc("GET /auth/me", h.handleMe)
	protectedMux.HandleFunc("GET /mock/repos", h.handleMockRepos)
	protectedMux.HandleFunc("GET /files/tree", h.handleFilesTree)
	protectedMux.HandleFunc("GET /files/content", h.handleFileContent)
	protectedMux.HandleFunc("GET /reader/payload", h.handleReaderPayload)
	protectedMux.HandleFunc("GET /search", h.handleSearch)
	protectedMux.HandleFunc("GET /capabilities", h.handleCapabilities)
	protectedMux.HandleFunc("POST /context/resolve", h.handleContextResolve)
	protectedMux.HandleFunc("POST /chat/sessions", h.handleChatSessions)
	protectedMux.HandleFunc("/chat/sessions/", h.handleChatSessionSubroutes)
	protectedMux.HandleFunc("/notes/", h.handleNoteSubroutes)
	protectedMux.HandleFunc("/notes", h.handleNotes)
	protectedMux.HandleFunc("/saved-answers", h.handleSavedAnswers)
	protectedMux.HandleFunc("/annotations", h.handleAnnotations)

	// 中间件链：CORS -> TraceID -> RequestLog
	// 认证路由额外包裹 withAuth
	protectedHandler := withAuth(authService, true)(protectedMux)

	return withCORS(withTraceID(withRequestLog(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if matchRoute(publicMux, r) {
			publicMux.ServeHTTP(w, r)
			return
		}
		protectedHandler.ServeHTTP(w, r)
	}))))
}

// matchRoute 检查请求是否能被 mux 匹配到已注册路由。
func matchRoute(mux *http.ServeMux, r *http.Request) bool {
	_, pattern := mux.Handler(r)
	return pattern != ""
}
