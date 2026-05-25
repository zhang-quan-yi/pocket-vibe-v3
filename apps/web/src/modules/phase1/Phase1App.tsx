import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  Button,
  Field,
  IconButton,
  SourcePreviewCard,
  StatusPill,
  Textarea,
  ToolCallLog,
  usePvToast,
  type ToolCallItem,
} from "../../shared/ui";
import type {
  AnnotationView,
  ChatMessageView,
  ChatMode,
  ChatRunStatus,
  ContextChip,
  MockRepoSummary,
  ReaderPanel,
  ReaderPayload,
  ReadingTrailItem,
  SavedAnswerView,
  SearchResult,
  SourceRange,
  SourceReference,
} from "../../shared/schema/phase1";
import { findPayload, mockRepos, quoteRange, searchResults, sourceRangeLabel } from "./mockData";

const streamChunks = [
  "This selection resolves a visible context chip before the question is sent. ",
  "The important boundary is that Reader state becomes a SourceRange, not DOM state. ",
  "That makes the saved answer able to jump back to the same source range later.",
];

export function CAppShellContainer() {
  const app = useAppShellApp();

  return (
    <CAppShell currentProjectName={app.currentProject?.name} phaseLabel="Phase 1 Mock Skeleton">
      {app.currentProject ? (
        <CReaderWorkbenchContainer projectId={app.currentProject.projectId} onBackToRepos={app.closeProject} />
      ) : (
        <CMockRepoPickerContainer onOpenProject={app.openProject} />
      )}
    </CAppShell>
  );
}

function useAppShellApp() {
  const [currentProjectId, setCurrentProjectId] = useState<string>();
  const currentProject = mockRepos.find((repo) => repo.projectId === currentProjectId);

  return {
    currentProject,
    openProject: setCurrentProjectId,
    closeProject: () => setCurrentProjectId(undefined),
  };
}

function CAppShell({
  currentProjectName,
  phaseLabel,
  children,
}: {
  currentProjectName?: string;
  phaseLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="phase-app" aria-label="Pocket Vibe Phase 1 mock app">
      <header className="phase-topbar">
        <div className="phase-brand">
          <span className="phase-brand__mark">PV</span>
          <div>
            <p className="eyebrow">{phaseLabel}</p>
            <h1>Pocket Vibe Reader</h1>
            <p className="phase-muted">
              {currentProjectName ? `Reading ${currentProjectName}` : "Choose a mock repo to start the reading loop."}
            </p>
          </div>
        </div>
        <div className="phase-status-row" aria-label="Demo status">
          <StatusPill tone="ready">Reader first</StatusPill>
          <StatusPill tone="context">Context visible</StatusPill>
          <StatusPill tone="neutral">Mock API</StatusPill>
        </div>
      </header>
      {children}
    </main>
  );
}

function CMockRepoPickerContainer({ onOpenProject }: { onOpenProject: (projectId: string) => void }) {
  const repoPicker = useMockRepoPickerApp(mockRepos);

  return (
    <CMockRepoPicker
      repos={mockRepos}
      selectedRepoId={repoPicker.selectedRepoId}
      onSelectRepo={repoPicker.setSelectedRepoId}
      onOpenRepo={() => onOpenProject(repoPicker.selectedRepoId)}
    />
  );
}

function useMockRepoPickerApp(repos: MockRepoSummary[]) {
  const [selectedRepoId, setSelectedRepoId] = useState(repos[0]?.projectId ?? "");

  return {
    selectedRepoId,
    setSelectedRepoId,
  };
}

function CMockRepoPicker({
  repos,
  selectedRepoId,
  onSelectRepo,
  onOpenRepo,
}: {
  repos: MockRepoSummary[];
  selectedRepoId: string;
  onSelectRepo: (projectId: string) => void;
  onOpenRepo: () => void;
}) {
  return (
    <section className="mock-repo-picker" aria-label="Mock repository picker">
      <div className="mock-repo-picker__head">
        <div>
          <p className="eyebrow">Open app</p>
          <h2>Choose mock repo</h2>
        </div>
        <StatusPill tone="running">Walking skeleton</StatusPill>
      </div>
      <div className="mock-repo-grid">
        {repos.map((repo) => (
          <button
            className="mock-repo-card"
            data-selected={repo.projectId === selectedRepoId || undefined}
            key={repo.projectId}
            type="button"
            onClick={() => onSelectRepo(repo.projectId)}
          >
            <span>{repo.language}</span>
            <strong>{repo.name}</strong>
            <p>{repo.description}</p>
            <code>{repo.entryFile}</code>
          </button>
        ))}
      </div>
      <Button variant="primary" onClick={onOpenRepo}>
        Open mock repo
      </Button>
    </section>
  );
}

function CReaderWorkbenchContainer({
  projectId,
  onBackToRepos,
}: {
  projectId: string;
  onBackToRepos: () => void;
}) {
  const workbench = useReaderWorkbenchApp(projectId);

  return (
    <CReaderWorkbench
      activePanel={workbench.activePanel}
      payload={workbench.payload}
      projectName={workbench.project.name}
      selection={workbench.selection}
      highlightedRange={workbench.highlightedRange}
      chips={workbench.chips}
      tokenEstimate={workbench.tokenEstimate}
      searchQuery={workbench.searchQuery}
      searchResults={workbench.visibleSearchResults}
      previewResult={workbench.previewResult}
      chatMode={workbench.chatMode}
      chatDraft={workbench.chatDraft}
      chatStatus={workbench.chatStatus}
      messages={workbench.messages}
      toolCalls={workbench.toolCalls}
      savedAnswers={workbench.savedAnswers}
      annotations={workbench.annotations}
      annotationDraft={workbench.annotationDraft}
      trail={workbench.trail}
      onBackToRepos={onBackToRepos}
      onPanelChange={workbench.setActivePanel}
      onSelectRange={workbench.selectRange}
      onAddSelectionContext={workbench.addSelectionContext}
      onAddFileContext={workbench.addFileContext}
      onRemoveChip={workbench.removeChip}
      onPinChip={workbench.pinChip}
      onJumpRange={workbench.jumpToRange}
      onSearchQueryChange={workbench.setSearchQuery}
      onPreviewSearchResult={workbench.previewSearchResult}
      onExplainSearchResult={workbench.explainSearchResult}
      onOpenSearchResult={workbench.openSearchResult}
      onChatModeChange={workbench.setChatMode}
      onChatDraftChange={workbench.setChatDraft}
      onSendChat={workbench.sendChat}
      onCancelChat={workbench.cancelChat}
      onRetryChat={workbench.retryChat}
      onOpenSaveAnswer={workbench.openSaveAnswer}
      onSaveAnswer={workbench.saveAnswer}
      onAnnotationDraftChange={workbench.setAnnotationDraft}
      onSaveAnnotation={workbench.saveAnnotation}
    />
  );
}

function useReaderWorkbenchApp(projectId: string) {
  const { addToast } = usePvToast();
  const project = mockRepos.find((repo) => repo.projectId === projectId) ?? mockRepos[0];
  const [currentFilePath, setCurrentFilePath] = useState(project.entryFile);
  const [selection, setSelection] = useState<SourceRange>();
  const [highlightedRange, setHighlightedRange] = useState<SourceRange>();
  const [chips, setChips] = useState<ContextChip[]>([]);
  const [activePanel, setActivePanel] = useState<ReaderPanel>("none");
  const [searchQuery, setSearchQuery] = useState("context");
  const [previewResultId, setPreviewResultId] = useState<string>();
  const [chatMode, setChatMode] = useState<ChatMode>("ask");
  const [chatDraft, setChatDraft] = useState("Explain this selection and why the context chip matters.");
  const [chatStatus, setChatStatus] = useState<ChatRunStatus>("idle");
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [streamIndex, setStreamIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswerView[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationView[]>([]);
  const [annotationDraft, setAnnotationDraft] = useState("");
  const [trail, setTrail] = useState<ReadingTrailItem[]>([]);
  const payload = findPayload(projectId, currentFilePath);

  const visibleSearchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return searchResults.filter((result) => {
      if (result.projectId !== projectId) return false;
      if (!normalizedQuery) return true;
      return `${result.title} ${result.filePath} ${result.snippet}`.toLowerCase().includes(normalizedQuery);
    });
  }, [projectId, searchQuery]);

  const previewResult = visibleSearchResults.find((result) => result.resultId === previewResultId);

  const tokenEstimate = chips.reduce((total, chip) => total + (chip.tokenEstimate ?? 0), 0);

  const readyChipCount = chips.filter((chip) => chip.status === "ready" || chip.status === "pinned").length;

  const toolCalls: ToolCallItem[] = [
    {
      id: "resolve",
      label: "Resolved context",
      target: `${readyChipCount} ready chips`,
      status: chatStatus === "idle" ? "queued" : "completed",
      detail: "Selection and file chips are converted into platform-neutral source ranges.",
    },
    {
      id: "read",
      label: "Read source",
      target: payload.filePath,
      status: chatStatus === "streaming" ? "running" : chatStatus === "completed" ? "completed" : "queued",
      detail: "Mock reader payload is used instead of DOM selection state.",
    },
  ];

  useEffect(() => {
    if (chatStatus !== "streaming") return undefined;

    if (streamIndex >= streamChunks.length) {
      setChatStatus("completed");
      addToast({
        title: "Answer complete",
        description: "Save Answer is ready with visible source context.",
        type: "success",
      });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const chunk = streamChunks[streamIndex];
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.messageId === "assistant-stream"
            ? { ...message, content: `${message.content}${chunk}` }
            : message,
        ),
      );
      setStreamIndex((index) => index + 1);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [addToast, chatStatus, streamIndex]);

  function selectRange(range: SourceRange) {
    setSelection(range);
    setHighlightedRange(range);
    setChips((currentChips) => upsertChip(currentChips, createSelectionChip(projectId, range, "suggested")));
    setActivePanel("chat");
  }

  function addSelectionContext() {
    if (!selection) return;
    setChips((currentChips) => upsertChip(currentChips, createSelectionChip(projectId, selection, "ready")));
    addToast({
      title: "Context added",
      description: sourceRangeLabel(selection),
      type: "success",
    });
  }

  function addFileContext() {
    const fileRange = {
      filePath: payload.filePath,
      startLine: payload.lines[0]?.lineNumber ?? 1,
      endLine: payload.lines[payload.lines.length - 1]?.lineNumber ?? 1,
      label: payload.filePath,
    };
    setChips((currentChips) =>
      upsertChip(currentChips, {
        chipId: `file:${payload.filePath}`,
        type: "file",
        label: payload.filePath,
        projectId,
        filePath: payload.filePath,
        range: fileRange,
        status: "ready",
        tokenEstimate: 720,
      }),
    );
  }

  function removeChip(chipId: string) {
    setChips((currentChips) => currentChips.filter((chip) => chip.chipId !== chipId));
  }

  function pinChip(chipId: string) {
    setChips((currentChips) =>
      currentChips.map((chip) => (chip.chipId === chipId ? { ...chip, status: "pinned" } : chip)),
    );
  }

  function jumpToRange(range: SourceRange) {
    setCurrentFilePath(range.filePath);
    setHighlightedRange(range);
    setTrail((currentTrail) => [
      {
        trailId: `trail-${Date.now()}`,
        label: sourceRangeLabel(range),
        range,
      },
      ...currentTrail,
    ]);
    setActivePanel("none");
  }

  function previewSearchResult(resultId: string) {
    setPreviewResultId(resultId);
    setActivePanel("search");
  }

  function explainSearchResult(resultId: string) {
    const result = searchResults.find((item) => item.resultId === resultId);
    if (!result) return;
    setChips((currentChips) =>
      upsertChip(currentChips, {
        chipId: `search:${result.resultId}`,
        type: "searchResult",
        label: result.title,
        projectId,
        filePath: result.filePath,
        range: result.range,
        status: "ready",
        tokenEstimate: 280,
      }),
    );
    setChatDraft(`Explain the search hit ${result.title} and how it affects the current reader context.`);
    setActivePanel("chat");
  }

  function openSearchResult(result: SearchResult) {
    jumpToRange(result.range);
  }

  function sendChat() {
    if (readyChipCount === 0 || !chatDraft.trim()) return;
    setMessages([
      { messageId: `user-${Date.now()}`, role: "user", content: chatDraft.trim() },
      { messageId: "assistant-stream", role: "assistant", content: "" },
    ]);
    setStreamIndex(0);
    setChatStatus("streaming");
  }

  function cancelChat() {
    if (chatStatus !== "streaming") return;
    setChatStatus("cancelled");
    addToast({ title: "Chat cancelled", description: "Reader state and context chips are still available.", type: "info" });
  }

  function retryChat() {
    setChatStatus("idle");
    sendChat();
  }

  function openSaveAnswer() {
    if (chatStatus !== "completed") return;
    setActivePanel("save");
  }

  function saveAnswer() {
    const assistantAnswer = messages.find((message) => message.role === "assistant")?.content.trim();
    if (!assistantAnswer) return;
    const sourceRefs = chips
      .filter((chip) => chip.range && (chip.status === "ready" || chip.status === "pinned"))
      .map<SourceReference>((chip) => {
        const chipPayload = findPayload(projectId, chip.filePath);
        const range = chip.range as SourceRange;
        return {
          sourceRefId: `source-${chip.chipId}`,
          label: chip.label,
          range,
          quote: chipPayload ? quoteRange(chipPayload, range) : "",
        };
      });
    const savedAnswer: SavedAnswerView = {
      savedAnswerId: `saved-${Date.now()}`,
      title: selection?.label ? `Explain ${selection.label}` : "Saved reading answer",
      answerMarkdown: assistantAnswer,
      sourceRefs,
    };
    setSavedAnswers((currentAnswers) => [savedAnswer, ...currentAnswers]);
    setActivePanel("trail");
    addToast({
      title: "Saved Answer",
      description: "Saved with source references. Jump back is ready.",
      type: "success",
    });
  }

  function saveAnnotation() {
    if (!selection || !annotationDraft.trim()) return;
    const annotation: AnnotationView = {
      annotationId: `annotation-${Date.now()}`,
      text: annotationDraft.trim(),
      range: selection,
    };
    setAnnotations((currentAnnotations) => [annotation, ...currentAnnotations]);
    setAnnotationDraft("");
    setActivePanel("trail");
    addToast({
      title: "Annotation saved",
      description: sourceRangeLabel(selection),
      type: "success",
    });
  }

  return {
    activePanel,
    annotationDraft,
    annotations,
    chatDraft,
    chatMode,
    chatStatus,
    chips,
    highlightedRange,
    messages,
    payload,
    previewResult,
    project,
    savedAnswers,
    searchQuery,
    selection,
    tokenEstimate,
    toolCalls,
    trail,
    visibleSearchResults,
    addFileContext,
    addSelectionContext,
    cancelChat,
    explainSearchResult,
    jumpToRange,
    openSaveAnswer,
    openSearchResult,
    pinChip,
    previewSearchResult,
    removeChip,
    retryChat,
    saveAnnotation,
    saveAnswer,
    selectRange,
    sendChat,
    setActivePanel,
    setAnnotationDraft,
    setChatDraft,
    setChatMode,
    setSearchQuery,
  };
}

function CReaderWorkbench({
  activePanel,
  payload,
  projectName,
  selection,
  highlightedRange,
  chips,
  tokenEstimate,
  searchQuery,
  searchResults: visibleSearchResults,
  previewResult,
  chatMode,
  chatDraft,
  chatStatus,
  messages,
  toolCalls,
  savedAnswers,
  annotations,
  annotationDraft,
  trail,
  onBackToRepos,
  onPanelChange,
  onSelectRange,
  onAddSelectionContext,
  onAddFileContext,
  onRemoveChip,
  onPinChip,
  onJumpRange,
  onSearchQueryChange,
  onPreviewSearchResult,
  onExplainSearchResult,
  onOpenSearchResult,
  onChatModeChange,
  onChatDraftChange,
  onSendChat,
  onCancelChat,
  onRetryChat,
  onOpenSaveAnswer,
  onSaveAnswer,
  onAnnotationDraftChange,
  onSaveAnnotation,
}: {
  activePanel: ReaderPanel;
  payload: ReaderPayload;
  projectName: string;
  selection?: SourceRange;
  highlightedRange?: SourceRange;
  chips: ContextChip[];
  tokenEstimate: number;
  searchQuery: string;
  searchResults: SearchResult[];
  previewResult?: SearchResult;
  chatMode: ChatMode;
  chatDraft: string;
  chatStatus: ChatRunStatus;
  messages: ChatMessageView[];
  toolCalls: ToolCallItem[];
  savedAnswers: SavedAnswerView[];
  annotations: AnnotationView[];
  annotationDraft: string;
  trail: ReadingTrailItem[];
  onBackToRepos: () => void;
  onPanelChange: (panel: ReaderPanel) => void;
  onSelectRange: (range: SourceRange) => void;
  onAddSelectionContext: () => void;
  onAddFileContext: () => void;
  onRemoveChip: (chipId: string) => void;
  onPinChip: (chipId: string) => void;
  onJumpRange: (range: SourceRange) => void;
  onSearchQueryChange: (query: string) => void;
  onPreviewSearchResult: (resultId: string) => void;
  onExplainSearchResult: (resultId: string) => void;
  onOpenSearchResult: (result: SearchResult) => void;
  onChatModeChange: (mode: ChatMode) => void;
  onChatDraftChange: (draft: string) => void;
  onSendChat: () => void;
  onCancelChat: () => void;
  onRetryChat: () => void;
  onOpenSaveAnswer: () => void;
  onSaveAnswer: () => void;
  onAnnotationDraftChange: (draft: string) => void;
  onSaveAnnotation: () => void;
}) {
  return (
    <section className="reader-workbench">
      <div className="reader-workbench__main">
        <CWorkbenchTopBar
          activePanel={activePanel}
          filePath={payload.filePath}
          projectName={projectName}
          onBackToRepos={onBackToRepos}
          onOpenPanel={onPanelChange}
        />
        <CCodeReader payload={payload} highlightedRange={highlightedRange} onSelectRange={onSelectRange} />
      </div>
      <aside className="reader-workbench__side" aria-label="Reader tools">
        <CContextBasket
          chips={chips}
          selection={selection}
          tokenEstimate={tokenEstimate}
          onAddFileContext={onAddFileContext}
          onAddSelectionContext={onAddSelectionContext}
          onJumpRange={onJumpRange}
          onPinChip={onPinChip}
          onRemoveChip={onRemoveChip}
        />
        <CSearchPanel
          active={activePanel === "search"}
          previewResult={previewResult}
          query={searchQuery}
          results={visibleSearchResults}
          onExplainResult={onExplainSearchResult}
          onOpenResult={onOpenSearchResult}
          onPreviewResult={onPreviewSearchResult}
          onQueryChange={onSearchQueryChange}
        />
        <CChatSurface
          active={activePanel === "chat"}
          chips={chips}
          draft={chatDraft}
          messages={messages}
          mode={chatMode}
          status={chatStatus}
          toolCalls={toolCalls}
          onCancel={onCancelChat}
          onDraftChange={onChatDraftChange}
          onModeChange={onChatModeChange}
          onOpenSaveAnswer={onOpenSaveAnswer}
          onRetry={onRetryChat}
          onSend={onSendChat}
        />
        {activePanel === "save" ? <CSaveAnswerPanel onSaveAnswer={onSaveAnswer} /> : null}
        <CAnnotationPanel
          active={activePanel === "annotation"}
          annotationDraft={annotationDraft}
          selection={selection}
          onAnnotationDraftChange={onAnnotationDraftChange}
          onSaveAnnotation={onSaveAnnotation}
        />
        <CReadingTrail
          active={activePanel === "trail"}
          annotations={annotations}
          savedAnswers={savedAnswers}
          trail={trail}
          onJumpRange={onJumpRange}
        />
      </aside>
    </section>
  );
}

function CWorkbenchTopBar({
  activePanel,
  filePath,
  projectName,
  onBackToRepos,
  onOpenPanel,
}: {
  activePanel: ReaderPanel;
  filePath: string;
  projectName: string;
  onBackToRepos: () => void;
  onOpenPanel: (panel: ReaderPanel) => void;
}) {
  return (
    <div className="workbench-topbar">
      <div>
        <p className="eyebrow">{projectName}</p>
        <h2>{filePath}</h2>
      </div>
      <div className="workbench-actions">
        <Button variant="quiet" onClick={onBackToRepos}>
          Repos
        </Button>
        <IconButton
          icon={<span aria-hidden="true">S</span>}
          label="Open search"
          variant={activePanel === "search" ? "primary" : "secondary"}
          onClick={() => onOpenPanel("search")}
        />
        <IconButton
          icon={<span aria-hidden="true">C</span>}
          label="Open chat"
          variant={activePanel === "chat" ? "primary" : "secondary"}
          onClick={() => onOpenPanel("chat")}
        />
        <IconButton
          icon={<span aria-hidden="true">A</span>}
          label="Annotate selection"
          variant={activePanel === "annotation" ? "primary" : "secondary"}
          onClick={() => onOpenPanel("annotation")}
        />
        <IconButton
          icon={<span aria-hidden="true">T</span>}
          label="Open trail"
          variant={activePanel === "trail" ? "primary" : "secondary"}
          onClick={() => onOpenPanel("trail")}
        />
      </div>
    </div>
  );
}

function CCodeReader({
  payload,
  highlightedRange,
  onSelectRange,
}: {
  payload: ReaderPayload;
  highlightedRange?: SourceRange;
  onSelectRange: (range: SourceRange) => void;
}) {
  const symbolRanges = useMemo(() => {
    const ranges = new Map<string, SourceRange>();
    for (const line of payload.lines) {
      if (!line.symbolName) continue;
      const currentRange = ranges.get(line.symbolName);
      if (currentRange) {
        currentRange.endLine = line.lineNumber;
      } else {
        ranges.set(line.symbolName, {
          filePath: payload.filePath,
          startLine: line.lineNumber,
          endLine: line.lineNumber,
          label: line.symbolName,
        });
      }
    }
    return ranges;
  }, [payload.filePath, payload.lines]);

  return (
    <section className="code-reader-panel" aria-label="Read-only code reader">
      <div className="code-reader-panel__head">
        <div>
          <p className="eyebrow">{payload.language}</p>
          <h2>{payload.filePath}</h2>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            const preferredRange = symbolRanges.get("resolveContextChip") ?? Array.from(symbolRanges.values())[0];
            if (preferredRange) onSelectRange(preferredRange);
          }}
        >
          Select function
        </Button>
      </div>
      <div className="code-reader-lines">
        {payload.lines.map((line) => {
          const isHighlighted =
            highlightedRange?.filePath === payload.filePath &&
            line.lineNumber >= highlightedRange.startLine &&
            line.lineNumber <= highlightedRange.endLine;
          const lineRange = line.symbolName
            ? symbolRanges.get(line.symbolName)
            : { filePath: payload.filePath, startLine: line.lineNumber, endLine: line.lineNumber, label: `Line ${line.lineNumber}` };

          return (
            <button
              className="code-reader-line"
              data-highlighted={isHighlighted || undefined}
              key={line.lineNumber}
              type="button"
              onClick={() => lineRange && onSelectRange(lineRange)}
            >
              <span>{line.lineNumber}</span>
              <code>{line.text || " "}</code>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CContextBasket({
  chips,
  selection,
  tokenEstimate,
  onAddFileContext,
  onAddSelectionContext,
  onJumpRange,
  onPinChip,
  onRemoveChip,
}: {
  chips: ContextChip[];
  selection?: SourceRange;
  tokenEstimate: number;
  onAddFileContext: () => void;
  onAddSelectionContext: () => void;
  onJumpRange: (range: SourceRange) => void;
  onPinChip: (chipId: string) => void;
  onRemoveChip: (chipId: string) => void;
}) {
  return (
    <section className="phase-panel context-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Context Basket</p>
          <h2>AI visible context</h2>
        </div>
        <StatusPill tone="context">{tokenEstimate} tokens</StatusPill>
      </div>
      <div className="phase-chip-list">
        {chips.length === 0 ? <p className="phase-muted">Select code or add the current file before asking.</p> : null}
        {chips.map((chip) => (
          <article className="phase-context-chip" key={chip.chipId}>
            <button type="button" onClick={() => chip.range && onJumpRange(chip.range)}>
              <span>{chip.type}</span>
              <strong>{chip.label}</strong>
              <small>{chip.status}</small>
            </button>
            <div>
              <Button size="sm" variant="quiet" onClick={() => onPinChip(chip.chipId)}>
                Pin
              </Button>
              <Button size="sm" variant="quiet" onClick={() => onRemoveChip(chip.chipId)}>
                Remove
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="phase-action-row">
        <Button variant="secondary" onClick={onAddFileContext}>
          Add file
        </Button>
        <Button variant="primary" disabled={!selection} onClick={onAddSelectionContext}>
          Add selection
        </Button>
      </div>
    </section>
  );
}

function CSearchPanel({
  active,
  previewResult,
  query,
  results,
  onExplainResult,
  onOpenResult,
  onPreviewResult,
  onQueryChange,
}: {
  active: boolean;
  previewResult?: SearchResult;
  query: string;
  results: SearchResult[];
  onExplainResult: (resultId: string) => void;
  onOpenResult: (result: SearchResult) => void;
  onPreviewResult: (resultId: string) => void;
  onQueryChange: (query: string) => void;
}) {
  if (!active) return null;

  return (
    <section className="phase-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Search / Preview</p>
          <h2>Preview before jump</h2>
        </div>
        <StatusPill tone="neutral">{results.length} hits</StatusPill>
      </div>
      <Field label="Search code" value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} />
      <div className="phase-search-results">
        {results.map((result) => (
          <button key={result.resultId} type="button" onClick={() => onPreviewResult(result.resultId)}>
            <span>{result.filePath}</span>
            <strong>{result.title}</strong>
            <code>{result.snippet}</code>
          </button>
        ))}
      </div>
      {previewResult ? (
        <SourcePreviewCard
          path={previewResult.filePath}
          range={`L${previewResult.range.startLine}-L${previewResult.range.endLine}`}
          title={previewResult.title}
          snippet={previewResult.snippet}
          onPreview={() => onExplainResult(previewResult.resultId)}
          onJump={() => onOpenResult(previewResult)}
        />
      ) : null}
    </section>
  );
}

function CChatSurface({
  active,
  chips,
  draft,
  messages,
  mode,
  status,
  toolCalls,
  onCancel,
  onDraftChange,
  onModeChange,
  onOpenSaveAnswer,
  onRetry,
  onSend,
}: {
  active: boolean;
  chips: ContextChip[];
  draft: string;
  messages: ChatMessageView[];
  mode: ChatMode;
  status: ChatRunStatus;
  toolCalls: ToolCallItem[];
  onCancel: () => void;
  onDraftChange: (draft: string) => void;
  onModeChange: (mode: ChatMode) => void;
  onOpenSaveAnswer: () => void;
  onRetry: () => void;
  onSend: () => void;
}) {
  if (!active) return null;

  const readyChipCount = chips.filter((chip) => chip.status === "ready" || chip.status === "pinned").length;
  const canSend = readyChipCount > 0 && draft.trim().length > 0 && status !== "streaming";

  return (
    <section className="phase-panel chat-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Chat / Agent Surface</p>
          <h2>Ask with visible context</h2>
        </div>
        <StatusPill tone={status === "streaming" ? "running" : status === "completed" ? "ready" : "neutral"}>{status}</StatusPill>
      </div>
      <div className="phase-segmented" aria-label="Chat mode">
        {(["ask", "plan", "agentic"] as ChatMode[]).map((item) => (
          <button key={item} type="button" data-selected={item === mode || undefined} onClick={() => onModeChange(item)}>
            {item}
          </button>
        ))}
      </div>
      <p className="phase-muted">{readyChipCount} ready context chips will be sent.</p>
      <div className="phase-message-list">
        {messages.length === 0 ? <p className="phase-muted">No messages yet. Ask about the selected source range.</p> : null}
        {messages.map((message) => (
          <article className="phase-message" data-role={message.role} key={message.messageId}>
            <strong>{message.role === "user" ? "You" : "Pocket Vibe"}</strong>
            <p>{message.content || (status === "streaming" ? "Reading visible context..." : "")}</p>
          </article>
        ))}
      </div>
      <ToolCallLog title="Mock ToolCallLog" items={toolCalls} compact={status === "idle"} />
      <Textarea
        label="Question"
        value={draft}
        onChange={(event) => onDraftChange(event.currentTarget.value)}
        description={readyChipCount === 0 ? "Add at least one ready context chip before sending." : "Context is visible above."}
      />
      <div className="phase-action-row">
        {status === "streaming" ? (
          <Button variant="danger" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button variant="primary" disabled={!canSend} onClick={onSend}>
            Ask mock chat
          </Button>
        )}
        <Button variant="secondary" disabled={status === "streaming"} onClick={onRetry}>
          Retry
        </Button>
        <Button variant="secondary" disabled={status !== "completed"} onClick={onOpenSaveAnswer}>
          Save Answer
        </Button>
      </div>
    </section>
  );
}

function CSaveAnswerPanel({ onSaveAnswer }: { onSaveAnswer: () => void }) {
  return (
    <section className="phase-panel note-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Save Answer</p>
          <h2>Save without leaving Reader</h2>
        </div>
        <StatusPill tone="anchor">Source refs</StatusPill>
      </div>
      <p className="phase-muted">The saved answer keeps a snapshot of the visible context chips and source ranges.</p>
      <Button variant="primary" onClick={onSaveAnswer}>
        Save answer
      </Button>
    </section>
  );
}

function CAnnotationPanel({
  active,
  annotationDraft,
  selection,
  onAnnotationDraftChange,
  onSaveAnnotation,
}: {
  active: boolean;
  annotationDraft: string;
  selection?: SourceRange;
  onAnnotationDraftChange: (draft: string) => void;
  onSaveAnnotation: () => void;
}) {
  if (!active) return null;

  return (
    <section className="phase-panel note-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Annotation</p>
          <h2>Code-side note</h2>
        </div>
        <StatusPill tone={selection ? "ready" : "warning"}>{selection ? "Target ready" : "No selection"}</StatusPill>
      </div>
      <Textarea
        label="Short annotation"
        value={annotationDraft}
        onChange={(event) => onAnnotationDraftChange(event.currentTarget.value)}
        description={selection ? sourceRangeLabel(selection) : "Select a source range first."}
      />
      <Button variant="primary" disabled={!selection || !annotationDraft.trim()} onClick={onSaveAnnotation}>
        Save annotation
      </Button>
    </section>
  );
}

function CReadingTrail({
  active,
  annotations,
  savedAnswers,
  trail,
  onJumpRange,
}: {
  active: boolean;
  annotations: AnnotationView[];
  savedAnswers: SavedAnswerView[];
  trail: ReadingTrailItem[];
  onJumpRange: (range: SourceRange) => void;
}) {
  if (!active) return null;

  return (
    <section className="phase-panel trail-panel">
      <div className="phase-panel__head">
        <div>
          <p className="eyebrow">Trail / Notes</p>
          <h2>Jump back to source</h2>
        </div>
        <StatusPill tone="anchor">{savedAnswers.length} saved</StatusPill>
      </div>
      {savedAnswers.map((answer) => (
        <article className="phase-saved-answer" key={answer.savedAnswerId}>
          <strong>{answer.title}</strong>
          <p>{answer.answerMarkdown}</p>
          {answer.sourceRefs.map((sourceRef) => (
            <Button key={sourceRef.sourceRefId} size="sm" variant="secondary" onClick={() => onJumpRange(sourceRef.range)}>
              Jump {sourceRef.label}
            </Button>
          ))}
        </article>
      ))}
      {annotations.map((annotation) => (
        <article className="phase-saved-answer" key={annotation.annotationId}>
          <strong>Annotation</strong>
          <p>{annotation.text}</p>
          <Button size="sm" variant="secondary" onClick={() => onJumpRange(annotation.range)}>
            Jump annotation
          </Button>
        </article>
      ))}
      {trail.map((item) => (
        <button className="phase-trail-item" key={item.trailId} type="button" onClick={() => onJumpRange(item.range)}>
          {item.label}
        </button>
      ))}
      {savedAnswers.length === 0 && annotations.length === 0 && trail.length === 0 ? (
        <p className="phase-muted">Saved answers, annotations, and explicit jumps will appear here.</p>
      ) : null}
    </section>
  );
}

function createSelectionChip(projectId: string, range: SourceRange, status: ContextChip["status"]): ContextChip {
  return {
    chipId: `selection:${range.filePath}:${range.startLine}-${range.endLine}`,
    type: "selection",
    label: range.label ?? `L${range.startLine}-L${range.endLine}`,
    projectId,
    filePath: range.filePath,
    range,
    status,
    tokenEstimate: 220,
  };
}

function upsertChip(chips: ContextChip[], nextChip: ContextChip) {
  const exists = chips.some((chip) => chip.chipId === nextChip.chipId);
  if (!exists) return [nextChip, ...chips];
  return chips.map((chip) => (chip.chipId === nextChip.chipId ? nextChip : chip));
}
