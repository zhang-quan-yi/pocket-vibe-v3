# Pocket Vibe v3 CTO 技术战略

版本：CTO Strategy v0.1  
日期：2026-05-17  
角色视角：CTO  
阶段：正式开发前技术决策

## 1. 技术战略判断

Pocket Vibe v3 当前最重要的问题不是“能不能做”，而是“是否值得重投入做移动端源码阅读体验”。因此第一阶段必须采用 Web/PWA 优先验证。

CTO 判断：

- Web/PWA 负责验证产品闭环和后端能力。
- Android / HarmonyOS 负责后续原生体验、离线和本地能力。
- Agent 能力必须参考生态，不闭门造车。
- 后端 core service 是长期资产，不能变成一次性 demo。
- shared schema 是未来多端复用的关键。

## 2. 关键技术决策

| 决策 | 建议 |
|---|---|
| 首发平台 | Web/PWA |
| 后端 | TypeScript service 优先评估 |
| 前端 Reader | CodeMirror 6 read-only |
| 搜索 | 后端 ripgrep |
| 结构解析 | 后端 Tree-sitter |
| 语义 | semantic-lite + 按语言 LSP |
| Agent | benchmark + PoC 后决定 runtime |
| Streaming | SSE 优先 |
| Android | Web 验证后再投入原生 |
| 国内环境 | self-host / non-GMS friendly |

## 3. 技术栈建议

首选：

- TypeScript monorepo。
- Web/PWA + CodeMirror 6。
- Backend Core API。
- shared schema package。
- relational DB。
- task queue。
- filesystem/object storage for repos。

后端框架待评估：

- Fastify：成熟、性能好、插件生态完整。
- Hono：轻量、边缘友好。
- Express：简单但长期类型和结构弱一些。

建议默认：

```text
TypeScript + Fastify + Zod/OpenAPI + PostgreSQL or SQLite bootstrap + queue adapter
```

最终选择应在工程搭建前确认。

## 4. Agent 策略

Agent 不能弱，也不能乱。

必须参考：

- Cursor。
- Claude Code。
- OpenAI Codex / Codex CLI / Codex App。
- GitHub Copilot Chat / VS Code Agent Mode。
- vscode-copilot-chat。
- opencode。
- Cline / Continue / Aider / OpenHands / Goose。
- LangGraph / Mastra / AutoGen。

MVP 原则：

- 允许强读码、强规划、强总结。
- 不允许直接改源码。
- 不允许 shell / install / commit / push / PR。
- ToolCallLog 必须可追踪。
- App write 必须确认。

CTO 目标：

- 复用成熟 runtime / workflow / tool trace。
- 自研 Pocket Vibe 独有的 Anchor、Context Basket、Preview、Note、Mobile Reader。

## 5. 国内与 self-host 约束

必须考虑：

- GitHub clone 不稳定。
- OpenAI 官方 endpoint 不总是可用。
- Android 国内环境不能依赖 GMS / Firebase / FCM。
- 统计、崩溃上报、对象存储、队列、模型 provider 要可替换。

要求：

- OpenAI-compatible base URL。
- provider SDK 不深度绑定。
- API key 日志脱敏。
- 国内包 non-GMS 默认。
- self-host friendly 架构。

## 6. 安全与隐私

红线：

- 不支持私有仓库前，不做 GitHub OAuth。
- API key 不进日志、不进同步载荷。
- repo workspace 隔离。
- path traversal 防护。
- Agent 不得访问 repo 外文件。
- Tool permission 后端强校验。
- Chat / Note 同步前需要隐私说明。

## 7. 成本模型

主要成本：

| 成本 | 控制策略 |
|---|---|
| repo storage | repo size limit、TTL、cleanup |
| clone bandwidth | timeout、retry、失败清理 |
| index CPU | lazy index、language priority、queue |
| model call | token budget、context trim、usage tracking |
| logs/observability | 脱敏、采样、保留期 |
| Agent tasks | cancel、quota、run timeout |

MVP 不能无限制开放大仓库和长任务。

## 8. Go / No-Go 门槛

继续投入 Web/PWA：

- URL -> Reader 成功率可接受。
- Read -> Ask -> Save 有真实用户完成。
- Save Note 转化证明知识沉淀有价值。
- Agentic Reading 比普通 Chat 更有用。

启动 Android 原生化：

- Web/PWA 闭环成立。
- 用户反馈集中在移动端手感、离线、本地仓库、安全存储。
- schema / API / Anchor / ContextChip / ToolCallLog 稳定。
- ReaderPayload 与 CodeMirror 解耦。

不启动 Android：

- 用户不重复阅读。
- Agent/Note 使用率低。
- 核心问题仍是产品闭环不成立。

## 9. 技术债控制

必须设置 gate：

- shared schema review。
- API contract review。
- Agent runtime PoC review。
- Security review。
- ReaderPayload review。
- Android contract review。

禁止：

- demo 代码直接进入 core。
- Agent 框架私有状态污染 schema。
- 前端 UI state 入库。
- 为赶进度跳过 sandbox。

## 10. 团队与协作建议

最小团队角色：

- 产品/UX：负责读码闭环和验证。
- 前端：Reader、Context Basket、Chat、Note。
- 后端：repo、search、semantic、anchor、agent。
- 架构/平台：schema、API、task、security。
- Agent researcher：benchmark + PoC。

第一阶段建议小步快跑：

- 每周 demo。
- 每周风险复盘。
- 每个 slice 有验收脚本。
- Agent 单独 benchmark，不混在普通开发里。

## 11. CTO 风险清单

| 风险 | 等级 | 缓解 |
|---|---|---|
| 用户不买账 | 高 | Web/PWA 验证，不提前重投原生 |
| Agent 做弱 | 高 | benchmark + PoC |
| LSP 复杂度失控 | 高 | semantic-lite first |
| repo 成本高 | 高 | quota / TTL |
| 国内服务不可用 | 高 | self-host / compatible provider |
| 安全泄露 | 高 | sandbox / redaction / no private repo |
| Android 返工 | 中 | contract first |
| 团队过早扩范围 | 高 | 明确不做事项 |

## 12. CTO 第一周任务

1. 确认技术栈默认选择。
2. 确认 shared schema 工作方式。
3. 确认 Agent benchmark 候选。
4. 确认 repo storage 和 clone sandbox 方案。
5. 确认 API key 策略方向。
6. 确认不做事项不被打破。
