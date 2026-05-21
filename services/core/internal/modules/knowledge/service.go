package knowledge

import (
	"context"
	"strconv"
	"strings"
	"sync"
	"time"

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

type MemoryKnowledgeService struct {
	mu           sync.Mutex
	notes        map[string][]contract.NoteDocument
	savedAnswers map[string][]contract.SavedAnswer
	annotations  map[string][]contract.Annotation
}

func NewMemoryKnowledgeService() *MemoryKnowledgeService {
	return &MemoryKnowledgeService{
		notes:        map[string][]contract.NoteDocument{},
		savedAnswers: map[string][]contract.SavedAnswer{},
		annotations:  map[string][]contract.Annotation{},
	}
}

func (s *MemoryKnowledgeService) CreateNoteDocument(ctx context.Context, req contract.CreateNoteDocumentRequest) (*contract.NoteDocument, error) {
	projectID := defaultProjectID(req.ProjectID)
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "Context basket explanation"
	}

	note := contract.NoteDocument{
		ID:        "note_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: projectID,
		Title:     title,
		Body:      req.Body,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.notes[projectID] = append([]contract.NoteDocument{note}, s.notes[projectID]...)
	return &note, nil
}

func (s *MemoryKnowledgeService) ListNoteDocuments(ctx context.Context, projectID string) ([]contract.NoteDocument, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.NoteDocument(nil), s.notes[defaultProjectID(projectID)]...), nil
}

func (s *MemoryKnowledgeService) GetNoteDocument(ctx context.Context, projectID string, noteID string) (*contract.NoteDocument, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, note := range s.notes[defaultProjectID(projectID)] {
		if note.ID == noteID {
			copy := note
			return &copy, nil
		}
	}
	return nil, serviceerrors.ErrNoteNotFound
}

func (s *MemoryKnowledgeService) CreateSavedAnswer(ctx context.Context, req contract.CreateSavedAnswerRequest) (*contract.SavedAnswer, error) {
	projectID := defaultProjectID(req.ProjectID)
	answer := contract.SavedAnswer{
		ID:        "answer_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: projectID,
		SessionID: req.SessionID,
		Question:  req.Question,
		Answer:    req.Answer,
		Anchors:   req.Anchors,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.savedAnswers[projectID] = append([]contract.SavedAnswer{answer}, s.savedAnswers[projectID]...)
	return &answer, nil
}

func (s *MemoryKnowledgeService) ListSavedAnswers(ctx context.Context, projectID string) ([]contract.SavedAnswer, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.SavedAnswer(nil), s.savedAnswers[defaultProjectID(projectID)]...), nil
}

func (s *MemoryKnowledgeService) CreateAnnotation(ctx context.Context, req contract.CreateAnnotationRequest) (*contract.Annotation, error) {
	projectID := defaultProjectID(req.ProjectID)
	annotation := contract.Annotation{
		ID:        "annotation_" + strconv.FormatInt(time.Now().UnixNano(), 36),
		ProjectID: projectID,
		Range:     req.Range,
		Body:      req.Body,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.annotations[projectID] = append([]contract.Annotation{annotation}, s.annotations[projectID]...)
	return &annotation, nil
}

func (s *MemoryKnowledgeService) ListAnnotations(ctx context.Context, projectID string) ([]contract.Annotation, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]contract.Annotation(nil), s.annotations[defaultProjectID(projectID)]...), nil
}

func defaultProjectID(projectID string) string {
	if strings.TrimSpace(projectID) != "" {
		return projectID
	}
	return fixture.DefaultProject().Repo.ID
}
