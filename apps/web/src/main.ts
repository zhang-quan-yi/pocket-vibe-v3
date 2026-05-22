import {
  chatEventURL,
  createChatSession,
  getMockRepos,
  getReaderPayload,
  resolveContext,
  saveNote,
  search,
} from "./api";
import {
  escapeHTML,
  renderAnswerCard,
  renderCodeLineButton,
  renderContextChipPill,
  renderEmptyReaderState,
  renderPanelHeader,
  renderReaderHeader,
  renderSavedNoteCard,
  renderSearchBar,
  renderSearchResultItem,
  renderToolCallLog,
  renderTopBar,
  renderWorkspaceBand,
} from "./components";
import "./styles.css";
import type {
  ChatSession,
  ContextChip,
  Note,
  ReaderPayload,
  Repo,
  ResolvedContext,
  SearchResult,
  SourceRange,
} from "./types";

type AppState = {
  repos: Repo[];
  activeRepo: Repo | null;
  reader: ReaderPayload | null;
  selectedRange: SourceRange | null;
  contextChips: ContextChip[];
  resolvedContext: ResolvedContext | null;
  searchQuery: string;
  searchResults: SearchResult[];
  chatSession: ChatSession | null;
  question: string;
  answer: string;
  toolLog: string[];
  isChatRunning: boolean;
  savedNote: Note | null;
  status: string;
  error: string | null;
  highlightedLine: number | null;
};

const state: AppState = {
  repos: [],
  activeRepo: null,
  reader: null,
  selectedRange: null,
  contextChips: [],
  resolvedContext: null,
  searchQuery: "context",
  searchResults: [],
  chatSession: null,
  question: "Explain how this context basket works.",
  answer: "",
  toolLog: [],
  isChatRunning: false,
  savedNote: null,
  status: "Ready to start the mock skeleton.",
  error: null,
  highlightedLine: null,
};

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("App root not found.");
}

const app = appRoot;

render();
void boot();

async function boot(): Promise<void> {
  try {
    state.repos = await getMockRepos();
    state.status = "Mock repo list loaded.";
  } catch (error) {
    state.error = getErrorMessage(error);
  }
  render();
}

function render(): void {
  app.innerHTML = `
    <main class="app-shell">
      ${renderTopBar({
        eyebrow: "Reader-first skeleton",
        title: "Pocket Vibe",
        status: state.status,
      })}

      ${state.error ? `<div class="error-banner">${escapeHTML(state.error)}</div>` : ""}

      ${renderWorkspaceBand({
        title: "Repo",
        description: state.activeRepo?.description ?? "Choose a mock repo to start the shortest engineering path.",
        actionLabel: state.reader ? "Reload mock repo" : "Choose mock repo",
        action: "open-repo",
      })}

      <section class="workbench" aria-label="Reader workbench">
        <div class="reader-pane">
          ${renderReader()}
        </div>
        <aside class="side-pane">
          ${renderContextPanel()}
          ${renderChatPanel()}
          ${renderNotePanel()}
        </aside>
      </section>
    </main>
  `;

  bindEvents();
}

function renderReader(): string {
  if (!state.reader) {
    return renderEmptyReaderState({
      eyebrow: "Read",
      title: "No file open",
      description: "Open the mock repo to load a reader payload from the Go API.",
    });
  }

  const searchResults = state.searchResults
    .map(
      (result) =>
        renderSearchResultItem({
          filePath: result.filePath,
          line: result.line,
          preview: result.preview,
          action: "jump-search",
        }),
    )
    .join("");

  return `
    ${renderReaderHeader({
      eyebrow: state.reader.language,
      title: state.reader.filePath,
      actionLabel: "Use suggested range",
      action: "use-suggested",
    })}

    ${renderSearchBar({
      value: state.searchQuery,
      inputRole: "search-input",
      inputAriaLabel: "Search code",
      actionLabel: "Search",
      action: "search",
    })}
    ${searchResults ? `<div class="search-results">${searchResults}</div>` : ""}

    <div class="code-reader" aria-label="Read-only source code">
      ${state.reader.lines.map(renderCodeLine).join("")}
    </div>
  `;
}

function renderCodeLine(line: { number: number; text: string }): string {
  return renderCodeLineButton({
    lineNumber: line.number,
    text: line.text,
    isSelected: isLineInRange(line.number, state.selectedRange),
    isHighlighted: line.number === state.highlightedLine,
    action: "select-line",
  });
}

function renderContextPanel(): string {
  const chips = state.contextChips
    .map(
      (chip) =>
        renderContextChipPill({
          id: chip.id,
          kind: chip.kind,
          label: chip.label,
          action: "remove-chip",
        }),
    )
    .join("");

  const resolved = state.resolvedContext
    ? `<p class="meta">Estimated ${state.resolvedContext.estimatedToken} tokens. ${escapeHTML(state.resolvedContext.warnings.join(" "))}</p>`
    : `<p class="meta">Select lines and add context before asking.</p>`;

  return `
    <section class="panel context-panel" aria-label="Context basket">
      ${renderPanelHeader({
        eyebrow: "Add context",
        title: "Context Basket",
        actionLabel: "Add",
        action: "add-context",
        actionDisabled: !state.selectedRange,
      })}
      <div class="chip-row">${chips || `<span class="muted">No context yet.</span>`}</div>
      ${resolved}
    </section>
  `;
}

function renderChatPanel(): string {
  return `
    <section class="panel chat-panel" aria-label="Ask AI">
      ${renderPanelHeader({
        eyebrow: "Ask",
        title: "Mock Agentic Reading",
        trailingContent: `<span class="mini-state ${state.isChatRunning ? "running" : ""}">${state.isChatRunning ? "Running" : "Idle"}</span>`,
      })}
      <textarea data-role="question-input" aria-label="Ask about this code">${escapeHTML(state.question)}</textarea>
      <button class="primary-action wide" data-action="ask" ${state.contextChips.length ? "" : "disabled"}>
        Ask with context
      </button>
      ${renderToolCallLog({
        title: "ToolCallLog",
        items: state.toolLog,
        emptyText: "No tool calls yet.",
      })}
      ${renderAnswerCard({
        answer: state.answer,
        emptyText: "The mock answer will stream here.",
      })}
    </section>
  `;
}

function renderNotePanel(): string {
  const canSave = Boolean(state.answer && !state.isChatRunning);
  const note = state.savedNote
    ? renderSavedNoteCard({
        title: state.savedNote.title,
        bodyPreview: `${state.savedNote.body.slice(0, 120)}${state.savedNote.body.length > 120 ? "..." : ""}`,
        actionLabel: "Jump back to source",
        action: "jump-note",
      })
    : `<p class="meta">Save appears after the mock answer completes.</p>`;

  return `
    <section class="panel note-panel" aria-label="Save note">
      ${renderPanelHeader({
        eyebrow: "Save",
        title: "Note",
        actionLabel: "Save",
        action: "save-note",
        actionDisabled: !canSave,
      })}
      ${note}
    </section>
  `;
}

function bindEvents(): void {
  app.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.action;
      if (action === "open-repo") void openRepo();
      if (action === "use-suggested") useSuggestedRange();
      if (action === "select-line") selectLine(Number(element.dataset.line));
      if (action === "add-context") void addContext();
      if (action === "remove-chip") void removeChip(element.dataset.chipId ?? "");
      if (action === "ask") void ask();
      if (action === "save-note") void persistNote();
      if (action === "jump-note") jumpToSavedNote();
      if (action === "search") void runSearch();
      if (action === "jump-search") jumpToLine(Number(element.dataset.line));
    });
  });

  app.querySelector<HTMLInputElement>('[data-role="search-input"]')?.addEventListener("input", (event) => {
    state.searchQuery = (event.target as HTMLInputElement).value;
  });

  app.querySelector<HTMLTextAreaElement>('[data-role="question-input"]')?.addEventListener("input", (event) => {
    state.question = (event.target as HTMLTextAreaElement).value;
  });
}

async function openRepo(): Promise<void> {
  try {
    const repo = state.repos[0] ?? (await getMockRepos())[0];
    state.activeRepo = repo;
    state.reader = await getReaderPayload(repo.id, repo.recommendedFile);
    state.selectedRange = null;
    state.contextChips = [];
    state.resolvedContext = null;
    state.answer = "";
    state.toolLog = [];
    state.savedNote = null;
    state.searchResults = [];
    state.status = "Mock file opened from Go API.";
    state.error = null;
  } catch (error) {
    state.error = getErrorMessage(error);
  }
  render();
}

function useSuggestedRange(): void {
  if (!state.reader) return;
  state.selectedRange = state.reader.suggestedSelection;
  state.status = `Selected lines ${state.selectedRange.startLine}-${state.selectedRange.endLine}.`;
  render();
}

function selectLine(line: number): void {
  if (!state.reader) return;
  state.selectedRange = {
    filePath: state.reader.filePath,
    startLine: line,
    endLine: line,
  };
  state.status = `Selected line ${line}.`;
  render();
}

async function addContext(): Promise<void> {
  if (!state.selectedRange) return;

  const chip: ContextChip = {
    id: `selection:${state.selectedRange.filePath}:${state.selectedRange.startLine}-${state.selectedRange.endLine}`,
    kind: "selection",
    label: `${state.selectedRange.filePath}:${state.selectedRange.startLine}-${state.selectedRange.endLine}`,
    summary: "Selected source range from the reader.",
    range: state.selectedRange,
  };

  state.contextChips = [...state.contextChips.filter((item) => item.id !== chip.id), chip];
  state.resolvedContext = await resolveContext(state.contextChips);
  state.status = "Context resolved by Go API.";
  render();
}

async function removeChip(chipId: string): Promise<void> {
  state.contextChips = state.contextChips.filter((chip) => chip.id !== chipId);
  try {
    state.resolvedContext = state.contextChips.length ? await resolveContext(state.contextChips) : null;
    state.status = "Context chip removed.";
  } catch (error) {
    state.error = getErrorMessage(error);
  }
  render();
}

async function ask(): Promise<void> {
  if (!state.contextChips.length || state.isChatRunning) return;

  try {
    state.chatSession = state.chatSession ?? (await createChatSession());
    state.answer = "";
    state.toolLog = [];
    state.isChatRunning = true;
    state.status = "Mock Agentic Reading is running.";
    render();

    const source = new EventSource(chatEventURL(state.chatSession.sessionId, state.question, state.contextChips));
    source.addEventListener("tool", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { name: string; summary: string };
      state.toolLog = [...state.toolLog, `${data.name}: ${data.summary}`];
      render();
    });
    source.addEventListener("delta", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as { text: string };
      state.answer += data.text;
      render();
    });
    source.addEventListener("done", () => {
      source.close();
      state.isChatRunning = false;
      state.status = "Mock answer completed. Save note is ready.";
      render();
    });
    source.onerror = () => {
      source.close();
      state.isChatRunning = false;
      state.error = "Mock chat stream failed. Is the Go API running?";
      render();
    };
  } catch (error) {
    state.isChatRunning = false;
    state.error = getErrorMessage(error);
    render();
  }
}

async function persistNote(): Promise<void> {
  if (!state.answer) return;
  const anchors = state.contextChips.map((chip) => chip.range);
  state.savedNote = await saveNote("Context basket explanation", state.answer, anchors);
  state.status = "Saved note without leaving the reader.";
  render();
}

async function runSearch(): Promise<void> {
  if (!state.reader) return;
  state.searchResults = await search(state.reader.projectId, state.searchQuery);
  state.status = `Search returned ${state.searchResults.length} result(s).`;
  render();
}

function jumpToSavedNote(): void {
  const firstAnchor = state.savedNote?.anchors[0];
  if (!firstAnchor) return;
  jumpToLine(firstAnchor.startLine);
}

function jumpToLine(line: number): void {
  state.highlightedLine = line;
  state.status = `Jumped back to line ${line}.`;
  render();
  requestAnimationFrame(() => {
    app.querySelector<HTMLElement>(`[data-line="${line}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

function isLineInRange(line: number, range: SourceRange | null): boolean {
  return Boolean(range && line >= range.startLine && line <= range.endLine);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
