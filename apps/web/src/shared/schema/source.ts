export type SourceRange = {
  filePath: string;
  startLine: number;
  endLine: number;
};

export type Anchor = SourceRange;

export type CodeLine = {
  number: number;
  text: string;
};
