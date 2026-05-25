export type ReaderPanel = "none" | "search" | "chat" | "save" | "annotation" | "trail";

export type SourceRange = {
  filePath: string;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
  label?: string;
};

export type CodeLineView = {
  lineNumber: number;
  text: string;
  symbolName?: string;
};

export type ReaderPayload = {
  projectId: string;
  filePath: string;
  language: string;
  lines: CodeLineView[];
};

export type MockRepoSummary = {
  projectId: string;
  name: string;
  description: string;
  entryFile: string;
  language: string;
};

export type ContextChipStatus = "suggested" | "ready" | "pinned" | "stale" | "missing" | "oversized" | "trimmed";

export type ContextChip = {
  chipId: string;
  type: "selection" | "file" | "searchResult" | "savedAnswer" | "annotation" | "codebaseQuery";
  label: string;
  projectId: string;
  filePath?: string;
  range?: SourceRange;
  status: ContextChipStatus;
  tokenEstimate?: number;
};

export type SearchResult = {
  resultId: string;
  projectId: string;
  filePath: string;
  range: SourceRange;
  title: string;
  snippet: string;
};

export type ChatMode = "ask" | "plan" | "agentic";

export type ChatRunStatus = "idle" | "streaming" | "completed" | "failed" | "cancelled";

export type ChatMessageView = {
  messageId: string;
  role: "user" | "assistant";
  content: string;
};

export type SourceReference = {
  sourceRefId: string;
  label: string;
  range: SourceRange;
  quote: string;
};

export type SavedAnswerView = {
  savedAnswerId: string;
  title: string;
  answerMarkdown: string;
  sourceRefs: SourceReference[];
};

export type AnnotationView = {
  annotationId: string;
  text: string;
  range: SourceRange;
};

export type ReadingTrailItem = {
  trailId: string;
  label: string;
  range: SourceRange;
};

