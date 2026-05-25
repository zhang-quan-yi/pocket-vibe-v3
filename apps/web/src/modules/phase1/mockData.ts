import type { MockRepoSummary, ReaderPayload, SearchResult, SourceRange } from "../../shared/schema/phase1";

export const mockRepos: MockRepoSummary[] = [
  {
    projectId: "mock-pocket-vibe",
    name: "mock-pocket-vibe",
    description: "Tiny TypeScript fixture for the Read -> Ask -> Save demo.",
    entryFile: "src/reader/context.ts",
    language: "TypeScript",
  },
  {
    projectId: "mock-notes-core",
    name: "mock-notes-core",
    description: "Small Go-shaped fixture used to verify search and saved source jumps.",
    entryFile: "internal/notes/service.go",
    language: "Go",
  },
];

export const readerPayloads: Record<string, ReaderPayload[]> = {
  "mock-pocket-vibe": [
    {
      projectId: "mock-pocket-vibe",
      filePath: "src/reader/context.ts",
      language: "TypeScript",
      lines: [
        { lineNumber: 31, text: "export type ContextChipStatus =", symbolName: "ContextChipStatus" },
        { lineNumber: 32, text: '  | "suggested"', symbolName: "ContextChipStatus" },
        { lineNumber: 33, text: '  | "ready"', symbolName: "ContextChipStatus" },
        { lineNumber: 34, text: '  | "pinned"', symbolName: "ContextChipStatus" },
        { lineNumber: 35, text: '  | "stale";', symbolName: "ContextChipStatus" },
        { lineNumber: 36, text: "" },
        { lineNumber: 37, text: "export function resolveContextChip(chip: ContextChip, reader: ReaderState) {", symbolName: "resolveContextChip" },
        { lineNumber: 38, text: "  const source = reader.findSourceRange(chip.anchor);", symbolName: "resolveContextChip" },
        { lineNumber: 39, text: "  if (!source) {", symbolName: "resolveContextChip" },
        { lineNumber: 40, text: '    return markMissing(chip, "source range not found");', symbolName: "resolveContextChip" },
        { lineNumber: 41, text: "  }", symbolName: "resolveContextChip" },
        { lineNumber: 42, text: "" },
        { lineNumber: 43, text: "  return {", symbolName: "resolveContextChip" },
        { lineNumber: 44, text: "    ...chip,", symbolName: "resolveContextChip" },
        { lineNumber: 45, text: '    status: chip.pinned ? "pinned" : "ready",', symbolName: "resolveContextChip" },
        { lineNumber: 46, text: "    sourceRange: source,", symbolName: "resolveContextChip" },
        { lineNumber: 47, text: "  };", symbolName: "resolveContextChip" },
        { lineNumber: 48, text: "}", symbolName: "resolveContextChip" },
        { lineNumber: 49, text: "" },
        { lineNumber: 50, text: "export function estimateContextTokens(chips: ContextChip[]) {", symbolName: "estimateContextTokens" },
        { lineNumber: 51, text: "  return chips.reduce((total, chip) => total + (chip.tokenEstimate ?? 0), 0);", symbolName: "estimateContextTokens" },
        { lineNumber: 52, text: "}", symbolName: "estimateContextTokens" },
      ],
    },
    {
      projectId: "mock-pocket-vibe",
      filePath: "src/chat/session.ts",
      language: "TypeScript",
      lines: [
        { lineNumber: 12, text: "export function createReadingPrompt(input: PromptInput) {", symbolName: "createReadingPrompt" },
        { lineNumber: 13, text: "  return {", symbolName: "createReadingPrompt" },
        { lineNumber: 14, text: "    intent: input.intent,", symbolName: "createReadingPrompt" },
        { lineNumber: 15, text: "    visibleContext: input.contextChips.map(toPromptContext),", symbolName: "createReadingPrompt" },
        { lineNumber: 16, text: '    permission: "safe_read",', symbolName: "createReadingPrompt" },
        { lineNumber: 17, text: "  };", symbolName: "createReadingPrompt" },
        { lineNumber: 18, text: "}", symbolName: "createReadingPrompt" },
      ],
    },
  ],
  "mock-notes-core": [
    {
      projectId: "mock-notes-core",
      filePath: "internal/notes/service.go",
      language: "Go",
      lines: [
        { lineNumber: 21, text: "func (s *Service) SaveAnswer(ctx context.Context, input SaveAnswerInput) (*SavedAnswer, error) {", symbolName: "SaveAnswer" },
        { lineNumber: 22, text: "    if len(input.SourceRefs) == 0 {", symbolName: "SaveAnswer" },
        { lineNumber: 23, text: '        return nil, errors.New("source reference required")', symbolName: "SaveAnswer" },
        { lineNumber: 24, text: "    }", symbolName: "SaveAnswer" },
        { lineNumber: 25, text: "    return s.store.InsertSavedAnswer(ctx, input)", symbolName: "SaveAnswer" },
        { lineNumber: 26, text: "}", symbolName: "SaveAnswer" },
      ],
    },
  ],
};

export const searchResults: SearchResult[] = [
  {
    resultId: "search-resolve-context",
    projectId: "mock-pocket-vibe",
    filePath: "src/reader/context.ts",
    range: { filePath: "src/reader/context.ts", startLine: 37, endLine: 48, label: "resolveContextChip" },
    title: "resolveContextChip",
    snippet: 'status: chip.pinned ? "pinned" : "ready"',
  },
  {
    resultId: "search-create-prompt",
    projectId: "mock-pocket-vibe",
    filePath: "src/chat/session.ts",
    range: { filePath: "src/chat/session.ts", startLine: 12, endLine: 18, label: "createReadingPrompt" },
    title: "createReadingPrompt",
    snippet: "visibleContext: input.contextChips.map(toPromptContext)",
  },
  {
    resultId: "search-save-answer",
    projectId: "mock-notes-core",
    filePath: "internal/notes/service.go",
    range: { filePath: "internal/notes/service.go", startLine: 21, endLine: 26, label: "SaveAnswer" },
    title: "SaveAnswer",
    snippet: "return s.store.InsertSavedAnswer(ctx, input)",
  },
];

export function findPayload(projectId: string, filePath?: string) {
  const payloads = readerPayloads[projectId] ?? [];
  return payloads.find((payload) => payload.filePath === filePath) ?? payloads[0];
}

export function sourceRangeLabel(range: SourceRange) {
  const label = range.label ? `${range.label} ` : "";
  return `${label}${range.filePath} L${range.startLine}-L${range.endLine}`;
}

export function quoteRange(payload: ReaderPayload, range: SourceRange) {
  return payload.lines
    .filter((line) => line.lineNumber >= range.startLine && line.lineNumber <= range.endLine)
    .map((line) => line.text)
    .join("\n");
}

