import type { ContextChip, SourceRange } from "../../shared/schema";

export function createSelectionContextChip(range: SourceRange): ContextChip {
  return {
    id: `selection:${range.filePath}:${range.startLine}-${range.endLine}`,
    kind: "selection",
    label: `${range.filePath}:${range.startLine}-${range.endLine}`,
    summary: "Selected source range from the reader.",
    range,
  };
}
