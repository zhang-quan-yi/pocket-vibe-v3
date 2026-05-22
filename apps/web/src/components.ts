export type TopBarProps = {
  eyebrow: string;
  title: string;
  status: string;
};

export type WorkspaceBandProps = {
  title: string;
  description: string;
  actionLabel: string;
  action: string;
};

export type EmptyReaderStateProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export type ReaderHeaderProps = {
  eyebrow: string;
  title: string;
  actionLabel: string;
  action: string;
};

export type SearchBarProps = {
  value: string;
  inputRole: string;
  inputAriaLabel: string;
  actionLabel: string;
  action: string;
};

export type SearchResultItemProps = {
  filePath: string;
  line: number;
  preview: string;
  action: string;
};

export type CodeLineButtonProps = {
  lineNumber: number;
  text: string;
  isSelected: boolean;
  isHighlighted: boolean;
  action: string;
};

export type PanelHeaderProps = {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  action?: string;
  actionDisabled?: boolean;
  trailingContent?: string;
};

export type ContextChipPillProps = {
  id: string;
  kind: string;
  label: string;
  action: string;
};

export type ToolCallLogProps = {
  title: string;
  items: string[];
  emptyText: string;
};

export type AnswerCardProps = {
  answer: string;
  emptyText: string;
};

export type SavedNoteCardProps = {
  title: string;
  bodyPreview: string;
  actionLabel: string;
  action: string;
};

export function renderTopBar(props: TopBarProps): string {
  return `
    <header class="topbar">
      <div class="brand-lockup">
        <span class="brand-mark" aria-hidden="true">PV</span>
        <div>
          <p class="eyebrow">${escapeHTML(props.eyebrow)}</p>
          <h1>${escapeHTML(props.title)}</h1>
        </div>
      </div>
      <span class="status-pill">${escapeHTML(props.status)}</span>
    </header>
  `;
}

export function renderWorkspaceBand(props: WorkspaceBandProps): string {
  return `
    <section class="workspace-band" aria-label="Repository">
      <div>
        <h2>${escapeHTML(props.title)}</h2>
        <p>${escapeHTML(props.description)}</p>
      </div>
      <button class="primary-action" data-action="${escapeHTML(props.action)}">${escapeHTML(props.actionLabel)}</button>
    </section>
  `;
}

export function renderEmptyReaderState(props: EmptyReaderStateProps): string {
  return `
    <div class="empty-reader">
      <p class="eyebrow">${escapeHTML(props.eyebrow)}</p>
      <h2>${escapeHTML(props.title)}</h2>
      <p>${escapeHTML(props.description)}</p>
    </div>
  `;
}

export function renderReaderHeader(props: ReaderHeaderProps): string {
  return `
    <div class="reader-header">
      <div>
        <p class="eyebrow">${escapeHTML(props.eyebrow)}</p>
        <h2>${escapeHTML(props.title)}</h2>
      </div>
      <button class="secondary-action" data-action="${escapeHTML(props.action)}">${escapeHTML(props.actionLabel)}</button>
    </div>
  `;
}

export function renderSearchBar(props: SearchBarProps): string {
  return `
    <div class="search-row">
      <input
        aria-label="${escapeHTML(props.inputAriaLabel)}"
        value="${escapeHTML(props.value)}"
        data-role="${escapeHTML(props.inputRole)}"
      />
      <button class="secondary-action" data-action="${escapeHTML(props.action)}">${escapeHTML(props.actionLabel)}</button>
    </div>
  `;
}

export function renderSearchResultItem(props: SearchResultItemProps): string {
  return `
    <button class="search-result" data-action="${escapeHTML(props.action)}" data-line="${props.line}">
      <span>${escapeHTML(props.filePath)}:${props.line}</span>
      <code>${escapeHTML(props.preview)}</code>
    </button>
  `;
}

export function renderCodeLineButton(props: CodeLineButtonProps): string {
  const className = ["code-line", props.isSelected ? "selected" : "", props.isHighlighted ? "highlighted" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <button class="${className}" data-action="${escapeHTML(props.action)}" data-line="${props.lineNumber}">
      <span class="line-no">${props.lineNumber}</span>
      <code>${escapeHTML(props.text || " ")}</code>
    </button>
  `;
}

export function renderPanelHeader(props: PanelHeaderProps): string {
  const button =
    props.action && props.actionLabel
      ? `<button class="secondary-action" data-action="${escapeHTML(props.action)}" ${props.actionDisabled ? "disabled" : ""}>${escapeHTML(props.actionLabel)}</button>`
      : "";

  return `
    <div class="panel-head">
      <div>
        <p class="eyebrow">${escapeHTML(props.eyebrow)}</p>
        <h2>${escapeHTML(props.title)}</h2>
      </div>
      ${props.trailingContent ?? button}
    </div>
  `;
}

export function renderContextChipPill(props: ContextChipPillProps): string {
  return `
    <button class="context-chip" data-action="${escapeHTML(props.action)}" data-chip-id="${escapeHTML(props.id)}">
      <span class="chip-kind">${escapeHTML(props.kind)}</span>
      <span class="chip-label">${escapeHTML(props.label)}</span>
    </button>
  `;
}

export function renderToolCallLog(props: ToolCallLogProps): string {
  const items = props.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  return `
    <div class="tool-log">
      <strong>${escapeHTML(props.title)}</strong>
      <ul>${items || `<li>${escapeHTML(props.emptyText)}</li>`}</ul>
    </div>
  `;
}

export function renderAnswerCard(props: AnswerCardProps): string {
  return `
    <article class="answer ${props.answer ? "" : "empty"}">
      ${props.answer ? escapeHTML(props.answer) : escapeHTML(props.emptyText)}
    </article>
  `;
}

export function renderSavedNoteCard(props: SavedNoteCardProps): string {
  return `
    <div class="saved-note">
      <strong>${escapeHTML(props.title)}</strong>
      <p>${escapeHTML(props.bodyPreview)}</p>
      <button class="secondary-action" data-action="${escapeHTML(props.action)}">${escapeHTML(props.actionLabel)}</button>
    </div>
  `;
}

export function escapeHTML(value: string): string {
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
