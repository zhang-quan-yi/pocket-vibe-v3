import {
  chatEventURL,
  createChatSession,
  getMockRepos,
  getReaderPayload,
  resolveContext,
  saveNote,
  search,
} from "./api";
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
      <header class="topbar">
        <div>
          <p class="eyebrow">Mock walking skeleton</p>
          <h1>Pocket Vibe</h1>
        </div>
        <span class="status-pill">${escapeHTML(state.status)}</span>
      </header>

      ${state.error ? `<div class="error-banner">${escapeHTML(state.error)}</div>` : ""}

      <section class="workspace-band" aria-label="Repository">
        <div>
          <h2>Repo</h2>
          <p>${escapeHTML(state.activeRepo?.description ?? "Choose a mock repo to start the shortest engineering path.")}</p>
        </div>
        <button class="primary-action" data-action="open-repo">${state.reader ? "Reload mock repo" : "Choose mock repo"}</button>
      </section>

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
    return `
      <div class="empty-reader">
        <p class="eyebrow">Read</p>
        <h2>No file open</h2>
        <p>Open the mock repo to load a reader payload from the Go API.</p>
      </div>
    `;
  }

  const searchResults = state.searchResults
    .map(
      (result) => `
        <button class="search-result" data-action="jump-search" data-line="${result.line}">
          <span>${escapeHTML(result.filePath)}:${result.line}</span>
          <code>${escapeHTML(result.preview)}</code>
        </button>
      `,
    )
    .join("");

  return `
    <div class="reader-header">
      <div>
        <p class="eyebrow">${escapeHTML(state.reader.language)}</p>
        <h2>${escapeHTML(state.reader.filePath)}</h2>
      </div>
      <button class="secondary-action" data-action="use-suggested">Use suggested range</button>
    </div>

    <div class="search-row">
      <input aria-label="Search code" value="${escapeHTML(state.searchQuery)}" data-role="search-input" />
      <button class="secondary-action" data-action="search">Search</button>
    </div>
    ${searchResults ? `<div class="search-results">${searchResults}</div>` : ""}

    <div class="code-reader" aria-label="Read-only source code">
      ${state.reader.lines.map(renderCodeLine).join("")}
    </div>
  `;
}

function renderCodeLine(line: { number: number; text: string }): string {
  const isSelected = isLineInRange(line.number, state.selectedRange);
  const isHighlighted = line.number === state.highlightedLine;
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

function renderContextPanel(): string {
  const chips = state.contextChips
    .map(
      (chip) => `
        <button class="chip" data-action="remove-chip" data-chip-id="${escapeHTML(chip.id)}">
          <span>${escapeHTML(chip.kind)}</span>
          ${escapeHTML(chip.label)}
        </button>
      `,
    )
    .join("");

  const resolved = state.resolvedContext
    ? `<p class="meta">Estimated ${state.resolvedContext.estimatedToken} tokens. ${state.resolvedContext.warnings.join(" ")}</p>`
    : `<p class="meta">Select lines and add context before asking.</p>`;

  return `
    <section class="panel" aria-label="Context basket">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Add context</p>
          <h2>Context Basket</h2>
        </div>
        <button class="secondary-action" data-action="add-context" ${state.selectedRange ? "" : "disabled"}>Add</button>
      </div>
      <div class="chip-row">${chips || `<span class="muted">No context yet.</span>`}</div>
      ${resolved}
    </section>
  `;
}

function renderChatPanel(): string {
  const toolLog = state.toolLog.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  return `
    <section class="panel" aria-label="Ask AI">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Ask</p>
          <h2>Mock Agentic Reading</h2>
        </div>
        <span class="mini-state">${state.isChatRunning ? "Running" : "Idle"}</span>
      </div>
      <textarea data-role="question-input" aria-label="Ask about this code">${escapeHTML(state.question)}</textarea>
      <button class="primary-action wide" data-action="ask" ${state.contextChips.length ? "" : "disabled"}>
        Ask with context
      </button>
      <div class="tool-log">
        <strong>ToolCallLog</strong>
        <ul>${toolLog || "<li>No tool calls yet.</li>"}</ul>
      </div>
      <article class="answer">
        ${state.answer ? escapeHTML(state.answer) : "The mock answer will stream here."}
      </article>
    </section>
  `;
}

function renderNotePanel(): string {
  const canSave = Boolean(state.answer && !state.isChatRunning);
  const note = state.savedNote
    ? `
      <div class="saved-note">
        <strong>${escapeHTML(state.savedNote.title)}</strong>
        <p>${escapeHTML(state.savedNote.body.slice(0, 120))}${state.savedNote.body.length > 120 ? "..." : ""}</p>
        <button class="secondary-action" data-action="jump-note">Jump back to source</button>
      </div>
    `
    : `<p class="meta">Save appears after the mock answer completes.</p>`;

  return `
    <section class="panel" aria-label="Save note">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Save</p>
          <h2>Note</h2>
        </div>
        <button class="secondary-action" data-action="save-note" ${canSave ? "" : "disabled"}>Save</button>
      </div>
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
      if (action === "remove-chip") removeChip(element.dataset.chipId ?? "");
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

function removeChip(chipId: string): void {
  state.contextChips = state.contextChips.filter((chip) => chip.id !== chipId);
  state.status = "Context chip removed.";
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

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] ?? char;
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
