package contract

// ApiError 是后端统一错误模型，所有 API 错误必须以此结构返回。
// 包含机器可读的错误码、人类可读的消息、是否可重试标志和追踪 ID。
type ApiError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	Retryable bool   `json:"retryable"`
	TraceID   string `json:"traceId,omitempty"`
}

// 标准错误码常量，与设计文档第 10 节对齐。
const (
	// ErrBadJSON 表示请求体 JSON 解析失败。
	ErrBadJSON = "BAD_JSON"
	// ErrNotFound 表示请求的资源或路由不存在。
	ErrNotFound = "NOT_FOUND"
	// ErrRepoInvalidURL 表示仓库 URL 格式不支持。
	ErrRepoInvalidURL = "REPO_INVALID_URL"
	// ErrRepoPrivateOrUnreachable 表示仓库是私有的或网络不可达。
	ErrRepoPrivateOrUnreachable = "REPO_PRIVATE_OR_UNREACHABLE"
	// ErrRepoCloneTimeout 表示仓库克隆超时。
	ErrRepoCloneTimeout = "REPO_CLONE_TIMEOUT"
	// ErrRepoTooLarge 表示仓库超过大小限制。
	ErrRepoTooLarge = "REPO_TOO_LARGE"
	// ErrFileBinaryUnsupported 表示文件是二进制格式，不支持读取。
	ErrFileBinaryUnsupported = "FILE_BINARY_UNSUPPORTED"
	// ErrFileTooLarge 表示文件超过大小限制。
	ErrFileTooLarge = "FILE_TOO_LARGE"
	// ErrIndexNotReady 表示仓库索引尚未就绪。
	ErrIndexNotReady = "INDEX_NOT_READY"
	// ErrSemanticUnsupported 表示该语言不支持语义分析。
	ErrSemanticUnsupported = "SEMANTIC_UNSUPPORTED"
	// ErrAnchorStale 表示源码锚点已失效。
	ErrAnchorStale = "ANCHOR_STALE"
	// ErrContextTooLarge 表示上下文超过 token 限制。
	ErrContextTooLarge = "CONTEXT_TOO_LARGE"
	// ErrModelKeyMissing 表示未配置模型 API Key。
	ErrModelKeyMissing = "MODEL_KEY_MISSING"
	// ErrModelProviderError 表示模型服务返回错误。
	ErrModelProviderError = "MODEL_PROVIDER_ERROR"
	// ErrAgentPermissionBlocked 表示 Agent 工具权限被拒绝。
	ErrAgentPermissionBlocked = "AGENT_PERMISSION_BLOCKED"
	// ErrStreamUnsupported 表示当前环境不支持 SSE 流式推送。
	ErrStreamUnsupported = "STREAM_UNSUPPORTED"
)

// NewApiError 创建一个结构化错误实例。
func NewApiError(code string, message string, retryable bool) ApiError {
	return ApiError{
		Code:      code,
		Message:   message,
		Retryable: retryable,
	}
}
