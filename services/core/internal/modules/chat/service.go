// Package chat 负责 AI 对话的会话生命周期管理、消息处理和流式事件推送。
// Chat 是 Agentic Reading 的核心交互面，后端拥有会话持久化和事件流控制权。
// Agent 工具调用必须有权限分级：Safe read 可自动执行，App write 需用户确认，Source write 和危险动作 MVP 禁止。
package chat

import (
	"context"
	"strconv"
	"strings"
	"time"

	"pocket-vibe-v3/services/core/internal/shared/contract"
)

// ChatService 定义对话模块对外暴露的能力。
// 后端拥有 ChatSession 生命周期、消息处理、Agent 工具调用日志和流式事件推送。
type ChatService interface {
	// CreateSession 创建一个新的对话会话，返回会话 ID 和创建时间。
	CreateSession(ctx context.Context) (*contract.ChatSession, error)

	// StreamEvents 以 SSE 方式流式推送对话事件，包括工具调用、文本增量和完成信号。
	// 返回只读 channel，由 handler 消费并格式化为 SSE 协议。
	StreamEvents(ctx context.Context, sessionID string, question string) (<-chan contract.ChatEvent, error)

	// SendMessage 发送一条消息到指定会话，返回同步的对话响应。
	// 包含 AI 回答和工具调用日志摘要。
	SendMessage(ctx context.Context, sessionID string, req contract.ChatMessageRequest) (*contract.ChatMessageResponse, error)
}

// MockChatService 是 ChatService 的 mock 实现，服务于 walking skeleton 验证阶段。
// 模拟 Agent 的工具调用和 AI 回答的流式推送。
type MockChatService struct{}

// mockAnswerChunks 是 mock AI 回答的文本增量片段。
var mockAnswerChunks = []string{
	"The selected code builds a small context basket from the current source range. ",
	"It creates one explicit selection chip, then adds a reading-trail chip so the AI can keep the local navigation path in mind. ",
	"For the MVP, this is exactly the trust layer we need: the user can see what context will be sent before asking.",
}

// mockRecommendedFile 是 mock 使用的推荐文件路径。
const mockRecommendedFile = "src/reader/context.ts"

// CreateSession 创建一个 mock 对话会话。
func (s *MockChatService) CreateSession(ctx context.Context) (*contract.ChatSession, error) {
	session := &contract.ChatSession{
		SessionID: "chat_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}
	return session, nil
}

// StreamEvents 以 SSE 方式流式推送 mock 对话事件。
// 模拟 Agent 的工具调用（readFile、resolveContext）和 AI 回答的增量推送。
func (s *MockChatService) StreamEvents(ctx context.Context, sessionID string, question string) (<-chan contract.ChatEvent, error) {
	ch := make(chan contract.ChatEvent, 16)

	go func() {
		defer close(ch)

		q := strings.TrimSpace(question)
		if q == "" {
			q = "Explain this code."
		}

		// 模拟 Agent 工具调用：读取文件
		ch <- contract.ChatEvent{
			Type: contract.ChatEventTool,
			Payload: contract.ChatToolPayload{
				SessionID: sessionID,
				Name:      "read_file",
				Summary:   "Reading src/reader/context.ts around the selected range.",
			},
		}

		time.Sleep(180 * time.Millisecond)

		// 模拟 Agent 工具调用：解析上下文
		ch <- contract.ChatEvent{
			Type: contract.ChatEventTool,
			Payload: contract.ChatToolPayload{
				SessionID: sessionID,
				Name:      "resolve_context",
				Summary:   "Resolving selected lines plus current reading trail.",
			},
		}

		// 模拟 AI 回答的增量推送
		for _, chunk := range mockAnswerChunks {
			time.Sleep(220 * time.Millisecond)
			ch <- contract.ChatEvent{
				Type: contract.ChatEventDelta,
				Payload: contract.ChatDeltaPayload{
					Text: chunk,
				},
			}
		}

		// 发送完成事件，携带源码范围
		ch <- contract.ChatEvent{
			Type: contract.ChatEventDone,
			Payload: contract.ChatDonePayload{
				Source: contract.SourceRange{
					FilePath:  mockRecommendedFile,
					StartLine: 3,
					EndLine:   12,
				},
			},
		}
	}()

	return ch, nil
}

// SendMessage 发送一条消息到指定会话，返回 mock 同步对话响应。
func (s *MockChatService) SendMessage(ctx context.Context, sessionID string, req contract.ChatMessageRequest) (*contract.ChatMessageResponse, error) {
	resp := &contract.ChatMessageResponse{
		SessionID: sessionID,
		Answer:    "The selected code creates visible context chips, then uses them as the source of truth for the AI request.",
		ToolCalls: []map[string]string{
			{"name": "read_file", "status": "completed"},
			{"name": "resolve_context", "status": "completed"},
		},
	}
	return resp, nil
}
