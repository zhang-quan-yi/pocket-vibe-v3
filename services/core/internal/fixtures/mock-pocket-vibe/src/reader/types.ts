export type SourceRange = {
  filePath: string;
  startLine: number;
  endLine: number;
};

export type ContextChip = {
  id: string;
  kind: "selection" | "readingTrail" | "definition";
  label: string;
  summary: string;
  range: SourceRange;
};
