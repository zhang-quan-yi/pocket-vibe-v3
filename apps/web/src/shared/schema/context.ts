import type { SourceRange } from "./source";

export type ContextChipKind =
  | "selection"
  | "file"
  | "symbol"
  | "definition"
  | "references"
  | "searchResult"
  | "trail"
  | "savedAnswer"
  | "annotation"
  | "noteDocument"
  | "codebaseQuery";

export type ContextChip = {
  id: string;
  kind: ContextChipKind;
  label: string;
  summary: string;
  range: SourceRange;
};

export type ResolvedContext = {
  chips: ContextChip[];
  estimatedToken: number;
  warnings: string[];
};
