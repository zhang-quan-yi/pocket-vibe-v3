// Package contract 定义后端所有平台无关的共享数据传输对象（DTO）。
// 这些类型是 API contract 的权威来源，可供 Web/PWA、Android 和 HarmonyOS 复用。
// 不允许混入 DOM、CodeMirror、浏览器 URL hash、scroll pixel 或框架私有状态。
package contract

// Repo 表示一个代码仓库的元数据。
// 后端拥有仓库的全生命周期：校验 URL、排队克隆任务、维护元数据、清理存储。
type Repo struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	RecommendedFile string `json:"recommendedFile"`
}

// SourceRange 表示源码中的行范围，是产品核心共享模型。
// 用于标记选区、符号引用、锚点、搜索结果等所有需要源码定位的场景。
type SourceRange struct {
	FilePath  string `json:"filePath"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
}

// CodeLine 表示带行号的源码行，用于 ReaderPayload 中的文件内容展示。
type CodeLine struct {
	Number int    `json:"number"`
	Text   string `json:"text"`
}

// SymbolRef 表示代码符号引用，如函数、类、变量等。
// 由后端索引服务生成，前端用于符号导航和上下文芯片构建。
type SymbolRef struct {
	Name  string      `json:"name"`
	Kind  string      `json:"kind"`
	Range SourceRange `json:"range"`
}

// ReaderPayload 是代码阅读器的核心数据载荷，由后端生成、前端和未来原生端消费。
// 包含文件内容、符号引用、推荐选区等平台无关信息，不含 CodeMirror 或 DOM 状态。
type ReaderPayload struct {
	ProjectID          string      `json:"projectId"`
	FilePath           string      `json:"filePath"`
	Language           string      `json:"language"`
	Lines              []CodeLine  `json:"lines"`
	Symbols            []SymbolRef `json:"symbols"`
	SuggestedSelection SourceRange `json:"suggestedSelection"`
}

// SearchResult 表示一条搜索匹配结果。
// 包含文件路径、行号、预览文本和源码范围，供前端搜索结果列表和预览面板消费。
type SearchResult struct {
	FilePath string      `json:"filePath"`
	Line     int         `json:"line"`
	Preview  string      `json:"preview"`
	Range    SourceRange `json:"range"`
}

// SearchResponse 是搜索接口的响应体，包含查询词、结果列表和截断标记。
type SearchResponse struct {
	Query    string         `json:"query"`
	Results  []SearchResult `json:"results"`
	Truncated bool          `json:"truncated,omitempty"`
}

// ContextChip 表示 Context Basket 中的一枚上下文芯片。
// 前端创建和展示，后端解析为真实上下文后发送给 Agent。
// 芯片种类包括：selection、readingTrail、definition、references、searchResult 等。
type ContextChip struct {
	ID      string      `json:"id"`
	Kind    string      `json:"kind"`
	Label   string      `json:"label"`
	Summary string      `json:"summary"`
	Range   SourceRange `json:"range"`
}

// ResolvedContext 是上下文解析的结果，包含解析后的芯片、token 估算和警告。
// 由 ContextResolver 服务生成，供前端展示发送预览，供 Agent 消费结构化上下文。
type ResolvedContext struct {
	Chips          []ContextChip `json:"chips"`
	EstimatedToken int           `json:"estimatedToken"`
	Warnings       []string      `json:"warnings"`
}

// ChatSession 表示一个 AI 对话会话。
// 后端拥有会话的持久化和生命周期管理，前端负责会话的渲染和交互。
type ChatSession struct {
	SessionID string `json:"sessionId"`
	CreatedAt string `json:"createdAt"`
}

// ChatEventType 表示对话事件的类型，用于 SSE 流式推送。
type ChatEventType string

const (
	// ChatEventTool 表示 Agent 工具调用事件（如 readFile、resolveContext）。
	ChatEventTool ChatEventType = "tool"
	// ChatEventDelta 表示 AI 回答的文本增量片段。
	ChatEventDelta ChatEventType = "delta"
	// ChatEventDone 表示对话流式推送完成，携带最终源码范围。
	ChatEventDone ChatEventType = "done"
)

// ChatEvent 表示 SSE 流中的一个对话事件。
// 工具事件包含工具名和摘要，增量事件包含文本片段，完成事件包含最终源码范围。
type ChatEvent struct {
	Type    ChatEventType `json:"type"`
	Payload any           `json:"payload"`
}

// ChatToolPayload 是工具调用事件的载荷，包含工具名和执行摘要。
type ChatToolPayload struct {
	SessionID string `json:"sessionId"`
	Name      string `json:"name"`
	Summary   string `json:"summary"`
}

// ChatDeltaPayload 是文本增量事件的载荷，包含一段 AI 回答文本。
type ChatDeltaPayload struct {
	Text string `json:"text"`
}

// ChatDonePayload 是对话完成事件的载荷，包含回答涉及的源码范围。
type ChatDonePayload struct {
	Source SourceRange `json:"source"`
}

// ChatMessageRequest 是发送对话消息的请求体，包含用户问题和上下文芯片。
type ChatMessageRequest struct {
	Question string        `json:"question"`
	Context  []ContextChip `json:"context"`
}

// ChatMessageResponse 是同步对话消息的响应体，包含 AI 回答和工具调用日志摘要。
type ChatMessageResponse struct {
	SessionID string                    `json:"sessionId"`
	Answer    string                    `json:"answer"`
	ToolCalls []map[string]string       `json:"toolCalls"`
}

// NoteDocument 表示整理型 Markdown 学习笔记，是知识模块的核心概念之一。
// 当前 walking skeleton 中的 Note 对应此类型，POST /notes 端点内部创建 NoteDocument。
// 所有笔记都必须携带源码锚点（Anchors），支持从笔记跳转回源码位置。
type NoteDocument struct {
	ID        string        `json:"id"`
	Title     string        `json:"title"`
	Body      string        `json:"body"`
	Anchors   []SourceRange `json:"anchors"`
	CreatedAt string        `json:"createdAt"`
}

// CreateNoteDocumentRequest 是创建学习笔记的请求体。
type CreateNoteDocumentRequest struct {
	Title   string        `json:"title"`
	Body    string        `json:"body"`
	Anchors []SourceRange `json:"anchors"`
}

// SavedAnswer 表示保存的 AI 回答，附带上下的 Context Basket 芯片和源码引用。
// TODO(Slice-6): 实现 SavedAnswer 的完整 CRUD 和 Anchor 绑定。
type SavedAnswer struct {
	ID        string        `json:"id"`
	SessionID string        `json:"sessionId"`
	Question  string        `json:"question"`
	Answer    string        `json:"answer"`
	Anchors   []SourceRange `json:"anchors"`
	CreatedAt string        `json:"createdAt"`
}

// Annotation 表示对源码行、函数或选区的短批注。
// TODO(Slice-6): 实现 Annotation 的完整 CRUD 和 Anchor 绑定。
type Annotation struct {
	ID        string      `json:"id"`
	Range     SourceRange `json:"range"`
	Body      string      `json:"body"`
	CreatedAt string      `json:"createdAt"`
}

// CapabilityStatus 表示系统能力的可用状态，用于前端禁用不可用动作和 Agent 选择降级策略。
type CapabilityStatus string

const (
	CapabilityAvailable   CapabilityStatus = "available"
	CapabilityIndexing    CapabilityStatus = "indexing"
	CapabilityPartial     CapabilityStatus = "partial"
	CapabilityUnsupported CapabilityStatus = "unsupported"
	CapabilityFailed      CapabilityStatus = "failed"
	CapabilityOffline     CapabilityStatus = "offline"
)
