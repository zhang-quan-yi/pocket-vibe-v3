// Package server 提供 Pocket Vibe 后端 Core API 的 HTTP 服务入口。
// New() 创建 mock 服务实例、构造 Handlers 并注册路由。
// 函数签名保持 func New() http.Handler 不变，main.go 无需修改。
package server

import (
	"net/http"

	chatmod "pocket-vibe-v3/services/core/internal/modules/chat"
	contextmod "pocket-vibe-v3/services/core/internal/modules/context"
	knowledgemod "pocket-vibe-v3/services/core/internal/modules/knowledge"
	readermmod "pocket-vibe-v3/services/core/internal/modules/reader"
	repomod "pocket-vibe-v3/services/core/internal/modules/repo"
	searchmod "pocket-vibe-v3/services/core/internal/modules/search"
)

// New 创建并返回配置好路由的 HTTP Handler。
// 创建 mock 服务实例，构造 Handlers，注册所有 API 路由，
// 并应用 CORS 和请求日志中间件。
func New() http.Handler {
	// 创建各模块的 mock 服务实例
	h := &Handlers{
		Repo:      &repomod.MockRepoService{},
		Reader:    &readermmod.MockReaderService{},
		Search:    &searchmod.MockSearchService{},
		Context:   &contextmod.MockContextService{},
		Chat:      &chatmod.MockChatService{},
		Knowledge: &knowledgemod.MockKnowledgeService{},
	}

	mux := http.NewServeMux()

	// 健康检查
	mux.HandleFunc("GET /health", h.handleHealth)

	// 仓库模块：mock 仓库列表
	mux.HandleFunc("GET /mock/repos", h.handleMockRepos)

	// 阅读器模块：代码阅读器载荷
	mux.HandleFunc("GET /reader/payload", h.handleReaderPayload)

	// 搜索模块：全文本搜索
	mux.HandleFunc("GET /search", h.handleSearch)

	// 上下文模块：Context Basket 芯片解析
	mux.HandleFunc("POST /context/resolve", h.handleContextResolve)

	// 对话模块：会话创建、流式事件和同步消息
	mux.HandleFunc("POST /chat/sessions", h.handleChatSessions)
	mux.HandleFunc("/chat/sessions/", h.handleChatSessionSubroutes)

	// 知识模块：学习笔记创建（POST /notes 保持前端兼容性）
	mux.HandleFunc("POST /notes", h.handleNotes)

	return withCORS(withRequestLog(mux))
}
