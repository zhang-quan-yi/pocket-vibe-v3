package contract

type Repo struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	RecommendedFile string `json:"recommendedFile"`
}

type SourceRange struct {
	FilePath  string `json:"filePath"`
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
}

type CodeLine struct {
	Number int    `json:"number"`
	Text   string `json:"text"`
}

type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	Kind     string     `json:"kind"`
	Size     int64      `json:"size,omitempty"`
	Children []FileNode `json:"children,omitempty"`
}

type FileContent struct {
	ProjectID     string     `json:"projectId"`
	FilePath      string     `json:"filePath"`
	Language      string     `json:"language"`
	Size          int64      `json:"size"`
	LineCount     int        `json:"lineCount"`
	ContentHash   string     `json:"contentHash"`
	Lines         []CodeLine `json:"lines"`
	Readable      bool       `json:"readable"`
	SkippedReason string     `json:"skippedReason,omitempty"`
}

type SymbolRef struct {
	Name  string      `json:"name"`
	Kind  string      `json:"kind"`
	Range SourceRange `json:"range"`
}

type ReaderPayload struct {
	ProjectID          string      `json:"projectId"`
	FilePath           string      `json:"filePath"`
	Language           string      `json:"language"`
	Lines              []CodeLine  `json:"lines"`
	Symbols            []SymbolRef `json:"symbols"`
	SuggestedSelection SourceRange `json:"suggestedSelection"`
}

type SearchResult struct {
	FilePath string      `json:"filePath"`
	Line     int         `json:"line"`
	Preview  string      `json:"preview"`
	Range    SourceRange `json:"range"`
}

type SearchResponse struct {
	Query     string         `json:"query"`
	Results   []SearchResult `json:"results"`
	Truncated bool           `json:"truncated,omitempty"`
}

type ContextChip struct {
	ID      string      `json:"id"`
	Kind    string      `json:"kind"`
	Label   string      `json:"label"`
	Summary string      `json:"summary"`
	Range   SourceRange `json:"range"`
}

type ResolvedContext struct {
	Chips          []ContextChip `json:"chips"`
	EstimatedToken int           `json:"estimatedToken"`
	Warnings       []string      `json:"warnings"`
}

type ChatSession struct {
	SessionID string `json:"sessionId"`
	CreatedAt string `json:"createdAt"`
}

type ChatEventType string

const (
	ChatEventTool  ChatEventType = "tool"
	ChatEventDelta ChatEventType = "delta"
	ChatEventDone  ChatEventType = "done"
)

type ChatEvent struct {
	Type    ChatEventType `json:"type"`
	Payload any           `json:"payload"`
}

type ChatToolPayload struct {
	SessionID string `json:"sessionId"`
	Name      string `json:"name"`
	Summary   string `json:"summary"`
}

type ChatDeltaPayload struct {
	Text string `json:"text"`
}

type ChatDonePayload struct {
	Source SourceRange `json:"source"`
}

type ChatMessageRequest struct {
	Question string        `json:"question"`
	Context  []ContextChip `json:"context"`
}

type ChatMessageResponse struct {
	SessionID string              `json:"sessionId"`
	Answer    string              `json:"answer"`
	ToolCalls []map[string]string `json:"toolCalls"`
}

type NoteDocument struct {
	ID        string        `json:"id"`
	ProjectID string        `json:"projectId,omitempty"`
	Title     string        `json:"title"`
	Body      string        `json:"body"`
	Anchors   []SourceRange `json:"anchors"`
	CreatedAt string        `json:"createdAt"`
}

type CreateNoteDocumentRequest struct {
	ProjectID string        `json:"projectId,omitempty"`
	Title     string        `json:"title"`
	Body      string        `json:"body"`
	Anchors   []SourceRange `json:"anchors"`
}

type SavedAnswer struct {
	ID        string        `json:"id"`
	ProjectID string        `json:"projectId,omitempty"`
	SessionID string        `json:"sessionId"`
	Question  string        `json:"question"`
	Answer    string        `json:"answer"`
	Anchors   []SourceRange `json:"anchors"`
	CreatedAt string        `json:"createdAt"`
}

type CreateSavedAnswerRequest struct {
	ProjectID string        `json:"projectId,omitempty"`
	SessionID string        `json:"sessionId"`
	Question  string        `json:"question"`
	Answer    string        `json:"answer"`
	Anchors   []SourceRange `json:"anchors"`
}

type Annotation struct {
	ID        string      `json:"id"`
	ProjectID string      `json:"projectId,omitempty"`
	Range     SourceRange `json:"range"`
	Body      string      `json:"body"`
	CreatedAt string      `json:"createdAt"`
}

type CreateAnnotationRequest struct {
	ProjectID string      `json:"projectId,omitempty"`
	Range     SourceRange `json:"range"`
	Body      string      `json:"body"`
}

type CapabilityStatus string

const (
	CapabilityAvailable   CapabilityStatus = "available"
	CapabilityIndexing    CapabilityStatus = "indexing"
	CapabilityPartial     CapabilityStatus = "partial"
	CapabilityUnsupported CapabilityStatus = "unsupported"
	CapabilityFailed      CapabilityStatus = "failed"
	CapabilityOffline     CapabilityStatus = "offline"
)

type ProjectCapabilities struct {
	ProjectID string           `json:"projectId"`
	Repo      CapabilityStatus `json:"repo"`
	File      CapabilityStatus `json:"file"`
	Reader    CapabilityStatus `json:"reader"`
	Search    CapabilityStatus `json:"search"`
	Semantic  CapabilityStatus `json:"semantic"`
	Chat      CapabilityStatus `json:"chat"`
	Knowledge CapabilityStatus `json:"knowledge"`
}
