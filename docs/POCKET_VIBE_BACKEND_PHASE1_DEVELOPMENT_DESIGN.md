# Pocket Vibe 第一阶段后端开发设计

版本：Backend Phase 1 Development Design v0.1  
日期：2026-05-25  
适用范围：`services/core` Go Core API walking skeleton  
约束来源：`docs/POCKET_VIBE_PROJECT_MANAGEMENT_PLAN.md`、`docs/POCKET_VIBE_WEB_PWA_BACKEND_MODULE_DESIGN.md`、`docs/guideline/backend.md`、`services/core/README.md`

## 1. 目标

第一阶段后端只证明 mock walking skeleton 能稳定支撑浏览器演示：

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

后端目标不是提前做真实平台，而是把 Go API skeleton、mock repo/file、Reader Payload、Search、Context Resolve、Chat SSE、Save Answer、Annotation 和 Note 的最小闭环做清楚，并让 API contract、错误模型和安全边界能顺滑进入后续真实 public repo reader。

## 2. 当前技术口径

当前可执行事实：

- `services/core` 使用 Go 标准库 `net/http` 和 `http.ServeMux`。
- HTTP route、middleware、handler 位于 `services/core/internal/app/server`。
- 跨端 DTO 和错误码位于 `services/core/internal/shared/contract`。
- Go 内部 service error 位于 `services/core/internal/shared/serviceerrors`。
- mock fixture repo 位于 `services/core/internal/fixtures/mock-pocket-vibe`。
- 当前代码读取本地 fixture repo，源码侧保持 read-only。
- app-level knowledge 记录使用内存实现，覆盖 note、saved answer、annotation。
- OpenAPI 草案位于 `services/core/api/openapi/pocket-vibe-v1.yaml`。

第一阶段暂不引入：

- 第三方 router、DI、ORM、queue、agent framework。
- 真实 GitHub clone、私有仓库、本地目录导入。
- 完整 LSP、完整 Agent runtime、真实模型 provider。
- shell、terminal、source edit、git commit、push、PR。

## 3. 第一阶段后端范围

必须交付：

- API skeleton：health check、CORS、trace id、request log、统一 JSON response。
- Mock repo/workspace：提供可选择的 mock repo，并保持后续 workspace/repo contract 的演进空间。
- File tree/content：从 fixture repo 读取文件树和文件内容，包含 path traversal 防护。
- Reader payload：为前端 Reader 提供平台无关 payload，不泄露 DOM、CodeMirror 或 UI 状态。
- Mock search：提供搜索结果、source range 和 preview 片段。
- Capabilities：明确 repo、file、reader、search、semantic、chat、knowledge 的可用状态。
- Context resolve：接收显式 ContextChip，返回 token estimate 和 warnings。
- Mock chat streaming：通过 SSE 输出工具事件、回答 delta 和完成事件。
- Knowledge write：保存 NoteDocument、SavedAnswer、Annotation，并保留 source anchors。
- OpenAPI / DTO 同步：公开字段、错误码和 SSE event 变更必须同步 contract。

暂不做：

- 真实 public repo clone 和异步 clone task。
- ripgrep search、Tree-sitter、semantic-lite、Anchor re-resolve。
- 真实模型调用、provider key 管理和多模型网关。
- 数据库持久化、复杂账号、跨设备同步。
- Daily Report 作为 P0 前置能力。

## 4. 建议目录边界

第一阶段继续沿用当前轻量目录，不为未来能力提前铺空目录：

```text
services/core/
  cmd/
    pocket-vibe-api/
  internal/
    app/
      server/
    modules/
      repo/
      file/
      reader/
      search/
      capability/
      context/
      chat/
      knowledge/
    shared/
      contract/
      fixture/
      serviceerrors/
  api/
    openapi/
```

目录规则：

- `internal/app/server` 只负责 HTTP、SSE、middleware、request parsing、response/error mapping。
- `internal/modules/*` 拥有业务规则和 mock 数据组装，不依赖 `http.ResponseWriter`。
- `internal/shared/contract` 只放平台无关 DTO、JSON 字段、SSE payload 和 API error。
- `internal/shared/fixture` 只负责 fixture project registry，不承载业务逻辑。
- `api/openapi` 是前后端 contract review 的来源之一，接口变更必须同步。

## 5. 模块设计

### 5.1 Server / Handler

职责：

- 注册 route。
- 解析 query、path 和 JSON body。
- 调用模块 service。
- 写 JSON response、SSE event 和统一错误。
- 注入 trace id、CORS 和 request log。

验收：

- `GET /health` 返回 `{ "status": "ok", "mode": "mock" }`。
- 所有错误 response 包含 `traceId`。
- JSON body 使用严格解析，未知字段不能静默通过。
- SSE endpoint 能随 request context 取消。

### 5.2 Repo / Workspace Mock

职责：

- 返回第一阶段可选择的 mock repo。
- 暴露 `id`、`name`、`description`、`recommendedFile`。
- 为后续 `workspaceId`、`projectId` 和 import task 留出 contract 方向。

当前 endpoint：

```text
GET /mock/repos
```

验收：

- 前端能完成 choose mock repo。
- mock repo ID 稳定，例如 `mock-pocket-vibe`。
- 不伪装成真实 GitHub import。

### 5.3 File Service

职责：

- 根据 `projectId` 返回 fixture repo file tree。
- 根据 `projectId` 和 `filePath` 返回文件内容。
- 做路径清理、绝对路径拒绝、repo root containment 和 symlink containment 校验。
- 返回 `language`、`size`、`lineCount`、`contentHash`、`readable`。

当前 endpoints：

```text
GET /files/tree?projectId=
GET /files/content?projectId=&filePath=
```

验收：

- open mock file 可演示。
- `../`、绝对路径和 repo 外 symlink 不可读取。
- 文件不存在、项目不存在、非法路径有稳定错误。

### 5.4 Reader Service

职责：

- 聚合 file content 和 reader-specific metadata。
- 返回 `ReaderPayload`，服务 Web Reader 和未来 native reader。
- 第一阶段可使用 mock symbols 和 suggested selection。

当前 endpoint：

```text
GET /reader/payload?projectId=&filePath=
```

验收：

- 前端可从 payload 渲染只读代码。
- payload 不包含 CodeMirror state、scroll pixel、DOM selection。
- `SourceRange` 使用源码行号，不使用 UI 坐标。

### 5.5 Search Service

职责：

- 第一阶段在 fixture 文件中做 mock/lightweight search。
- 返回 `SearchResult[]`，包含 `filePath`、`line`、`preview`、`range`。
- 为后续 ripgrep search 保持接口形状。

当前 endpoint：

```text
GET /search?projectId=&query=
```

验收：

- Search -> Preview -> Open/Explain 可演示。
- 搜索结果可以转为 ContextChip 或 source jump。
- 空 query、无结果和错误状态可被前端区分。

### 5.6 Capability Service

职责：

- 聚合项目能力状态。
- 诚实表达 mock 阶段的 semantic、model、knowledge 可用性。
- 支持前端禁用不可用动作或展示 degraded state。

当前 endpoint：

```text
GET /capabilities?projectId=
```

状态枚举：

```text
available | indexing | partial | unsupported | failed | offline
```

验收：

- 不可用能力不被伪装为可用。
- semantic-lite 和真实模型接入前能显示 `unsupported` 或 `partial`。

### 5.7 Context Resolver

职责：

- 接收前端显式 ContextChip。
- 生成发送前 preview 所需的 `ResolvedContext`。
- 返回 token estimate、warnings 和 chip 状态。
- 保持 `#codebase` 是 retrieve intent，而不是整仓 prompt。

当前 endpoint：

```text
POST /context/resolve
```

验收：

- select code -> add context 可演示。
- 没有 context chip 时返回 warning。
- 未来接入 anchor、trim、rank 时不改变前端心智模型。

### 5.8 Chat Service

职责：

- 创建 chat session。
- 接收 question 和 context chips。
- 提供 mock streaming answer。
- 输出可检查的 tool event，支撑 ToolCallLog UI。

当前 endpoints：

```text
POST /chat/sessions
POST /chat/sessions/{sessionId}/messages
GET  /chat/sessions/{sessionId}/events?question=
```

SSE events：

```text
event: tool
data: ChatToolPayload

event: delta
data: ChatDeltaPayload

event: done
data: ChatDonePayload
```

验收：

- add context -> ask mock chat 可演示。
- stream 期间前端能显示 running、cancelled、failed 或 completed。
- 工具调用日志只表达 read/search/analysis 类 mock 行为，不包含 shell 或 source write。

### 5.9 Knowledge Service

职责：

- 保存 app-level knowledge，不写回源码仓库。
- 支持 NoteDocument、SavedAnswer、Annotation。
- 每条记录保留 `SourceRange[]` 或单个 `SourceRange`，用于 jump back to source。

当前 endpoints：

```text
GET  /notes?projectId=
GET  /notes/{noteId}?projectId=
POST /notes
GET  /saved-answers?projectId=
POST /saved-answers
GET  /annotations?projectId=
POST /annotations
```

验收：

- Save Answer -> jump back to source 可演示。
- Annotation 保存后不改变 Reader 位置。
- 保存失败时前端可保留草稿并展示错误。

## 6. 第一阶段 API 合同

第一阶段公开 contract 以这些模型为核心：

```text
Repo
SourceRange
FileNode
FileContent
ReaderPayload
SearchResult
ContextChip
ResolvedContext
ChatSession
ChatEvent
ToolCallLog-compatible payload
NoteDocument
SavedAnswer
Annotation
ProjectCapabilities
ApiError
```

合同规则：

- JSON 字段稳定使用 camelCase。
- DTO 不混入浏览器、React、DOM、CodeMirror 或移动端私有状态。
- 新增公开字段时同步 Go contract、OpenAPI 和前端调用。
- 删除或重命名字段必须经过 shared schema review。
- 对外 response 不暴露本地绝对路径、fixture root、stack trace 或 secret。

## 7. 第一阶段开发切片

### BE-0：后端工程基线

产出：

- 确认 Go 标准库 HTTP skeleton。
- 确认模块目录和 contract 位置。
- 建立 `ApiError`、trace id 和 service error mapping。

验收：

- `GET /health` 可用。
- `npm run test:api` 通过。

### BE-1：Mock Repo / File

产出：

- mock repo registry。
- file tree endpoint。
- file content endpoint。
- path traversal 和 symlink containment 测试。

验收：

- choose mock repo -> open mock file 可演示。
- 非法 filePath 被拒绝。

### BE-2：Reader Payload / Search

产出：

- reader payload endpoint。
- mock symbols / suggested selection。
- mock search endpoint。
- search result source range。

验收：

- open mock file -> search -> preview source 可演示。
- Reader payload 与前端 DTO 对齐。

### BE-3：Capabilities / Context Resolve

产出：

- project capability endpoint。
- context resolve endpoint。
- token estimate mock。
- warning 和 degraded state 字段。

验收：

- select code -> add context -> send preview 可演示。
- 不可用能力以 capability status 表达。

### BE-4：Mock Chat SSE / Tool Events

产出：

- chat session create。
- chat message post。
- SSE stream endpoint。
- mock tool/delta/done event。

验收：

- ask mock chat 可演示。
- 前端可渲染 ToolCallLog。
- SSE 中断不会泄露 goroutine 或卡住 handler。

### BE-5：Knowledge Save Loop

产出：

- NoteDocument create/list/detail。
- SavedAnswer create/list。
- Annotation create/list。
- source anchors 持久在内存 store。

验收：

- Save Answer -> list saved answer -> jump back to source 可演示。
- Annotation -> jump back to source 可演示。
- source code 仍然 read-only。

### BE-6：Contract / README / QA 收口

产出：

- OpenAPI 与当前 endpoint 对齐。
- `services/core/README.md` 与启动命令、endpoint 对齐。
- handler 和模块测试覆盖 walking skeleton。

验收：

- `npm run test:api` 通过。
- 改 shared DTO 或 walking skeleton 时同时跑 `npm run build:web`。
- demo checklist 能覆盖第一阶段验收脚本。

## 8. 安全与错误设计

第一阶段必须实现或保留测试位：

- 拒绝空 path、绝对 path、`../`、repo 外 symlink。
- 不返回本地绝对路径。
- 不允许任何 source write。
- 不引入 shell、install、git commit、push、PR 工具。
- `readJSON` 使用 unknown field 拒绝策略。
- 错误 response 统一为 `{ "error": ApiError }`。
- `traceId` 同时出现在 response header 和 error body。
- service sentinel error 在 server 层集中映射。

建议错误码：

```text
BAD_JSON
BAD_REQUEST
NOT_FOUND
FILE_BINARY_UNSUPPORTED
FILE_TOO_LARGE
INDEX_NOT_READY
CONTEXT_TOO_LARGE
MODEL_PROVIDER_ERROR
STREAM_UNSUPPORTED
AGENT_PERMISSION_BLOCKED
```

## 9. 测试与校验

最小检查：

```bash
npm run test:api
```

改 API contract、shared DTO 或 walking skeleton 时追加：

```bash
npm run build:web
```

测试优先级：

- Handler：route、status code、trace id、error mapping、SSE headers。
- File service：path traversal、file not found、project not found、content hash、line split。
- Context service：empty chips warning、token estimate、oversized warning。
- Knowledge service：create/list/detail、project filter、source anchors。
- Contract：OpenAPI path、JSON 字段和前端类型保持一致。

文档-only 改动不硬造测试；检查链接、路径、命令和当前仓库事实即可。

## 10. DoR / DoD

DoR：

- 明确输入、输出和验收路径。
- 不违反 MVP 不做事项。
- 涉及 DTO/API/SSE 的任务已过 shared schema review。
- 明确会影响哪些前端模块和 mock demo 步骤。

DoD：

- 功能符合第一阶段验收脚本。
- OpenAPI、Go contract、README 或相关文档已同步。
- 基础测试通过。
- 错误状态、capability status 或 degraded state 可见。
- 不引入 source write、shell、terminal、commit、push、PR 等越界能力。

## 11. 后续进入真实能力的衔接点

第一阶段完成后，按项目管理计划进入真实能力时优先拆这些切片：

- Public GitHub repo import：新增 import task、clone timeout、quota 和 cleanup。
- Real file tree/content：从 repo storage 读取，并保留当前 file safety contract。
- Ripgrep search：替换 mock search 实现，不改变 `SearchResult` 心智模型。
- Semantic-lite / Anchor：新增 candidate、confidence、stale 和 fallback reason。
- Model gateway / Agent runtime：先落 adapter，不污染 `contract`。
- Persistent knowledge：用 DB 替换 memory store，保持 API response 兼容。
