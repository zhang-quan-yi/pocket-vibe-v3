package chat

import (
	"context"
	"strconv"
	"strings"
	"time"

	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
)

type ChatService interface {
	CreateSession(ctx context.Context) (*contract.ChatSession, error)
	StreamEvents(ctx context.Context, sessionID string, question string) (<-chan contract.ChatEvent, error)
	SendMessage(ctx context.Context, sessionID string, req contract.ChatMessageRequest) (*contract.ChatMessageResponse, error)
}

type MockChatService struct{}

var mockAnswerChunks = []string{
	"The selected code builds a small context basket from the current source range. ",
	"It creates one explicit selection chip, then adds a reading-trail chip so the AI can keep the local navigation path in mind. ",
	"For the MVP, this is exactly the trust layer we need: the user can see what context will be sent before asking.",
}

func (s *MockChatService) CreateSession(ctx context.Context) (*contract.ChatSession, error) {
	return &contract.ChatSession{
		SessionID: "chat_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}

func (s *MockChatService) StreamEvents(ctx context.Context, sessionID string, question string) (<-chan contract.ChatEvent, error) {
	ch := make(chan contract.ChatEvent, 16)
	go func() {
		defer close(ch)
		q := strings.TrimSpace(question)
		if q == "" {
			q = "Explain this code."
		}

		if !sendChatEvent(ctx, ch, contract.ChatEvent{Type: contract.ChatEventTool, Payload: contract.ChatToolPayload{SessionID: sessionID, Name: "read_file", Summary: "Reading src/reader/context.ts around the selected range for: " + q}}) {
			return
		}
		if !waitForChatDelay(ctx, 180*time.Millisecond) {
			return
		}
		if !sendChatEvent(ctx, ch, contract.ChatEvent{Type: contract.ChatEventTool, Payload: contract.ChatToolPayload{SessionID: sessionID, Name: "resolve_context", Summary: "Resolving selected lines plus current reading trail."}}) {
			return
		}
		for _, chunk := range mockAnswerChunks {
			if !waitForChatDelay(ctx, 220*time.Millisecond) {
				return
			}
			if !sendChatEvent(ctx, ch, contract.ChatEvent{Type: contract.ChatEventDelta, Payload: contract.ChatDeltaPayload{Text: chunk}}) {
				return
			}
		}
		sendChatEvent(ctx, ch, contract.ChatEvent{Type: contract.ChatEventDone, Payload: contract.ChatDonePayload{Source: contract.SourceRange{FilePath: fixture.DefaultProject().Repo.RecommendedFile, StartLine: 3, EndLine: 12}}})
	}()
	return ch, nil
}

func (s *MockChatService) SendMessage(ctx context.Context, sessionID string, req contract.ChatMessageRequest) (*contract.ChatMessageResponse, error) {
	return &contract.ChatMessageResponse{
		SessionID: sessionID,
		Answer:    "The selected code creates visible context chips, then uses them as the source of truth for the AI request.",
		ToolCalls: []map[string]string{{"name": "read_file", "status": "completed"}, {"name": "resolve_context", "status": "completed"}},
	}, nil
}

func sendChatEvent(ctx context.Context, ch chan<- contract.ChatEvent, event contract.ChatEvent) bool {
	select {
	case <-ctx.Done():
		return false
	case ch <- event:
		return true
	}
}

func waitForChatDelay(ctx context.Context, delay time.Duration) bool {
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
