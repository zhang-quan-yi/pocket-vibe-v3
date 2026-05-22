import { renderSearchResults } from "../search/view";
import { escapeHTML } from "../../shared/utils/escape-html";
import type { CodeLine, SourceRange } from "../../shared/schema";
import type { CodeReaderProps } from "../../shared/ui";

export function renderCodeReader(props: CodeReaderProps): string {
  const { reader, selectedRange, highlightedLine, searchQuery, searchResults } = props;

  if (!reader) {
    return `
      <div class="empty-reader">
        <p class="eyebrow">Read</p>
        <h2>No file open</h2>
        <p>Open the mock repo to load a reader payload from the Go API.</p>
      </div>
    `;
  }

  return `
    <div class="reader-header">
      <div>
        <p class="eyebrow">${escapeHTML(reader.language)}</p>
        <h2>${escapeHTML(reader.filePath)}</h2>
      </div>
      <button class="secondary-action" data-action="use-suggested">Use suggested range</button>
    </div>

    <div class="search-row">
      <input aria-label="Search code" value="${escapeHTML(searchQuery)}" data-role="search-input" />
      <button class="secondary-action" data-action="search">Search</button>
    </div>
    ${renderSearchResults({ results: searchResults })}

    <div class="code-reader" aria-label="Read-only source code">
      ${reader.lines.map((line) => renderCodeLine(line, selectedRange, highlightedLine)).join("")}
    </div>
  `;
}

function renderCodeLine(line: CodeLine, selectedRange: SourceRange | null, highlightedLine: number | null): string {
  const isSelected = isLineInRange(line.number, selectedRange);
  const isHighlighted = line.number === highlightedLine;
  const className = ["code-line", isSelected ? "selected" : "", isHighlighted ? "highlighted" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <button class="${className}" data-action="select-line" data-line="${line.number}">
      <span class="line-no">${line.number}</span>
      <code>${escapeHTML(line.text || " ")}</code>
    </button>
  `;
}

function isLineInRange(line: number, range: SourceRange | null): boolean {
  return Boolean(range && line >= range.startLine && line <= range.endLine);
}
