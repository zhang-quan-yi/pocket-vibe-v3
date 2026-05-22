import {
  chatEventURL,
  createChatSession,
  getMockRepos,
  getReaderPayload,
  resolveContext,
  saveNote,
  search,
} from "../shared/api/client";
import { getErrorMessage } from "../shared/utils/errors";
import type { ChatDeltaEventPayload, ChatToolEventPayload } from "../shared/schema";
import { createSelectionContextChip } from "../modules/context-basket/model";
import { renderAppShell } from "../modules/workbench/view";
import { createInitialAppState, type AppState } from "../modules/workbench/state";

export function createPocketVibeApp(appRoot: HTMLDivElement): void {
  const state = createInitialAppState();

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
    appRoot.innerHTML = renderAppShell(state);
    bindEvents();
  }

  function bindEvents(): void {
    appRoot.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => {
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

    appRoot.querySelector<HTMLInputElement>('[data-role="search-input"]')?.addEventListener("input", (event) => {
      state.searchQuery = (event.target as HTMLInputElement).value;
    });

    appRoot.querySelector<HTMLTextAreaElement>('[data-role="question-input"]')?.addEventListener("input", (event) => {
      state.question = (event.target as HTMLTextAreaElement).value;
    });
  }

  async function openRepo(): Promise<void> {
    try {
      const repo = state.repos[0] ?? (await getMockRepos())[0];
      state.activeRepo = repo;
      state.reader = await getReaderPayload(repo.id, repo.recommendedFile);
      resetWorkbenchState(state);
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

    try {
      const chip = createSelectionContextChip(state.selectedRange);
      state.contextChips = [...state.contextChips.filter((item) => item.id !== chip.id), chip];
      state.resolvedContext = await resolveContext(state.contextChips);
      state.status = "Context resolved by Go API.";
      state.error = null;
    } catch (error) {
      state.error = getErrorMessage(error);
    }
    render();
  }

  async function removeChip(chipId: string): Promise<void> {
    state.contextChips = state.contextChips.filter((chip) => chip.id !== chipId);
    try {
      state.resolvedContext = state.contextChips.length ? await resolveContext(state.contextChips) : null;
      state.status = "Context chip removed.";
      state.error = null;
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
      state.error = null;
      render();

      const source = new EventSource(chatEventURL(state.chatSession.sessionId, state.question, state.contextChips));
      source.addEventListener("tool", (event) => {
        const data = JSON.parse((event as MessageEvent).data) as ChatToolEventPayload;
        state.toolLog = [...state.toolLog, data];
        render();
      });
      source.addEventListener("delta", (event) => {
        const data = JSON.parse((event as MessageEvent).data) as ChatDeltaEventPayload;
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

    try {
      const anchors = state.contextChips.map((chip) => chip.range);
      state.savedNote = await saveNote("Context basket explanation", state.answer, anchors);
      state.status = "Saved note without leaving the reader.";
      state.error = null;
    } catch (error) {
      state.error = getErrorMessage(error);
    }
    render();
  }

  async function runSearch(): Promise<void> {
    if (!state.reader) return;

    try {
      state.searchResults = await search(state.reader.projectId, state.searchQuery);
      state.status = `Search returned ${state.searchResults.length} result(s).`;
      state.error = null;
    } catch (error) {
      state.error = getErrorMessage(error);
    }
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
      appRoot.querySelector<HTMLElement>(`[data-line="${line}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }
}

function resetWorkbenchState(state: AppState): void {
  state.selectedRange = null;
  state.contextChips = [];
  state.resolvedContext = null;
  state.answer = "";
  state.toolLog = [];
  state.savedNote = null;
  state.searchResults = [];
  state.highlightedLine = null;
}
