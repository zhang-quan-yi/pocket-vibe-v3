import type { ContextChip, SourceRange } from "./types";

export function buildContextBasket(selection: SourceRange): ContextChip[] {
  const baseChip: ContextChip = {
    id: `selection:${selection.filePath}:${selection.startLine}`,
    kind: "selection",
    label: `Lines ${selection.startLine}-${selection.endLine}`,
    summary: "Selected source range",
    range: selection,
  };

  return [baseChip, createReaderTrailChip(selection.filePath)];
}

function createReaderTrailChip(filePath: string): ContextChip {
  return {
    id: `trail:${filePath}`,
    kind: "readingTrail",
    label: "Current reading trail",
    summary: "Keep the local navigation path visible to AI",
    range: { filePath, startLine: 1, endLine: 1 },
  };
}
