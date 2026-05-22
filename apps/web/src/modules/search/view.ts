import { escapeHTML } from "../../shared/utils/escape-html";
import type { SearchResult } from "../../shared/schema";

export function renderSearchResults(results: SearchResult[]): string {
  if (!results.length) {
    return "";
  }

  return `
    <div class="search-results">
      ${results
        .map(
          (result) => `
            <button class="search-result" data-action="jump-search" data-line="${result.line}">
              <span>${escapeHTML(result.filePath)}:${result.line}</span>
              <code>${escapeHTML(result.preview)}</code>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}
