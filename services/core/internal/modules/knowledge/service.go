package knowledge

import (
	"context"
	"strconv"
	"strings"
	"sync"
	"time"

	"pocket-vibe-v3/services/core/internal/shared/authctx"
	"pocket-vibe-v3/services/core/internal/shared/contract"
	"pocket-vibe-v3/services/core/internal/shared/fixture"
	"pocket-vibe-v3/services/core/internal/shared/serviceerrors"
)

type KnowledgeService interface {
	CreateNoteDocument(ctx context.Context, req contract.CreateNoteDocumentRequest) (*contract.NoteDocument, error)
	ListNoteDocuments(ctx context.Context, projectID string) ([]contract.NoteDocument, error)
	GetNoteDocument(ctx context.Context, projectID string, noteID string) (*contract.NoteDocument, error)
	CreateSavedAnswer(ctx context.Context, req contract.CreateSavedAnswerRequest) (*contract.SavedAnswer, error)
	ListSavedAnswers(ctx context.Context, projectID string) ([]contract.SavedAnswer, error)
	CreateAnnotation(ctx context.Context, req contract.CreateAnnotationRequest) (*contract.Annotation, error)
	ListAnnotations(ctx context.Context, projectID string) ([]contract.Annotation, error)
}

// userProjectKey 用于按用户和项目隔离 knowledge 数据。
type userProjectKey struct {
	UserID    string
	ProjectID string
}

type MemoryKnowledgeService struct {
	mu           sync.Mutex
	notes        map[userProjectKey][]contract.NoteDocument
	savedAnswers map[userProjectKey][]contract.SavedAnswer
	annotations  map[userProjectKey][]contract.Annotation
}

func NewMemoryKnowledgeService() *MemoryKnowledgeService {
	return &MemoryKnowledgeService{
		notes:        map[userProjectKey][]contract.NoteDocument{},
		savedAnswers: map[userProjectKey][]contract.SavedAnswer{},
		annotations:  map[userProjectKey][]contract.Annotation{},
	}
}

func (s *MemoryKnowledgeService) CreateNoteDocument(ctx context.Context, req contract.CreateNoteDocumentRequest) (*contract.NoteDocument, error) {
	key, err := resolveKey(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "Context basket explanation"
	}

	note := contract.NoteDocument{
		ID:        "note_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: key.ProjectID,
		Title:     title,
		Body:      req.Body,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.notes[key] = append([]contract.NoteDocument{note}, s.notes[key]...)
	return &note, nil
}

func (s *MemoryKnowledgeService) ListNoteDocuments(ctx context.Context, projectID string) ([]contract.NoteDocument, error) {
	key, err := resolveKey(ctx, projectID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.NoteDocument(nil), s.notes[key]...), nil
}

func (s *MemoryKnowledgeService) GetNoteDocument(ctx context.Context, projectID string, noteID string) (*contract.NoteDocument, error) {
	key, err := resolveKey(ctx, projectID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, note := range s.notes[key] {
		if note.ID == noteID {
			noteCopy := note
			return &noteCopy, nil
		}
	}
	return nil, serviceerrors.ErrNoteNotFound
}

func (s *MemoryKnowledgeService) CreateSavedAnswer(ctx context.Context, req contract.CreateSavedAnswerRequest) (*contract.SavedAnswer, error) {
	key, err := resolveKey(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}
	answer := contract.SavedAnswer{
		ID:        "answer_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: key.ProjectID,
		SessionID: req.SessionID,
		Question:  req.Question,
		Answer:    req.Answer,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.savedAnswers[key] = append([]contract.SavedAnswer{answer}, s.savedAnswers[key]...)
	return &answer, nil
}

func (s *MemoryKnowledgeService) ListSavedAnswers(ctx context.Context, projectID string) ([]contract.SavedAnswer, error) {
	key, err := resolveKey(ctx, projectID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.SavedAnswer(nil), s.savedAnswers[key]...), nil
}

func (s *MemoryKnowledgeService) CreateAnnotation(ctx context.Context, req contract.CreateAnnotationRequest) (*contract.Annotation, error) {
	key, err := resolveKey(ctx, req.ProjectID)
	if err != nil {
		return nil, err
	}
	annotation := contract.Annotation{
		ID:        "annotation_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: key.ProjectID,
		Range:     req.Range,
		Body:      req.Body,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.annotations[key] = append([]contract.Annotation{annotation}, s.annotations[key]...)
	return &annotation, nil
}

func (s *MemoryKnowledgeService) ListAnnotations(ctx context.Context, projectID string) ([]contract.Annotation, error) {
	key, err := resolveKey(ctx, projectID)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.Annotation(nil), s.annotations[key]...), nil
}

// resolveKey 从 context 中提取 userID，结合 projectID 构造隔离 key。
func resolveKey(ctx context.Context, projectID string) (userProjectKey, error) {
	user, ok := authctx.RequireUser(ctx)
	if !ok {
		return userProjectKey{}, serviceerrors.ErrUnauthorized
	}
	pid := strings.TrimSpace(projectID)
	if pid == "" {
		pid = fixture.DefaultProject().Repo.ID
	}
	return userProjectKey{UserID: user.ID, ProjectID: pid}, nil
}
