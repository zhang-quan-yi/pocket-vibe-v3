import { renderChatPanel } from "../chat/view";
import { renderCodeReader } from "../code-reader/view";
import { renderContextPanel } from "../context-basket/view";
import { renderRepoBand } from "../repo/view";
import { renderCardsTrailPanel } from "../code-reader/cards-trail/view";
import { escapeHTML } from "../../shared/utils/escape-html";
import type { AppState } from "./state";

export function renderAppShell(state: AppState): string {
  return `
    <main class="app-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <span class="brand-mark" aria-hidden="true">PV</span>
          <div>
            <p class="eyebrow">Reader-first skeleton</p>
            <h1>Pocket Vibe</h1>
          </div>
        </div>
        <span class="status-pill">${escapeHTML(state.status)}</span>
      </header>

      ${state.error ? `<div class="error-banner">${escapeHTML(state.error)}</div>` : ""}

      ${renderRepoBand({ repo: state.activeRepo, hasReader: Boolean(state.reader) })}

      <section class="workbench" aria-label="Reader workbench">
        <div class="reader-pane">
          ${renderCodeReader({
            reader: state.reader,
            selectedRange: state.selectedRange,
            highlightedLine: state.highlightedLine,
            searchQuery: state.searchQuery,
            searchResults: state.searchResults,
          })}
        </div>
        <aside class="side-pane">
          ${renderContextPanel({
            chips: state.contextChips,
            resolvedContext: state.resolvedContext,
            canAddContext: Boolean(state.selectedRange),
          })}
          ${renderChatPanel({
            question: state.question,
            answer: state.answer,
            toolLog: state.toolLog,
            isChatRunning: state.isChatRunning,
            canAsk: Boolean(state.contextChips.length),
          })}
          ${renderCardsTrailPanel({ note: state.savedNote, canSave: Boolean(state.answer && !state.isChatRunning) })}
        </aside>
      </section>
    </main>
  `;
}
