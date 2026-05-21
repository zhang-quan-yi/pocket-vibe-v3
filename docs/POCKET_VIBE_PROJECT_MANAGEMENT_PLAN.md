# Pocket Vibe v3 项目管理计划

版本：Project Management v0.1  
日期：2026-05-17  
角色视角：项目经理  
阶段：正式开发前执行计划

## 1. 项目启动假设

- 当前阶段只做 Web/PWA MVP。
- 前端主栈为 TypeScript；后端主栈为 Go Core Service。
- 不写 Android 原生端。
- 不支持私有仓库。
- 不做 Agent 改源码、shell、commit、PR。
- 先做 walking skeleton，再逐步接真实能力。
- 文档和设计已基本收敛，可进入工程准备。

## 2. 里程碑

| 里程碑 | 目标 | 验收 |
|---|---|---|
| M0 Kickoff Ready | 文档、范围、任务拆分完成 | 4 份启动文档 + issue 草案 |
| M1 Mock Skeleton | mock 跑通 Read -> Ask -> Save | 浏览器 demo 可演示 |
| M2 Real Repo Reader | 公共 repo 导入并打开文件 | URL -> Reader |
| M3 Search / Preview | 搜索和预览可用 | Search -> Preview -> Open/Explain |
| M4 Context / Chat / Knowledge | Context Basket + Chat + Save Answer / Annotate | Ask -> Save -> Jump back |
| M5 Semantic-lite / Anchor | symbol、definition candidates、anchor | 基本语义导航和 source chip 回跳 |
| M6 Validation | 测试用户验证 | 指标和反馈复盘 |

## 3. 第一阶段 Walking Skeleton

范围：

- Web app shell。
- Go Backend API skeleton。
- OpenAPI / JSON Schema contract。
- mock reader payload。
- mock search。
- mock chat streaming。
- mock Save Answer / Annotation。
- Context Basket UI。

不接：

- 真实 LSP。
- 完整 Agent runtime。
- Android。
- 账号系统。

验收脚本：

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

## 4. 并行工作流

| 工作流 | 负责人类型 | 产出 |
|---|---|---|
| Product | PM / UX | 验收脚本、读码包、用户访谈 |
| Frontend | FE | App shell、Reader、Context Basket、Chat |
| Backend | BE | Go API skeleton、workspace、repo/file |
| Schema | Architect / FE / BE | shared DTO、OpenAPI / JSON Schema |
| Agent | Agent researcher / BE | benchmark、PoC、ToolCallLog |
| QA | All | demo checklist、fixtures、viewport checks |

## 5. 时间计划

### 第一周

- 确认技术栈。
- 建立 OpenAPI / JSON Schema 草案。
- 建立前后端 skeleton 计划。
- 完成 Agent product benchmark。
- 准备 fixture repos。
- 完成 mock demo 任务拆分。

### 第二周

- 完成 mock walking skeleton。
- 前端 Reader/Context/Chat 基础交互。
- Go 后端 API skeleton 和 mock endpoints。
- 初版 ToolCallLog 结构。
- README / 开发启动说明。

### 第四周

- 接入真实 public GitHub repo import。
- file tree / file content。
- reader payload。
- ripgrep search。
- Save Answer / Annotation。
- 第一轮用户 demo。

## 6. Issue 清单草案

### Product / UX

- 定义 Read -> Ask -> Save demo 脚本。
- 选择 3 个官方读码包。
- 编写首批用户访谈问题。
- 定义 MVP 指标面板字段。

### Shared Schema

- 定义 `SourceRange` / `Anchor`。
- 定义 `ReaderPayload`。
- 定义 `ContextChip` / `ResolvedContext`。
- 定义 `ToolCallLog` / `AgentRun`。
- 定义 `ApiError`。

### Frontend

- 创建 App Shell。
- 创建 Reader Workbench mock。
- 接入 CodeMirror read-only spike。
- 创建 Context Basket UI。
- 创建 Chat / Agent Surface mock streaming。
- 创建 Save Answer Tray。
- 创建 Annotation mini sheet。
- 创建 Search / Preview mock。

### Backend

- 创建 Go API skeleton。
- 创建 workspace mock。
- 创建 repo import mock。
- 创建 file tree / content mock。
- 创建 reader payload endpoint。
- 创建 context resolve endpoint。
- 创建 chat stream mock。
- 创建 saved-answer / annotation endpoint。

### Agent

- 拆解 Cursor / Claude Code / Codex / Copilot / opencode。
- 选择 2-3 个开源框架做 PoC。
- 验证 permission model。
- 验证 ToolCallLog。
- 验证自定义工具 read/search/definition。

### QA / Fixtures

- 准备 TS fixture repo。
- 准备 Python fixture repo。
- 准备 Go fixture repo。
- 准备 Java fixture repo。
- 准备 large file / binary file cases。
- 准备 360x780 / 390x844 / 430x932 / landscape viewport checks。

## 7. 依赖关系

```text
PM demo script
  -> Frontend mock flow
  -> Backend mock endpoints
  -> Shared schema

Shared schema
  -> Frontend DTO usage
  -> Backend API contract
  -> Android contract readiness

Agent benchmark
  -> Agent runtime adapter design
  -> Backend Agent implementation
```

## 8. 风险登记表

| 风险 | 等级 | Owner | 缓解 |
|---|---|---|---|
| 范围膨胀 | 高 | PM/PMO | 不做事项 gate |
| Agent 变弱 | 高 | Agent/CTO | benchmark + PoC |
| 前后端 schema 不一致 | 高 | Architect | shared schema review |
| Clone 网络不稳定 | 中 | BE | timeout/proxy/readable error |
| Reader 移动端体验差 | 高 | FE/UX | viewport QA |
| 保存动作打断阅读 | 中 | FE/PM | Save Answer / Annotate 轻动作 |
| 安全边界遗漏 | 高 | BE/CTO | sandbox/security review |

## 9. 评审机制

- 每周一次产品/工程 demo。
- 每周一次风险复盘。
- 每个 slice 开始前做 DoR 检查。
- 每个 slice 完成后做 DoD 检查。
- Agent benchmark 单独评审。
- shared schema 变更必须前后端共同 review。

## 10. Definition of Ready

任务进入开发前必须满足：

- 有明确用户价值或技术目的。
- 有输入/输出。
- 有验收标准。
- 不违反不做事项。
- 依赖已明确。
- 涉及 schema/API 的任务已过 review。

## 11. Definition of Done

任务完成必须满足：

- 功能符合验收脚本。
- 文档或 schema 更新。
- 基础测试通过。
- 错误状态可见。
- 不引入源码修改 Agent / shell / commit 等越界能力。
- demo 可展示。

## 12. 范围控制规则

任何新增需求如果符合以下条件，默认进入 P1/P2：

- 需要账号系统。
- 需要私有仓库。
- 需要 Android 原生。
- 需要 Agent 修改源码。
- 需要 shell / terminal。
- 需要完整 LSP。
- 需要复杂同步。

除非 PM + CTO + Architect 三方同意，否则不进入当前 MVP。

## 13. 项目经理第一周行动

1. 基于本文档创建 issue。
2. 组织 P0 scope review。
3. 组织 shared schema review。
4. 组织 Agent benchmark review。
5. 建立 demo checklist。
6. 跟踪 fixture repo 准备。
7. 每周五产出项目状态摘要。
