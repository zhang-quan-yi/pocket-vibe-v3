export type Repo = {
  id: string;
  name: string;
  description: string;
  recommendedFile: string;
};

export type SourceRange = {
  filePath: string;
  startLine: number;
  endLine: number;
};

export type CodeLine = {
  number: number;
  text: string;
};

export type SymbolRef = {
  name: string;
  kind: string;
  range: SourceRange;
};

export type ReaderPayload = {
  projectId: string;
  filePath: string;
  language: string;
  lines: CodeLine[];
  symbols: SymbolRef[];
  suggestedSelection: SourceRange;
};

export type SearchResult = {
  filePath: string;
  line: number;
  preview: string;
  range: SourceRange;
};

export type ContextChip = {
  id: string;
  kind: string;
  label: string;
  summary: string;
  range: SourceRange;
};

export type ResolvedContext = {
  chips: ContextChip[];
  estimatedToken: number;
  warnings: string[];
};

export type ChatSession = {
  sessionId: string;
  createdAt: string;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  anchors: SourceRange[];
  createdAt: string;
};
