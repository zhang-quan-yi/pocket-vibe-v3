# 后端开发规范

本文档约束 `services/core` 的后端开发方式。当前后端是 Go mock Core API，目标是保护 walking skeleton，同时为后续真实 repo import、Reader Payload、Search、Context Resolver、Agent 和 Knowledge 能力留下清晰边界。

## 1. 总原则

1. 优先保护核心闭环：`Open repo -> Read code -> Add visible context -> Ask AI -> Save note -> Jump back to source`。
2. 后端保持 Go-first，默认使用标准库 HTTP pattern；没有明确需求前不引入 router、DI、ORM、queue 或 agent framework。
3. API contract first：对外 DTO 必须平台无关，可被 Web、Android、HarmonyOS 复用。
4. 当前阶段保持 mock skeleton 简单、显式、可读，不提前创建完整未来目录树。
5. 源码仓库侧永远 read-only；MVP 只允许写 app-level knowledge，例如 note、saved answer、annotation draft。
6. 任何不可用能力必须通过结构化 error、capability status 或 disabled/mock state 表达，不要伪装成已完成能力。

## 2. 目录与职责

1. HTTP server、route、middleware 放在 `services/core/internal/app/server`。
2. 业务模块放在 `services/core/internal/modules/<module>`，每个模块优先保留一个小 `Service` interface 和清晰实现。
3. 跨端 DTO、JSON 字段、事件 payload、错误码放在 `services/core/internal/shared/contract`。
4. Go 内部 service sentinel error 放在 `services/core/internal/shared/serviceerrors`，由 server 层映射成 API error。
5. mock fixture registry 放在 `services/core/internal/shared/fixture`，mock repo 文件放在 `services/core/internal/fixtures`。
6. OpenAPI contract 放在 `services/core/api/openapi`；改公开接口、字段名、错误码或 SSE event 时同步更新。
7. 不为了“未来会用”新增空模块、空接口、空 worker 目录；等具体 slice 需要时再创建。

## 3. Handler 规范

1. Handler 只负责 HTTP method/path、query/body 解析、轻量校验、调用 service、返回 JSON/SSE。
2. Handler 不写业务逻辑，不直接读写文件系统，不直接操作 mock fixture，不拼装复杂领域结果。
3. 所有 service 调用必须传入 `r.Context()`，为后续取消、超时和 SSE 中断保留通路。
4. JSON body 使用 `readJSON`，保持 `DisallowUnknownFields`，避免前端悄悄发送未定义字段。
5. JSON response 使用 `writeJSON`，错误 response 使用统一 `ApiError` 包装。
6. service error 优先集中在 `writeServiceError` 映射；不要在多个 handler 中复制错误映射。
7. SSE endpoint 必须设置 `text/event-stream`、`no-cache`，每个 event 都 flush，并能随 request context 取消。

## 4. Service 规范

1. Service 拥有业务规则和领域组装，但不依赖 `http.ResponseWriter`、DOM、CodeMirror、浏览器 URL 或 UI 坐标。
2. Service interface 要小，贴近当前调用方；不要为尚未实现的未来能力提前设计大接口。
3. mock service 命名要诚实，例如 `FixtureReaderService`、`MockChatService`、`MemoryKnowledgeService`。
4. 文件、搜索、Reader、Context、Chat、Knowledge 等模块之间通过明确 service 调用协作，不隐式跨模块读写状态。
5. 需要共享的产品模型进入 `contract`；只给 Go 内部使用的实现细节留在模块包内。
6. 未来引入真实 repo、index、agent 或 model provider 时，先定义 adapter 边界，不让第三方框架类型污染 `contract`。

## 5. Contract 与 JSON 字段

1. JSON 字段使用稳定 camelCase，字段名要与前端类型和 OpenAPI 保持一致。
2. `ReaderPayload`、`ContextChip`、`SourceRange`、`Anchor`、`ToolCallLog`、`ChatSession`、`Note` 等是产品模型，不允许混入 UI 私有状态。
3. 新增公开字段时优先追加字段，避免破坏已有前端；删除或改名必须同步更新前端和 OpenAPI。
4. 可选字段使用 `omitempty` 前先确认前端缺省行为；不要让空值和不存在表达两个不同含义但没有文档。
5. API 返回不能泄露本地绝对路径、repo storage path、provider secret、API key 或内部 stack trace。

## 6. 错误与能力状态

1. 对外错误统一返回 `{ "error": ApiError }`，包含 `code`、`message`、`retryable`、`traceId`。
2. 可预期业务失败使用稳定错误码，例如 `FILE_TOO_LARGE`、`INDEX_NOT_READY`、`CONTEXT_TOO_LARGE`。
3. 404、400、409、429、500 的语义要清楚；不要把参数错误统一包成 500。
4. 功能不可用优先返回 capability status：`available`、`indexing`、`partial`、`unsupported`、`failed`、`offline`。
5. fallback 必须诚实，例如 semantic fallback 是 search candidate，就在字段或 warning 中说明来源和置信度。

## 7. 文件与安全

1. 所有 repo 内文件路径必须做 `TrimSpace`、`filepath.Clean`、拒绝绝对路径、`filepath.Rel` 校验。
2. 涉及 symlink 时必须确认解析后路径仍在 repo root 内；新增文件读取能力必须有 path traversal 测试。
3. 默认过滤 `.git`、依赖目录、构建产物、大文件和二进制文件；被跳过的文件要返回 `skippedReason`。
4. mock service 也要按真实安全边界写，不能因为是 fixture 就允许 repo 外读取。
5. 日志不得输出 API key、provider secret、完整 prompt、大段源码或用户 knowledge 内容。
6. Agent 工具必须分级；MVP 禁止 shell、install、source edit、git commit、push、PR 和 unrestricted network。

## 8. 异步、SSE 与取消

1. clone、index、semantic warmup、anchor resolve、agent run 等长任务按 task 设计，不阻塞普通 HTTP request。
2. 当前 mock 可以同步返回，但接口形状要便于后续替换为 task、polling 或 SSE。
3. SSE event 名称要稳定，payload 必须是结构化 JSON，不发送前端需要解析的自然语言协议。
4. 所有循环、stream 和外部调用都要监听 context cancellation。
5. 失败、取消、超时要能被前端区分，便于 UI 展示 retry、cancel 或 degraded state。

## 9. 测试规范

1. 改 handler、route、error mapping、SSE 或 walking skeleton 时，补 `internal/app/server` 测试。
2. 改模块业务规则时，优先补模块级 unit test，例如 file service、context resolver、anchor resolver。
3. 文件路径、安全过滤、JSON contract、错误码和 capability status 必须有回归测试。
4. 改 API contract、shared DTO 或跨端字段时，同时运行 `npm run build:web` 和 `npm run test:api`。
5. 纯文档改动不硬造测试；检查链接、路径和命令与当前仓库事实一致即可。

## 10. 命名与演进

1. 命名贴合产品语言：Reader、Context Basket、Agentic Reading、ToolCallLog、Anchor、Note、DailyReport。
2. Go package 名称保持短小小写，不使用下划线；对外 JSON 字段不跟随 Go 缩写风格。
3. TODO 必须具体，并标注属于哪个未来 slice；不要写泛泛的 `TODO: improve later`。
4. 新增第三方依赖前先说明它解决的当前问题、替代方案和移除成本。
5. 重构必须服务当前 slice；不要借小需求顺手改完整架构。
