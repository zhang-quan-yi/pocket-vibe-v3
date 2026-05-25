# Pocket Vibe 第一阶段前端开发设计

版本：Frontend Phase 1 Development Design v0.1  
日期：2026-05-25  
适用范围：`apps/web` Web/PWA walking skeleton  
约束来源：`docs/POCKET_VIBE_PROJECT_MANAGEMENT_PLAN.md`、`docs/POCKET_VIBE_WEB_PWA_FRONTEND_MODULE_DESIGN.md`、`docs/guideline/frontend.md`

## 1. 目标

第一阶段前端只证明 mock walking skeleton 能在浏览器中完整演示：

```text
Open app
  -> choose mock repo
  -> open mock file
  -> select code
  -> add context
  -> ask mock chat
  -> Save Answer
  -> jump back to source
```

前端实现要保护 Reader-first 和 Context-visible 两条原则：用户始终知道自己在读哪段代码，也能在发送 AI 问题前看见本次会带上哪些上下文。

## 2. 当前技术口径

当前可执行事实：

- `apps/web` 使用 Vite + React + TypeScript。
- 基础交互 primitive 已在 `apps/web/src/shared/ui` 中起步。
- Base UI 已作为 headless primitive 依赖引入。
- 第一阶段不引入路由库、全局状态库、组件框架迁移或完整 CodeMirror/LSP 前置依赖。

第一阶段组件开发继续遵守 `docs/guideline/frontend.md`：

- 基础组件放在 `apps/web/src/shared/ui`。
- 自定义业务组件以 `C` 开头。
- 普通组件不拥有状态，只负责模板渲染。
- 容器组件以 `Container` 结尾，只负责状态维护。
- 业务逻辑封装到 `useXXXApp` 方法中。

## 3. 第一阶段前端范围

必须交付：

- App Shell：提供 mock repo 入口、全局状态和 walking skeleton 起点。
- Reader Workbench mock：展示 mock 文件、只读代码、选区和跳回源码能力。
- Context Basket UI：把 selection、file、search result 等上下文以 chip 形式显式展示。
- Chat / Agent Surface mock streaming：支持可见上下文发送、mock 流式回答、取消和错误态。
- Save Answer Tray：保存 mock answer，保留 source reference，并能从保存结果跳回 Reader。
- Annotation mini sheet：支持对当前选区或行添加短批注的 UI 闭环。
- Search / Preview mock：搜索结果先预览，只有显式 Open / Jump 才改变主 Reader。

暂不做：

- 真实私有仓库、账号系统、本地目录导入。
- 源码编辑、terminal、shell、commit、branch、push、PR。
- 完整 LSP 或完整 Agent runtime。
- 把 `#codebase` 解释为整仓上下文；它只代表 retrieve intent。
- 大规模路由、状态库、UI 框架迁移。

## 4. 建议目录

第一阶段可以渐进演进，不要求一次性重排所有文件：

```text
apps/web/src/
  app/
    App.tsx
    shell/
    providers/
  modules/
    repo/
    workbench/
    reader/
    search/
    context-basket/
    chat/
    knowledge/
  shared/
    api/
    schema/
    ui/
    testing/
```

目录边界：

- `shared/ui` 只放通用 UI primitive 和无业务语义的基础组件。
- `shared/schema` 只放平台无关 DTO 类型，例如 `SourceRange`、`ContextChip`、`ReaderPayload`。
- `shared/api` 封装 API client、SSE client、错误映射和 mock adapter。
- `modules/*` 放产品语义组件、container 和 `useXXXApp` hook。
- `modules/*` 之间通过 DTO、事件回调或上层 orchestrator 协作，不互相读取内部状态。

## 5. 模块设计

### 5.1 App Shell

职责：

- 展示 mock repo 入口和当前 demo 状态。
- 管理当前 project、file、active panel 的顶层状态。
- 注入 API client、toast、theme 等 provider。
- 保证移动端第一屏可直接进入读码闭环。

验收：

- 用户打开 Web app 后能看到可操作入口。
- 没有真实后端数据时也能进入 mock demo。
- 全局错误有可见提示，不让页面静默失败。

### 5.2 Reader Workbench

职责：

- 展示当前 mock file path、只读代码、选区和 source anchors。
- 把 UI selection 转成 `SourceRange`。
- 承接 Search / Preview / Chat / Save Answer 的 jump back 动作。
- 保存当前文件、选区、活动面板和阅读轨迹的前端状态。

关键状态：

```ts
type ReaderWorkbenchState = {
  projectId: string;
  currentFilePath?: string;
  currentSelection?: SourceRange;
  activePanel: "none" | "search" | "preview" | "chat" | "save" | "annotation";
  trail: SourceRange[];
};
```

验收：

- 选中代码后生成可见 context chip。
- 预览不会改变主 Reader；只有 Jump / Open 会改变。
- 从 Saved Answer 或 chip 可跳回对应源码位置。

### 5.3 Context Basket

职责：

- 显示本次请求将带上的上下文。
- 支持 suggested、ready、pinned、stale、missing、oversized、trimmed 状态。
- 支持添加、删除、pin、预览和发送前确认。
- 展示 token estimate mock 值和超限状态。

最小类型：

```ts
type ContextChip = {
  chipId: string;
  type: "selection" | "file" | "symbol" | "searchResult" | "savedAnswer" | "annotation" | "codebaseQuery";
  label: string;
  projectId: string;
  filePath?: string;
  range?: SourceRange;
  status: "suggested" | "ready" | "pinned" | "stale" | "missing" | "oversized" | "trimmed";
  tokenEstimate?: number;
};
```

验收：

- 所有隐式上下文在发送前都以 chip 或 preview 显示。
- `#codebase` 以检索意图呈现，不展示为“整仓已发送”。
- 大上下文或失效 anchor 有明确状态和阻断/确认逻辑。

### 5.4 Chat / Agent Surface

职责：

- 展示 Context Basket、快捷动作、输入框、消息流和 mock ToolCallLog。
- 支持 Ask / Plan / Agentic Reading 的 UI 模式，但第一阶段只需要 mock 行为。
- 支持 streaming、completed、failed、cancelled 状态。
- 回答完成后暴露 Save Answer 入口。

验收：

- 用户可以围绕当前 selection 发送 mock ask。
- mock answer 以流式或分段方式展示。
- 工具调用日志可折叠检查，失败和取消有可见状态。
- Chat 关闭后 Reader 的当前文件和选区不丢失。

### 5.5 Save Answer / Annotation

职责：

- Save Answer 保存回答快照、上下文 chips 和 source reference。
- Annotation 保存当前行、函数或选区上的短批注。
- 保存成功后使用 toast / gutter bookmark 反馈，不离开 Reader。

验收：

- 保存失败时保留草稿，不丢回答内容。
- 保存成功后可以从记录跳回源码。
- Annotation mini sheet 不改变 Reader 位置。

### 5.6 Search / Preview

职责：

- 提供 mock search input 和结果列表。
- 点击结果进入 preview，而不是立刻跳转。
- 支持 Explain、Add to context、Open。

验收：

- Search -> Preview -> Explain 会生成 context chip 并打开 Chat。
- Search -> Preview -> Open 才改变主 Reader。
- Back 返回搜索结果时保留 query。

## 6. 第一阶段开发切片

### FE-0：前端工程基线

产出：

- 整理 `shared/ui` primitive。
- 建立 `shared/schema` 的首批 DTO。
- 建立 mock data 和 demo route/state。

验收：

- `npm run build:web` 通过。
- 组件 workbench 不代表正式首页，这一点在 UI 和文档中明确。

### FE-1：Mock App Shell

产出：

- mock repo 选择。
- 进入 Reader Workbench。
- 顶层错误、loading、empty 状态。

验收：

- Open app -> choose mock repo 可演示。

### FE-2：Reader Workbench

产出：

- mock file 展示。
- selection -> `SourceRange`。
- source jump / trail mock。

验收：

- open mock file -> select code 可演示。

### FE-3：Context Basket

产出：

- selection/file/search result chips。
- chip remove / pin / preview。
- token estimate mock。

验收：

- select code -> add context 可演示，上下文发送前可见。

### FE-4：Chat / Agent Surface

产出：

- ask input。
- mock streaming response。
- ToolCallLog。
- cancel / retry / failed 状态。

验收：

- add context -> ask mock chat 可演示。

### FE-5：Save Answer / Annotation

产出：

- Save Answer Tray。
- Annotation mini sheet。
- saved item -> jump back。

验收：

- Save Answer -> jump back to source 可演示。

### FE-6：Search / Preview

产出：

- mock search。
- preview sheet。
- Explain / Add to context / Open。

验收：

- Search -> Preview -> Open/Explain 可演示，不破坏 Reader 状态。

## 7. 移动端检查

必须优先检查：

- 360x780。
- 390x844。
- 430x932。
- landscape 844x390。

检查项：

- Reader 和 Chat / Search / Preview 不发生关键内容遮挡。
- Context Basket 清楚表达 AI 将看到什么。
- Send、Save、Cancel、Jump 在小屏和键盘态仍可触达。
- Context chips 可折叠、换行或压缩，不撑破布局。
- Sheet、Dialog、Popover 有可访问名称、关闭动作和合理焦点行为。

## 8. 测试与验收

最小检查：

```bash
npm run build:web
```

用户可见 UI 改动后建议做浏览器检查：

- walking skeleton 是否完整。
- Reader 是否始终可回到当前源码位置。
- Save Answer 后是否留在 Reader。
- 失败、loading、empty 状态是否可见。

DoR：

- 明确输入、输出和验收路径。
- 不违反 MVP 不做事项。
- 涉及 DTO/API 的任务先对齐 schema。

DoD：

- 功能符合第一阶段验收脚本。
- 文档或 schema 已同步。
- 基础检查通过。
- 不引入源码修改 Agent / shell / commit 等越界能力。

