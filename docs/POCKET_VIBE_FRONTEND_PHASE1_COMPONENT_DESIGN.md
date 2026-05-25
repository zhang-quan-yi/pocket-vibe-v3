# Pocket Vibe 第一阶段前端组件设计

## App Shell

### CAppShellContainer

```ts
type CAppShellContainerProps = {};
```

职责注释：

- 维护第一阶段 walking skeleton 的顶层状态。
- 选择 mock repo 后进入 Reader Workbench。
- 注入 toast、API client、mock fixtures 等 app 级依赖。

依赖关系：

- uses `useAppShellApp`
- renders `CAppShell`
- renders `CMockRepoPickerContainer`
- renders `CReaderWorkbenchContainer`

### CAppShell

```ts
type CAppShellProps = {
  currentProjectName?: string;
  phaseLabel: string;
  children: React.ReactNode;
};
```

职责注释：

- 渲染 Web/PWA 产品外壳。
- 展示当前项目、阶段状态和主要内容区。
- 不持有业务状态。

依赖关系：

- uses `Button`
- uses `StatusPill`

### CMockRepoPickerContainer

```ts
type CMockRepoPickerContainerProps = {
  onOpenProject: (projectId: string) => void;
};
```

职责注释：

- 维护 mock repo 选择状态。
- 触发进入 mock Reader 的动作。

依赖关系：

- uses `useMockRepoPickerApp`
- renders `CMockRepoPicker`

### CMockRepoPicker

```ts
type CMockRepoPickerProps = {
  repos: MockRepoSummary[];
  selectedRepoId?: string;
  onSelectRepo: (projectId: string) => void;
  onOpenRepo: () => void;
};
```

职责注释：

- 渲染 mock repo 列表和打开按钮。
- 展示空状态、选中态和不可用态。
- 不持有业务状态。

依赖关系：

- uses `Button`
- uses `StatusPill`

## Reader Workbench

### CReaderWorkbenchContainer

```ts
type CReaderWorkbenchContainerProps = {
  projectId: string;
  initialFilePath?: string;
};
```

职责注释：

- 维护当前文件、选区、活动面板、阅读轨迹和保存记录。
- 协调 Reader、Context Basket、Search、Chat、Save Answer、Annotation。
- 将 UI selection 转换成 `SourceRange`。

依赖关系：

- uses `useReaderWorkbenchApp`
- renders `CReaderWorkbench`
- renders `CCodeReaderContainer`
- renders `CContextBasketContainer`
- renders `CSearchPreviewContainer`
- renders `CChatSurfaceContainer`
- renders `CSaveAnswerTrayContainer`
- renders `CAnnotationMiniSheetContainer`

### CReaderWorkbench

```ts
type CReaderWorkbenchProps = {
  projectName: string;
  filePath?: string;
  activePanel: ReaderPanel;
  children: React.ReactNode;
};
```

职责注释：

- 渲染 Reader-first 的工作台布局。
- 在移动端承载主 Reader 和当前活动面板。
- 不持有业务状态。

依赖关系：

- uses `CWorkbenchTopBar`
- uses `CToolRail`

### CWorkbenchTopBar

```ts
type CWorkbenchTopBarProps = {
  projectName: string;
  filePath?: string;
  activeSymbolName?: string;
  onBackToRepos: () => void;
};
```

职责注释：

- 展示当前项目、文件路径和 sticky symbol 摘要。
- 提供返回 mock repo 列表入口。

依赖关系：

- uses `IconButton`
- uses `StatusPill`

### CToolRail

```ts
type CToolRailProps = {
  activePanel: ReaderPanel;
  disabledPanels?: ReaderPanel[];
  onOpenPanel: (panel: ReaderPanel) => void;
};
```

职责注释：

- 渲染 Search、Context、Chat、Notes、Trail 等显式入口。
- 保证移动端触摸目标可达。

依赖关系：

- uses `IconButton`

## Code Reader

### CCodeReaderContainer

```ts
type CCodeReaderContainerProps = {
  payload: ReaderPayload;
  selectedRange?: SourceRange;
  bookmarks: SourceBookmark[];
  onSelectionChange: (range?: SourceRange) => void;
  onJumpRequest: (target: SourceRange) => void;
};
```

职责注释：

- 维护只读代码显示所需的 UI selection。
- 将 Reader 事件转成平台无关 DTO。
- 不把 CodeMirror 或 DOM 类型暴露给其他模块。

依赖关系：

- uses `useCodeReaderApp`
- renders `CCodeReader`

### CCodeReader

```ts
type CCodeReaderProps = {
  filePath: string;
  language: string;
  lines: CodeLineView[];
  selectedRange?: SourceRange;
  bookmarks: SourceBookmark[];
  onLinePointerDown: (line: number) => void;
  onLinePointerUp: (line: number) => void;
  onBookmarkClick: (bookmarkId: string) => void;
};
```

职责注释：

- 渲染只读代码、行号、选区和 gutter bookmark。
- 不持有业务状态。

依赖关系：

- uses `CCodeLine`
- uses `CSourceBookmark`

### CCodeLine

```ts
type CCodeLineProps = {
  lineNumber: number;
  text: string;
  isSelected: boolean;
  isAnchorTarget: boolean;
  onPointerDown: (line: number) => void;
  onPointerUp: (line: number) => void;
};
```

职责注释：

- 渲染单行代码和选区态。
- 不解析业务语义。

依赖关系：

- none

### CSourceBookmark

```ts
type CSourceBookmarkProps = {
  bookmarkId: string;
  kind: "savedAnswer" | "annotation";
  status: "active" | "stale";
  label: string;
  onClick: (bookmarkId: string) => void;
};
```

职责注释：

- 渲染源码旁的保存回答或批注标记。
- 展示 active / stale 状态。

依赖关系：

- uses `StatusPill`

## Context Basket

### CContextBasketContainer

```ts
type CContextBasketContainerProps = {
  projectId: string;
  currentSelection?: SourceRange;
  chips: ContextChip[];
  onChipsChange: (chips: ContextChip[]) => void;
  onPreviewChip: (chipId: string) => void;
  onJumpToChip: (chipId: string) => void;
};
```

职责注释：

- 维护 ContextChip 添加、删除、pin、trim 的状态变更。
- 将当前 selection 转成 suggested chip。
- 生成发送前可见上下文列表。

依赖关系：

- uses `useContextBasketApp`
- renders `CContextBasket`
- renders `CContextChipList`
- renders `CAddContextSheetContainer`

### CContextBasket

```ts
type CContextBasketProps = {
  chips: ContextChip[];
  tokenEstimate: TokenEstimateView;
  collapsedChipCount: number;
  onOpenAddContext: () => void;
  onOpenSendPreview: () => void;
  onRemoveChip: (chipId: string) => void;
  onPinChip: (chipId: string) => void;
  onPreviewChip: (chipId: string) => void;
};
```

职责注释：

- 渲染当前会发送给 AI 的上下文摘要。
- 展示 token estimate 和 chip 状态。
- 不持有业务状态。

依赖关系：

- uses `Button`
- uses `StatusPill`
- uses `CContextChipList`

### CContextChipList

```ts
type CContextChipListProps = {
  chips: ContextChip[];
  maxVisible?: number;
  onRemoveChip: (chipId: string) => void;
  onPinChip: (chipId: string) => void;
  onPreviewChip: (chipId: string) => void;
};
```

职责注释：

- 渲染 context chips。
- 小屏时折叠超出数量。

依赖关系：

- renders `CContextChip`

### CContextChip

```ts
type CContextChipProps = {
  chip: ContextChip;
  onRemove: (chipId: string) => void;
  onPin: (chipId: string) => void;
  onPreview: (chipId: string) => void;
};
```

职责注释：

- 展示单个 context 的类型、来源、状态和 token 估算。
- 提供 remove、pin、preview 动作。

依赖关系：

- uses `IconButton`
- uses `StatusPill`

### CAddContextSheetContainer

```ts
type CAddContextSheetContainerProps = {
  open: boolean;
  candidates: ContextCandidate[];
  onOpenChange: (open: boolean) => void;
  onAddCandidate: (candidateId: string) => void;
};
```

职责注释：

- 维护 Add Context sheet 的候选选择状态。
- 把候选上下文提升为 ready chip。

依赖关系：

- uses `useAddContextApp`
- renders `CAddContextSheet`

### CAddContextSheet

```ts
type CAddContextSheetProps = {
  open: boolean;
  candidates: ContextCandidate[];
  onOpenChange: (open: boolean) => void;
  onAddCandidate: (candidateId: string) => void;
};
```

职责注释：

- 渲染可添加上下文列表。
- 不持有业务状态。

依赖关系：

- uses `Sheet`
- uses `Button`

## Search / Preview

### CSearchPreviewContainer

```ts
type CSearchPreviewContainerProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExplainResult: (resultId: string) => void;
  onOpenResult: (target: SourceRange) => void;
};
```

职责注释：

- 维护 search query、结果列表和当前 preview result。
- 区分 Preview、Explain、Open 三类动作。

依赖关系：

- uses `useSearchPreviewApp`
- renders `CSearchPanel`
- renders `CSourcePreviewSheet`

### CSearchPanel

```ts
type CSearchPanelProps = {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error?: string;
  onQueryChange: (query: string) => void;
  onPreviewResult: (resultId: string) => void;
};
```

职责注释：

- 渲染搜索输入、loading、错误和结果列表。
- 点击结果只进入 preview，不改变 Reader。

依赖关系：

- uses `Field`
- renders `CSearchResultList`

### CSearchResultList

```ts
type CSearchResultListProps = {
  results: SearchResult[];
  onPreviewResult: (resultId: string) => void;
};
```

职责注释：

- 渲染搜索结果列表。

依赖关系：

- renders `CSearchResultItem`

### CSearchResultItem

```ts
type CSearchResultItemProps = {
  result: SearchResult;
  onPreviewResult: (resultId: string) => void;
};
```

职责注释：

- 展示单条搜索结果的路径、行号和命中片段。

依赖关系：

- uses `Button`

### CSourcePreviewSheet

```ts
type CSourcePreviewSheetProps = {
  open: boolean;
  result?: SearchResult;
  onOpenChange: (open: boolean) => void;
  onExplain: (resultId: string) => void;
  onAddToContext: (resultId: string) => void;
  onOpenSource: (target: SourceRange) => void;
};
```

职责注释：

- 渲染搜索命中或 source reference 的半屏预览。
- 只有 `onOpenSource` 会触发主 Reader 跳转。

依赖关系：

- uses `Sheet`
- uses `SourcePreviewCard`
- uses `Button`

## Chat / Agent Surface

### CChatSurfaceContainer

```ts
type CChatSurfaceContainerProps = {
  projectId: string;
  open: boolean;
  chips: ContextChip[];
  onOpenChange: (open: boolean) => void;
  onSaveAnswer: (messageId: string) => void;
};
```

职责注释：

- 维护 chat draft、messages、streaming 状态和 mock ToolCallLog。
- 发送前读取可见 Context Basket。
- 暴露 Save Answer 入口。

依赖关系：

- uses `useChatSurfaceApp`
- renders `CChatSurface`
- renders `CChatMessageList`
- renders `CChatComposer`
- renders `CAgentToolLog`

### CChatSurface

```ts
type CChatSurfaceProps = {
  open: boolean;
  mode: ChatMode;
  chips: ContextChip[];
  messages: ChatMessageView[];
  toolCalls: ToolCallLogItem[];
  draft: string;
  status: ChatRunStatus;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: ChatMode) => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onSaveAnswer: (messageId: string) => void;
};
```

职责注释：

- 渲染 Chat 面板、上下文摘要、消息流、工具日志和输入区。
- 不持有业务状态。

依赖关系：

- uses `Sheet`
- uses `Tabs`
- uses `CContextBasket`
- renders `CChatMessageList`
- renders `CChatComposer`
- renders `CAgentToolLog`

### CChatMessageList

```ts
type CChatMessageListProps = {
  messages: ChatMessageView[];
  streamingMessageId?: string;
  onSaveAnswer: (messageId: string) => void;
};
```

职责注释：

- 渲染 chat 消息列表和 streaming 态。

依赖关系：

- renders `CChatMessage`

### CChatMessage

```ts
type CChatMessageProps = {
  message: ChatMessageView;
  isStreaming: boolean;
  onSaveAnswer: (messageId: string) => void;
};
```

职责注释：

- 渲染单条用户或 AI 消息。
- AI 回答完成后展示 Save Answer 动作。

依赖关系：

- uses `Button`
- uses `SourcePreviewCard`

### CChatComposer

```ts
type CChatComposerProps = {
  draft: string;
  status: ChatRunStatus;
  disabledReason?: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
};
```

职责注释：

- 渲染提问输入框、发送、取消和禁用原因。

依赖关系：

- uses `Textarea`
- uses `Button`

### CAgentToolLog

```ts
type CAgentToolLogProps = {
  title: string;
  items: ToolCallLogItem[];
};
```

职责注释：

- 渲染可检查的 mock ToolCallLog。

依赖关系：

- uses `ToolCallLog`

## Save Answer / Annotation

### CSaveAnswerTrayContainer

```ts
type CSaveAnswerTrayContainerProps = {
  open: boolean;
  answer?: ChatMessageView;
  chips: ContextChip[];
  onOpenChange: (open: boolean) => void;
  onSaved: (savedAnswerId: string) => void;
};
```

职责注释：

- 维护 Save Answer 草稿、保存状态和错误态。
- 保存 source reference 和 context chips 的快照。

依赖关系：

- uses `useSaveAnswerApp`
- renders `CSaveAnswerTray`

### CSaveAnswerTray

```ts
type CSaveAnswerTrayProps = {
  open: boolean;
  title: string;
  answerMarkdown: string;
  sourceRefs: SourceReference[];
  saveStatus: SaveStatus;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
};
```

职责注释：

- 渲染保存回答的标题、内容预览、source refs 和保存动作。
- 不持有业务状态。

依赖关系：

- uses `Sheet`
- uses `Field`
- uses `Button`
- uses `SourcePreviewCard`

### CAnnotationMiniSheetContainer

```ts
type CAnnotationMiniSheetContainerProps = {
  open: boolean;
  target?: SourceRange;
  onOpenChange: (open: boolean) => void;
  onSaved: (annotationId: string) => void;
};
```

职责注释：

- 维护批注草稿、保存状态和错误态。
- 保存当前行、函数或选区上的短批注。

依赖关系：

- uses `useAnnotationApp`
- renders `CAnnotationMiniSheet`

### CAnnotationMiniSheet

```ts
type CAnnotationMiniSheetProps = {
  open: boolean;
  targetLabel?: string;
  text: string;
  saveStatus: SaveStatus;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
};
```

职责注释：

- 渲染代码旁批注的轻量输入和保存动作。
- 不改变 Reader 位置。

依赖关系：

- uses `Sheet`
- uses `Textarea`
- uses `Button`

## Knowledge / Trail

### CSavedAnswerListContainer

```ts
type CSavedAnswerListContainerProps = {
  projectId: string;
  onJumpToSource: (target: SourceRange) => void;
};
```

职责注释：

- 维护已保存回答列表。
- 触发从 saved answer 跳回源码。

依赖关系：

- uses `useSavedAnswerListApp`
- renders `CSavedAnswerList`

### CSavedAnswerList

```ts
type CSavedAnswerListProps = {
  items: SavedAnswerView[];
  onOpenItem: (savedAnswerId: string) => void;
  onJumpToSource: (target: SourceRange) => void;
};
```

职责注释：

- 渲染保存回答列表。

依赖关系：

- renders `CSavedAnswerListItem`

### CSavedAnswerListItem

```ts
type CSavedAnswerListItemProps = {
  item: SavedAnswerView;
  onOpenItem: (savedAnswerId: string) => void;
  onJumpToSource: (target: SourceRange) => void;
};
```

职责注释：

- 展示单条保存回答摘要和 source jump 动作。

依赖关系：

- uses `Button`
- uses `SourcePreviewCard`

### CReadingTrail

```ts
type CReadingTrailProps = {
  items: ReadingTrailItem[];
  onJumpToSource: (target: SourceRange) => void;
  onAddTrailToContext: () => void;
};
```

职责注释：

- 渲染当前 session 的阅读轨迹。
- 支持跳回源码和加入上下文。

依赖关系：

- uses `Button`

## Shared UI Primitive

### Button

```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

职责注释：

- 提供基础按钮样式和可访问行为。

依赖关系：

- wraps Base UI Button

### IconButton

```ts
type IconButtonProps = {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};
```

职责注释：

- 提供仅图标按钮和可访问名称。

依赖关系：

- uses `Button`

### Field

```ts
type FieldProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  description?: string;
  error?: string;
  onChange?: (value: string) => void;
};
```

职责注释：

- 提供文本输入、标签、说明和错误展示。

依赖关系：

- none

### Textarea

```ts
type TextareaProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  description?: string;
  error?: string;
  onChange?: (value: string) => void;
};
```

职责注释：

- 提供多行输入、标签、说明和错误展示。

依赖关系：

- none

### Sheet

```ts
type SheetProps = {
  open?: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};
```

职责注释：

- 提供移动端优先的底部或半屏面板。

依赖关系：

- wraps Base UI Dialog primitive

### Dialog

```ts
type DialogProps = {
  open?: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};
```

职责注释：

- 提供阻断式确认或错误处理。

依赖关系：

- wraps Base UI Dialog primitive

### Popover

```ts
type PopoverProps = {
  open?: boolean;
  trigger: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};
```

职责注释：

- 提供局部动作菜单或 token action 面板。

依赖关系：

- wraps Base UI Popover primitive

### Tabs

```ts
type TabsProps = {
  value?: string;
  items: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
  }>;
  onValueChange?: (value: string) => void;
};
```

职责注释：

- 提供 Ask / Plan / Agentic Reading 等模式切换。

依赖关系：

- wraps Base UI Tabs primitive

### StatusPill

```ts
type StatusPillProps = {
  tone?: "neutral" | "ready" | "running" | "warning" | "danger" | "context";
  children: React.ReactNode;
};
```

职责注释：

- 渲染状态文本，不只依赖颜色传达状态。

依赖关系：

- none

### ToastProvider

```ts
type ToastProviderProps = {
  children: React.ReactNode;
};
```

职责注释：

- 提供全局 toast 状态和展示区域。

依赖关系：

- exposes `usePvToast`

### SourcePreviewCard

```ts
type SourcePreviewCardProps = {
  path: string;
  range: string;
  title?: string;
  status?: "preview" | "saved" | "stale" | "missing";
  snippet: string;
  onPreview?: () => void;
  onJump?: () => void;
};
```

职责注释：

- 渲染 source reference 的路径、范围、片段和 preview / jump 动作。

依赖关系：

- uses `Button`
- uses `StatusPill`

### ToolCallLog

```ts
type ToolCallLogProps = {
  title: string;
  items: ToolCallLogItem[];
};
```

职责注释：

- 渲染 Agent 工具调用日志。

依赖关系：

- uses `StatusPill`

