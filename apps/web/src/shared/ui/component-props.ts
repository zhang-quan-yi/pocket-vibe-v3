import type {
  ContextChip,
  Note,
  ReaderPayload,
  Repo,
  ResolvedContext,
  SearchResult,
  SourceRange,
  ToolCallLogEntry,
} from "../schema";

export type ComponentLayer = "primitive" | "layout" | "reader" | "context" | "agent" | "knowledge";

export type ComponentDefinition = {
  name: string;
  layer: ComponentLayer;
  propsType: string;
  role: string;
};

export const FRONTEND_BASE_COMPONENTS = [
  {
    name: "ActionButton",
    layer: "primitive",
    propsType: "ActionButtonProps",
    role: "Primary, secondary, and quiet command buttons.",
  },
  {
    name: "TextField",
    layer: "primitive",
    propsType: "TextFieldProps",
    role: "Single-line user input such as search and titles.",
  },
  {
    name: "TextAreaField",
    layer: "primitive",
    propsType: "TextAreaFieldProps",
    role: "Multi-line input for chat prompts and note drafts.",
  },
  {
    name: "StatusPill",
    layer: "primitive",
    propsType: "StatusPillProps",
    role: "Compact status text with an accessible tone.",
  },
  {
    name: "InlineNotice",
    layer: "primitive",
    propsType: "InlineNoticeProps",
    role: "Small success, warning, error, or info message.",
  },
  {
    name: "Panel",
    layer: "layout",
    propsType: "PanelProps",
    role: "Bounded work surface for context, chat, notes, or search.",
  },
  {
    name: "BottomSheet",
    layer: "layout",
    propsType: "BottomSheetProps",
    role: "Mobile-first overlay for previews and pickers.",
  },
  {
    name: "TokenMeter",
    layer: "context",
    propsType: "TokenMeterProps",
    role: "Shows context size before an ask is sent.",
  },
  {
    name: "ContextChipView",
    layer: "context",
    propsType: "ContextChipViewProps",
    role: "Visible unit of AI context.",
  },
  {
    name: "ContextBasketPanel",
    layer: "context",
    propsType: "ContextBasketPanelProps",
    role: "Collects chips, token estimate, and add/remove actions.",
  },
  {
    name: "CodeReader",
    layer: "reader",
    propsType: "CodeReaderProps",
    role: "Read-only source presentation plus selection affordances.",
  },
  {
    name: "SearchResults",
    layer: "reader",
    propsType: "SearchResultsProps",
    role: "Preview-first search result list.",
  },
  {
    name: "ChatPanel",
    layer: "agent",
    propsType: "ChatPanelProps",
    role: "Context-aware ask surface with answer and tool log.",
  },
  {
    name: "SaveNotePanel",
    layer: "knowledge",
    propsType: "SaveNotePanelProps",
    role: "Saves an answer without leaving the reader.",
  },
] as const satisfies readonly ComponentDefinition[];

export type ComponentTone = "neutral" | "primary" | "context" | "success" | "warning" | "danger";

export type ComponentSize = "sm" | "md" | "lg";

export type ComponentDensity = "compact" | "comfortable";

export type ComponentState = "idle" | "loading" | "running" | "success" | "warning" | "error" | "disabled";

export type BaseComponentProps = {
  id?: string;
  className?: string;
  ariaLabel?: string;
  testId?: string;
  hidden?: boolean;
};

export type CommandAction = {
  id: string;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
  busy?: boolean;
  data?: Record<string, string | number | boolean>;
};

export type ActionButtonProps = BaseComponentProps & {
  action: CommandAction;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: ComponentSize;
  fullWidth?: boolean;
};

export type TextFieldProps = BaseComponentProps & {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  inputMode?: "text" | "search" | "url";
};

export type TextAreaFieldProps = BaseComponentProps & {
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minRows?: number;
  maxRows?: number;
};

export type StatusPillProps = BaseComponentProps & {
  label: string;
  tone?: ComponentTone;
  state?: ComponentState;
};

export type InlineNoticeProps = BaseComponentProps & {
  title?: string;
  message: string;
  tone: Exclude<ComponentTone, "primary" | "context">;
  action?: CommandAction;
};

export type EmptyStateProps = BaseComponentProps & {
  eyebrow?: string;
  title: string;
  body: string;
  primaryAction?: CommandAction;
  secondaryAction?: CommandAction;
};

export type PanelProps = BaseComponentProps & {
  eyebrow?: string;
  title: string;
  tone?: ComponentTone;
  density?: ComponentDensity;
  primaryAction?: CommandAction;
  secondaryAction?: CommandAction;
};

export type BottomSheetProps = PanelProps & {
  open: boolean;
  closeAction: CommandAction;
  snap?: "content" | "half" | "full";
};

export type TopBarProps = BaseComponentProps & {
  productName: string;
  eyebrow?: string;
  status: StatusPillProps;
};

export type RepoBandProps = BaseComponentProps & {
  repo: Repo | null;
  hasReader: boolean;
};

export type ProjectSummaryProps = BaseComponentProps & {
  repo: Repo | null;
};

export type ReaderWorkbenchLayoutProps = BaseComponentProps & {
  readerOpen: boolean;
  activePanel: "none" | "search" | "definition" | "references" | "chat" | "cards" | "trail";
  chatMode: "closed" | "half" | "full";
};

export type CodeReaderProps = BaseComponentProps & {
  reader: ReaderPayload | null;
  selectedRange: SourceRange | null;
  highlightedLine: number | null;
  searchQuery: string;
  searchResults: readonly SearchResult[];
};

export type CodeLineProps = BaseComponentProps & {
  number: number;
  text: string;
  selected?: boolean;
  highlighted?: boolean;
  selectable?: boolean;
};

export type SearchBoxProps = BaseComponentProps & {
  query: string;
  placeholder?: string;
  canSearch: boolean;
};

export type SearchResultsProps = BaseComponentProps & {
  results: readonly SearchResult[];
};

export type ContextChipDisplayStatus =
  | "suggested"
  | "ready"
  | "pinned"
  | "stale"
  | "missing"
  | "oversized"
  | "trimmed";

export type ContextChipViewProps = BaseComponentProps & {
  chip: ContextChip;
  status?: ContextChipDisplayStatus;
  removable?: boolean;
  pinned?: boolean;
};

export type TokenMeterProps = BaseComponentProps & {
  estimatedToken: number;
  budgetToken?: number;
  warnings?: readonly string[];
};

export type ContextBasketPanelProps = BaseComponentProps & {
  chips: readonly ContextChip[];
  resolvedContext: ResolvedContext | null;
  canAddContext: boolean;
  maxVisibleChips?: number;
  tokenBudget?: number;
};

export type ChatMode = "ask" | "plan" | "agentic-reading" | "study-note-draft";

export type ToolCallLogProps = BaseComponentProps & {
  entries: readonly ToolCallLogEntry[];
  collapsed?: boolean;
};

export type ChatPanelProps = BaseComponentProps & {
  question: string;
  answer: string;
  toolLog: readonly ToolCallLogEntry[];
  isChatRunning: boolean;
  canAsk: boolean;
  mode?: ChatMode;
  placeholder?: string;
};

export type SaveNotePanelProps = BaseComponentProps & {
  note: Note | null;
  canSave: boolean;
};
