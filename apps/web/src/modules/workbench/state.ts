import type {
  ChatSession,
  ContextChip,
  Note,
  ReaderPayload,
  Repo,
  ResolvedContext,
  SearchResult,
  SourceRange,
  ToolCallLogEntry,
} from "../../shared/schema";

export type AppState = {
  repos: Repo[];
  activeRepo: Repo | null;
  reader: ReaderPayload | null;
  selectedRange: SourceRange | null;
  contextChips: ContextChip[];
  resolvedContext: ResolvedContext | null;
  searchQuery: string;
  searchResults: SearchResult[];
  chatSession: ChatSession | null;
  question: string;
  answer: string;
  toolLog: ToolCallLogEntry[];
  isChatRunning: boolean;
  savedNote: Note | null;
  status: string;
  error: string | null;
  highlightedLine: number | null;
};

export function createInitialAppState(): AppState {
  return {
    repos: [],
    activeRepo: null,
    reader: null,
    selectedRange: null,
    contextChips: [],
    resolvedContext: null,
    searchQuery: "context",
    searchResults: [],
    chatSession: null,
    question: "Explain how this context basket works.",
    answer: "",
    toolLog: [],
    isChatRunning: false,
    savedNote: null,
    status: "Ready to start the mock skeleton.",
    error: null,
    highlightedLine: null,
  };
}
