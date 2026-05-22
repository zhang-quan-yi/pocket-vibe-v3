import type { CodeLine, SourceRange } from "./source";

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
