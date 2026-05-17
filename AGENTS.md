# Pocket Vibe v3 Agent Guide

这是 Codex、VS Code Copilot Chat 以及其他 AI 编码 agent 在本仓库里的统一工作指南。

## 项目北极星

Pocket Vibe 是一款移动优先的 AI 源码阅读器。MVP 要证明的核心闭环是：

```text
Open repo -> Read code -> Add visible context -> Ask AI -> Save note -> Jump back to source
```

当前仓库实现的是工程 walking skeleton：

```text
Open app
  -> choose mock repo
  -> open mock file
  -> select code
  -> add context
  -> ask mock chat
  -> save note
  -> jump back to source
```

做任何改动时都要保护这条链路。优先交付小而完整的纵向切片，避免提前铺开没有被验证的大架构。

## 当前实现

- `apps/web`：Vite + TypeScript Web/PWA shell。
- `services/core`：Go mock Core API。
- `services/core/api/openapi`：API contract 草案。
- `docs`：产品、UX、架构、前端和后端设计来源。
- `docs/prototype/pocket-vibe-wireframe`：历史 coded wireframe 原型。

常用命令：

```bash
npm install
npm run dev:api
npm run dev:web
npm run build:web
npm run test:api
```

Web app 默认访问 `http://localhost:8080`。只有确实需要时才用 `VITE_API_BASE` 覆盖。

## 信息源优先级

大改前先读：

- `README.md`：当前可运行范围。
- `docs/POCKET_VIBE_MVP_PRD.md`：产品目标和非目标。
- `docs/POCKET_VIBE_ARCHITECTURE_BLUEPRINT.md`：系统边界和演进路线。
- `docs/POCKET_VIBE_WEB_PWA_FRONTEND_MODULE_DESIGN.md`：前端模块边界。
- `docs/POCKET_VIBE_WEB_PWA_BACKEND_MODULE_DESIGN.md`：后端模块边界。
- `services/core/README.md`：当前 mock API endpoint。

如果文档和代码不一致，把代码视为当前可执行事实；只有当任务要求或偏差影响本次改动时才同步更新文档。

## MVP 边界

除非用户明确要求，不要实现这些能力：

- 真实私有仓库支持。
- GitHub OAuth 或登录。
- 本地目录导入。
- 源码编辑。
- 产品内 terminal / shell。
- Agent 修改源码。
- 产品内 git commit、branch、push、PR 流程。
- 产品 agent 的 unrestricted network tool。
- 把完整 LSP 矩阵作为隐藏前置依赖。

未来能力需要出现时，先以明确 contract、mock、disabled state 或 capability status 表达。

## 架构规则

- API contract first：DTO 必须平台无关，可供 Web、Android、HarmonyOS 复用。
- 后端拥有 repo import、file reading、reader payload、search、semantic-lite、anchor、context resolving、agent lifecycle、tool log、note、daily report。
- 前端拥有 UI layout、reader presentation、当前 selection UI、context chip 展示、chat surface、note draft。
- `ReaderPayload`、`ContextChip`、`SourceRange`、`Anchor`、`ToolCallLog`、`ChatSession`、`Note` 是产品模型，不要混入 DOM、CodeMirror、浏览器 URL hash、scroll pixel 或框架私有状态。
- `#codebase` 是 retrieve intent，不是把整个仓库塞进模型上下文。
- Agent tool 必须有权限分级。Safe read / analysis 可以自动执行；app write 需要用户显式动作；source write 和危险动作不属于 MVP。

## 前端指导

- Reader first：Search、Chat、Context Basket、Trail、Notes 都服务于阅读，不要反客为主。
- Context visible：任何隐式上下文在发送前都要以 chip 或 send preview 的形式可见。
- Mobile-first：改 UI 时要默认考虑小屏竖屏，确保主操作可触达。
- 当前前端是 plain TypeScript + DOM rendering。除非任务明确要求，不要引入框架迁移。
- 写入 `innerHTML` 前必须转义用户可控文本。
- 不要提前引入 state library、router、component framework、CodeMirror 或 icon system，除非当前切片真正需要。

## 后端指导

- 当前 Go service 是 mock API，保持简单、显式、可读。
- 没有具体需求前，优先使用标准库 HTTP pattern。
- Handler 可以保持到后续可拆模块的清晰度，但不要提前创建完整未来目录树。
- JSON 字段名要稳定，并与前端类型保持一致。
- 源码侧保持 read-only。mock service 只允许写 app-level note。
- 后续涉及文件路径时，第一版就要防 path traversal 和 repo 外读取。
- SSE 行为要便于前端检查、取消和调试。

## 测试与校验

按风险选择最小有效检查：

- 前端构建：`npm run build:web`。
- 后端测试：`npm run test:api`。
- 改 API contract、shared DTO 或 walking skeleton 时两者都跑。
- 用户可见 UI 改动后，尽量做浏览器人工检查。

TDD 工作流：

1. 行为可测试时，先写失败测试或明确失败验收检查。
2. 实现最小改动让检查通过。
3. walking path 仍然可用后再重构。

文档-only 改动不要硬造测试；检查链接、命令和当前仓库事实是否一致即可。

## 改动风格

- 改动范围贴合当前任务。
- 优先沿用本仓库已有模式，不轻易发明抽象。
- 命名贴合产品语言：Reader、Context Basket、Agentic Reading、ToolCallLog、Anchor、Note、DailyReport。
- 不要把 mock skeleton 悄悄扩成生产平台。
- 写 TODO 时要具体，并说明属于哪个未来 slice。
- 不要改写 `docs/archive` 里的归档资料，除非用户明确要求。

## 常用 Agent Prompt

给 Codex：

```text
Use AGENTS.md as the project guide. Implement one small vertical slice, run the relevant checks, and keep the mock walking skeleton intact.
```

给 Copilot Chat：

```text
Read AGENTS.md and the relevant docs under docs/. Work in a TDD style where practical, and do not add real repo import, source editing, terminal, git, or PR features unless explicitly requested.
```

