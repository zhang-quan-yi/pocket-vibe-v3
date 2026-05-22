import type { SourceRange } from "./source";

export type SearchResult = {
  filePath: string;
  line: number;
  preview: string;
  range: SourceRange;
};
