# Pocket Vibe 技术可行性与架构选型报告

版本：MVP 技术评估 v0.5  
日期：2026-05-15  
适用范围：Web/PWA 优先验证；后续适配 Android、HarmonyOS NEXT / 原生鸿蒙  
输入依据：`POCKET_VIBE_MVP_PRD.md`、`POCKET_VIBE_BRAINSTORM.md`、`POCKET_VIBE_COMPETITIVE_ANALYSIS.md`、`POCKET_VIBE_MOBILE_UX_SPEC.md`

## 1. 结论摘要

Pocket Vibe 第一版建议调整为 **Web/PWA 优先验证**，先用最短路径证明“读源码 -> Ask AI -> Save Note”闭环是否成立；Android 和 HarmonyOS NEXT / 原生鸿蒙后续再做原生化。它不是一个常规网页工具问题，而是一个“Web 代码阅读器 + 服务端索引系统 + 受控 LSP/语义服务 + AI Chat/Agent 编排层”的问题。即使首发 Web/PWA，MVP 从第一版起仍必须采用 **前端 shell + 后端 core service + 可迁移 schema/DTO** 的架构边界。

推荐技术栈：

**Web/PWA TypeScript App Shell + CodeMirror 6 Reader + 后端 repo/index/semantic/agent service。后续 Android 使用 Kotlin/Java 原生壳层，HarmonyOS NEXT / 原生鸿蒙使用 ArkTS/ArkUI 原生壳层，并复用 Web MVP 沉淀下来的 repo schema、ContextChip、ToolCall、Anchor、Note、ChatSession 和 Agent 协议。**

具体建议：

- Web/PWA MVP 前端使用 TypeScript + CodeMirror 6，不用 Monaco 作为首发 reader，避免移动浏览器和小屏交互成本过高。
- repo clone、Tree-sitter、ripgrep、LSP/semantic-lite、AI Agent 工具调用优先放后端服务，浏览器只负责阅读、交互、上下文组织和状态展示。
- PWA 作为安装入口和轻离线能力：缓存 App shell、最近打开仓库元数据、阅读位置、草稿和笔记；不承诺完整离线读大仓库。
- Android / HarmonyOS NEXT 后续原生版重写阅读器壳层，但复用 Web MVP 沉淀的后端 API、数据 schema、Anchor、上下文篮子和 Agent 工具协议。
- AI Chat 与 Agent 不应散落在前端组件里。MVP 需要单独的 `AgentCoordinator`：负责模型路由、上下文篮子、token 预算、工具调用权限、流式回复、引用解析、历史保存和失败重试。
- Web/PWA 首发不做本地完整 git clone、不做浏览器内重型 LSP、不做 Agent 改代码、不做私有仓库深度支持。
- Flutter / React Native 暂不作为首发路线；后续 Android/鸿蒙优先走原生壳层，而不是 WebView 包壳作为最终形态。

最重要的工程判断：

1. Web/PWA 首发可以显著降低验证成本，尤其适合先验证 GitHub URL 导入、源码阅读、AI 问答和笔记沉淀。
2. 纯浏览器端能力不足以承载第一版完整源码阅读系统；P0 应采用 Web 前端 + 后端 repo/index/semantic 服务。
3. Tree-sitter、ripgrep、LSP、CodeMirror 都应复用开源；自研重点是阅读流程、上下文篮子、Agent 工具权限、Anchor 和知识沉淀。
4. Web 版应主动削减本地化承诺：不做完整离线、不做本地私有仓库索引、不在浏览器里跑重型 LSP。
5. Chat/Agent 是 MVP 闭环的一部分，不只是 UI 浮层。它需要清晰的本地/服务端编排层、工具权限模型、上下文裁剪策略和隐私边界。
6. 后续 Android / HarmonyOS NEXT 能否低成本落地，取决于 Web MVP 是否把 ContextChip、ToolCall、Anchor、Note、ChatSession、RepoIndex 等协议设计成平台无关。

从移动端架构负责人的角度，最需要提前拍死的红线是：

- Web MVP 可以快，但不能把 CodeMirror state、DOM selection、URL hash 当成长期数据模型。
- 所有代码位置必须用稳定 SourceRange / Anchor 表达，UI 的 visual row 只能是派生状态。
- Reader、Chat、Note、Search、Definition 的共享状态必须进入平台无关 store，不允许散落在页面组件里。
- Android/鸿蒙原生化不是 WebView 套壳，也不是重做业务逻辑；它应该只替换 shell、renderer、storage adapter 和部分 local core。
- 一旦 Web 版验证通过，原生版的核心价值是离线、本地仓库、长时间阅读手感、系统级安全存储和低内存稳定性，不是再做一遍网页。

## 2. 技术栈选型

### 2.1 选型矩阵

| 方案 | 结论 | 优点 | 硬风险 |
|---|---|---|---|
| Web/PWA TypeScript + CodeMirror 6 + 后端 core service | 强推荐，首发验证主栈 | 最快验证产品闭环；天然跨桌面/移动浏览器；部署、分享、迭代、埋点和账号同步成本低 | 浏览器本地文件、离线、后台任务和重型 LSP 能力弱；需要服务端承载仓库与索引 |
| Native Android Kotlin/Java | 后续原生主栈 | 原生文件系统、进程、后台任务、JNI、Canvas、RecyclerView、性能分析工具链最完整；适合移动端重度阅读和离线能力 | 首发成本高；Android/HarmonyOS/Web 不能复用 UI |
| HarmonyOS NEXT ArkTS/ArkUI + NAPI/FFI | 后续原生版目标 | 符合原生鸿蒙长期方向；可通过 NAPI/FFI 复用 Rust/C/C++ core 或 Web MVP 后端协议 | 不适合抢首发；需要单独适配 ArkUI、文件沙箱、后台任务和 native bridge |
| iOS Swift/SwiftUI/UIKit + C ABI/Swift FFI | 后续可选目标 | 原生滚动、文本渲染、系统安全存储、后台策略、Share extension 等体验最好 | 当前不是明确首要平台；UI 与 reader 壳层需要重写 |
| Flutter | 不推荐首发 | UI 一致性强；`dart:ffi` 可直接调 C；Skia/Impeller 渲染能力强 | 对 Web/PWA 验证没有优势；后续原生阅读能力仍会落回平台层 |
| React Native | 不推荐 | 常规业务 UI 开发快；可接原生模块 | JS runtime 与 Node-based LSP 运行时资源竞争；核心能力几乎都要 native module |

### 2.2 推荐 Web/PWA 首发的原因

Web/PWA 首发的目标不是一次性做出最终形态，而是更快验证 Pocket Vibe 的核心命题：

- 用户是否愿意从 GitHub URL 进入一个源码阅读场景。
- 用户是否会围绕当前文件、函数、选区向 AI 提问。
- 用户是否愿意保存 AI 回复、批注和学习笔记。
- 上下文篮子、引用跳转、Anchor、Chat 历史这些概念是否真的顺手。
- 哪些语言、仓库类型和读码任务最有早期需求。

Web/PWA 的优势：

- 前端可以用 CodeMirror 6 快速获得成熟代码阅读能力。
- 服务端可以直接使用 Tree-sitter、ripgrep、LSP、git、Node/Python/Java runtime，避开移动端运行时打包和资源限制。
- Web 链接便于冷启动、分享读码路径、邀请测试用户、收集行为数据。
- PWA 可以提供安装感、App shell 缓存、草稿缓存和基础离线体验。
- 后续 Android / 鸿蒙可以复用同一套 API、schema、Agent 工具协议和笔记/Anchor 格式。

因此，Web/PWA 首发不是“降低产品要求”，而是把最难的市场验证先从移动原生工程里解耦出来。真正的移动端原生阅读体验，可以在 Web 闭环被验证后再投入。

### 2.3 后续 Native 的原因

Pocket Vibe 的长期主战场不是表单、列表和网络请求，而是：

- 本地 Git repo 文件系统管理。
- Tree-sitter C/Rust 解析。
- LSP 进程生命周期、stdio JSON-RPC、内存与 CPU 调度。
- 大文件文本布局、可视区域渲染、折叠、横向滚动、选区、sticky symbol。
- 后台索引、WorkManager 约束、Doze/App Standby 适配。
- 本地 SQLite/Room 索引缓存和 sidecar 数据一致性。

这些能力在 Android Native 下都能走一手 API。Android NDK/JNI 官方支持 Java/Kotlin 与 C/C++ native code 交互，且 Kotlin 编译到 ART bytecode，JNI 成本模型与 Java 基本一致。对于 Pocket Vibe，应避免“每个 token/每行代码跨 JNI 一次”，而采用批量接口，例如一次返回某文件的 highlight span、fold range、symbol range。

推荐分层改为“Web/PWA 首发 + 后续多壳”的架构：

```text
Web/PWA Shell
  - TypeScript
  - CodeMirror 6 reader
  - PWA app shell / service worker
  - IndexedDB for drafts, recent state, cached metadata
  - HTTP/WebSocket/SSE bridge
          |
          v
Backend Core Service
  - repo clone / storage / cleanup
  - Tree-sitter parse and symbol extraction
  - ripgrep-like search
  - LSP / semantic-lite service
  - Anchor resolver
  - Chat / Agent coordinator
  - note and chat persistence

Later Native Shells
  Android: Kotlin / Compose / View -> backend API first, local core later
  HarmonyOS NEXT: ArkTS / ArkUI -> backend API first, native bridge later

Optional local native core after product validation:
            pocket-core: Rust/C/C++
              - Tree-sitter runtime and grammars
              - ripgrep-like search engine
              - text chunk / line offset model
              - fold range / symbol index
              - anchor fingerprint and fuzzy resolver
              - LSP JSON-RPC client core and state machine
              - platform-neutral DTOs and error model

            AgentCoordinator
              - chat session and message store
              - context basket and token budget
              - model provider routing
              - tool permission and audit log
              - streaming response and retry state
              - citation extraction and anchor linking

Platform Adapter
  - file system access
  - process launch / stdio pipe
  - background task policy
  - battery / thermal / memory signal
  - logging and telemetry bridge
```

### 2.4 Web/PWA 功能取舍

Web/PWA 首发要主动做取舍。目标不是复刻桌面 IDE，也不是提前兑现 Android 原生离线能力，而是把核心闭环做顺。

**P0 必须做**

| 能力 | Web/PWA 方案 | 取舍说明 |
|---|---|---|
| 公共 GitHub 仓库导入 | 用户粘贴 URL，后端 clone 到隔离 workspace | 不做私有仓库，不做本地目录导入。 |
| 仓库文件树 | 后端返回 filtered file tree，前端展示目录、文件类型、大小、语言 | 跳过二进制、大文件、依赖目录和构建产物。 |
| Code reader | CodeMirror 6 只读模式，支持行号、语法高亮、折叠、选区、当前文件路径 | 不追求移动端原生滚动手感；先保证桌面 Web 和移动浏览器可读。 |
| 搜索 | 后端 ripgrep，前端展示结果和片段 preview | 搜索先做全文文本搜索，不做复杂结构查询 UI。 |
| 基础符号结构 | 后端 Tree-sitter 提取 functions/classes/document symbols | 第一版可先服务折叠、sticky symbol、当前函数上下文。 |
| 定义/引用候选 | 后端 semantic-lite + 可选 LSP，前端半屏/侧边 preview | 不承诺所有语言桌面 IDE 级准确，结果要标明 confidence。 |
| Chat 浮层 | 右侧面板/底部面板，支持流式回复、重试、取消 | 移动浏览器优先使用底部 sheet，桌面优先右侧 panel。 |
| 上下文篮子 | 当前文件、当前函数、选区、搜索结果、引用结果变成 chip | 发送前展示 token 粗估，超限必须裁剪。 |
| 只读 Agent 工具 | read file、search、get symbol、find references、find related files、create note draft | 禁止改源码、执行 shell、commit、push。 |
| 笔记保存 | 保存 AI 回复为 Markdown note，绑定 anchor | 保存后不离开 reader。 |
| 阅读状态 | 最近仓库、最近文件、滚动位置、展开/折叠状态、Chat session | 服务端持久化 + 浏览器 IndexedDB 缓存。 |
| PWA 安装体验 | manifest、service worker、App shell cache、离线提示页 | 只缓存壳和草稿，不承诺离线读完整仓库。 |

**P1 可以做**

| 能力 | 价值 | 延后原因 |
|---|---|---|
| 账号登录与同步 | 同步笔记、Chat 历史、配置 | P0 可以先本地/匿名 workspace 验证闭环。 |
| 多模型 profile | OpenAI-compatible base URL、模型路由 | P0 先支持一个 OpenAI-compatible 配置即可。 |
| Repo read pack | 官方推荐仓库、学习路线、示例 prompt | 有助于冷启动，但不应阻塞 reader/chat/note。 |
| AI 整理版笔记 | 原文 + 整理版 | P0 先保存原始回答和用户编辑版。 |
| 知识卡片 | 提炼长期知识资产 | 需要先验证 note 使用频率。 |
| 分享链接 | 分享仓库阅读位置或笔记 | 需要权限、隐私和 workspace 生命周期设计。 |
| 轻量移动适配 | 手机浏览器上的底部 sheet、拇指热区、字号设置 | P0 要可用，P1 再打磨手感。 |

**P0 明确不做**

| 不做项 | 原因 |
|---|---|
| 浏览器本地完整 git clone | 浏览器文件系统、权限、性能和跨浏览器一致性都不适合首发。 |
| 完整离线阅读大仓库 | PWA 可缓存壳和草稿，但不能承诺完整 repo 离线索引。 |
| 私有仓库深度支持 | 涉及 OAuth、token、源码隐私、隔离和合规，P0 风险过高。 |
| 浏览器内重型 LSP runtime | Node/Python/Java runtime、内存和 worker 管理复杂，先走服务端。 |
| Agent 改代码 | 与 MVP 定位冲突，也会显著增加安全、审计和 Git 流程复杂度。 |
| 运行项目 / 测试 / 终端 | Pocket Vibe 首发验证的是读码，不是云 IDE。 |
| WebView App 壳 | 先做纯 Web/PWA，确认闭环后再决定 Android/鸿蒙原生壳还是 WebView 过渡壳。 |

**Web/PWA P0 成功标准**

1. 用户能在 1 分钟内从 GitHub URL 进入代码阅读页。
2. 用户能在 4 次关键点击内完成 `Search/Jump -> Ask -> Save`。
3. AI 回答必须带可回跳的代码引用或上下文 chip。
4. 保存笔记后仍停留在 reader，不打断阅读。
5. LSP/semantic 失败时仍能通过搜索、符号和 AI 解释继续读。
6. 移动浏览器至少能完成核心链路，但不以原生级手感作为 P0 验收。

### 2.5 Android / HarmonyOS 后续原生化策略

Android 与 HarmonyOS NEXT / 原生鸿蒙不应视为“Web 做完后套壳”。正确策略是先复用 Web MVP 的后端 API 和数据协议，再逐步把高价值能力下沉到本地。

```text
Web/PWA MVP:
  TypeScript UI -> Backend core service

Android native:
  Kotlin UI -> Backend core service first
  Kotlin UI -> local pocket-core later

HarmonyOS NEXT:
  ArkTS/ArkUI UI -> Backend core service first
  ArkTS/ArkUI UI -> local pocket-core via NAPI/FFI later
```

后续原生化优先级：

1. 原生 reader 手感：长行、横向滚动、选区、折叠、sticky symbol、字体和主题。
2. 本地已 clone 仓库阅读。
3. 本机安全存储 API key。
4. 离线阅读和本地阅读状态。
5. 本地 Tree-sitter / ripgrep。
6. 本地 LSP runtime，只对高价值语言逐步验证。

Android/鸿蒙后续必须复用：

- `ContextChip` / `ToolCall` / `ModelProfile` / `ChatSession` schema。
- Anchor URI 和 resolver 策略。
- Note / DailyReport / KnowledgeCard 数据格式。
- Reader API：file tree、open file、search、definition、references、symbol outline。
- Agent 工具权限分级。

这样 Web/PWA 首发不会变成一次性原型，而会成为后续移动端的产品协议和后端底座。

### 2.6 移动端原生化不可妥协点

后续 Android/鸿蒙原生化不能只追“功能对齐 Web”，而要解决 Web 天然做不好的移动端重体验问题。以下是原生版立项前必须接受的工程边界。

**原生版必须新增的价值**

| 维度 | Web/PWA 首发 | Android/鸿蒙原生版必须补齐 |
|---|---|---|
| 仓库来源 | 公共 GitHub 仓库，服务端 clone | 本地已 clone 仓库、本机目录导入、后续私有仓库 |
| 离线能力 | App shell、草稿、最近状态缓存 | 已 clone 仓库完整离线阅读、搜索和笔记查看 |
| 阅读手感 | CodeMirror 在移动浏览器中可用 | 原生滚动、横向拖动、长行处理、选区手柄、字号/主题和软键盘避让 |
| 性能控制 | 浏览器和后端共同兜底 | 明确内存、帧率、冷启动、后台任务和低端机降级策略 |
| 安全存储 | 服务端托管或浏览器受限存储 | Android Keystore / 鸿蒙安全存储，本机 API key 不云同步 |
| 系统集成 | PWA 安装、链接分享 | 深链、分享面板、通知、后台任务、文件选择器、系统返回手势 |

**原生版架构边界**

- `ReaderState`、`ChatState`、`ContextBasket`、`NoteState` 必须是平台无关状态机。
- 原生 renderer 只消费 `CodeDocument`、`VisualLineModel`、`HighlightChunk`、`FoldRange`、`SelectionRange`。
- 原生 renderer 不负责解析语言、不负责决定 prompt、不负责写笔记业务逻辑。
- Android / ArkUI 只实现 shell、renderer、storage adapter、permission adapter、background adapter。
- Local `pocket-core` 只在收益明确后下沉，不为了“看起来更原生”提前搬运后端。

**坐标系统红线**

源码阅读器最容易在后期翻车的是坐标系统混乱。必须从 Web MVP 起统一：

```text
SourceRange:
  - filePath
  - contentVersion
  - startByte / endByte
  - startLine / startColumn
  - endLine / endColumn

VisualRange:
  - visualStartRow / visualEndRow
  - xStart / xEnd
  - foldVersion
  - wrapVersion

Anchor:
  - sourceRange
  - symbol identity
  - snippet fingerprint
  - commit/blob metadata
  - confidence
```

规则：

- LSP、Tree-sitter、搜索、笔记和 Chat 引用都使用 `SourceRange`。
- UI 滚动、折叠、自动换行、sticky header 使用 `VisualRange`。
- `VisualRange` 不允许入库为长期引用；它只能由 `SourceRange + FoldState + WrapState` 派生。
- 任何保存到笔记或 Chat 历史里的代码位置，都必须能脱离 CodeMirror 或原生 View 单独解析。

**原生版性能预算建议**

| 场景 | 目标 | 降级策略 |
|---|---:|---|
| 打开 1 MB / 10k 行文件 | 首屏可读 < 700 ms | 先纯文本，后补高亮 |
| 滚动代码区 | 目标 60 fps，低端机不低于 45 fps | 只绘制可视窗口，暂停非关键 overlay |
| 横向长行拖动 | 手势响应 < 50 ms | 超长行分段测量和绘制 |
| 切换文件卡片 | 恢复位置 < 200 ms | 预热最近文件 layout cache |
| 后台索引 | 不影响前台滚动和输入 | 前台优先级抢占，低电量/高温暂停 |
| 内存压力 | reader 增量内存可控 | LRU 清理 highlight/layout chunk，kill 非当前 LSP |

这些预算不是 P0 Web 验收项，但应该成为 Android/鸿蒙原生化立项时的验收基线。

**原生化 go/no-go 门槛**

只有当 Web/PWA 满足以下条件时，才建议投入完整 Android/鸿蒙原生化：

1. 至少 30% 的活跃用户在 7 天内完成过一次 `Read -> Ask -> Save`。
2. 用户反馈集中在“移动端手感、离线、本地仓库、安全存储”，而不是基础产品闭环不成立。
3. 后端 API、Anchor、ContextChip、ChatSession schema 稳定至少一个小版本。
4. 语义导航失败时的 fallback 体验已被验证可接受。
5. 已经能明确第一批原生端目标用户和仓库类型。

如果这些条件未满足，继续迭代 Web/PWA 比提前重写原生端更划算。

### 2.7 Flutter 的位置

Flutter 能通过 `dart:ffi` 调 C API，也能通过 platform channel 调 Kotlin/Java，因此不是“不可能”。如果目标是同时高质量发布 Android/iOS，Flutter 可以考虑。

但对 MVP 来说，Flutter 的主要问题是：最难的工作仍然要用 Android native 做。比如 LSP 进程管理、Android 后台限制、超大文本布局、JNI/NDK 包装、系统级内存压力处理，Flutter 不能显著降低这些成本。相反，UI 层到 native core 的生命周期、线程、对象所有权和调试路径会多一层。

结论：Flutter 适合产品 UI 较重、引擎能力相对简单的跨平台 App；Pocket Vibe MVP 不属于这个类型。

### 2.8 React Native 的位置

React Native 可以通过 Native Modules、Turbo Modules、C++ Modules 接原生能力，但这对 Pocket Vibe 不是优势。项目同时会面临：

- RN 自身 JS runtime。
- JS/TS/Python 语言服务器可能需要 Node runtime。
- 大量文件索引和 JSON-RPC 消息。
- 原生代码阅读器仍需 Kotlin/C++ 实现。

这会让主线程、JS 线程、native worker、LSP process 的资源关系变得更难控制。MVP 不建议采用 RN。

### 2.9 Reader 语言方案：开源复用与自研边界

这里需要修正一个关键判断：Pocket Vibe 的 Reader 语言能力不应该完全自研。行业里已经有成熟的开源组件和协议，应该把它们组合成 Pocket Vibe 的移动阅读体验。

| 能力 | 可复用开源方案 | 是否自研 | 说明 |
|---|---|---|---|
| 语法解析 / 结构提取 | Tree-sitter runtime + 各语言 grammar | 不自研 parser，只自研 query 适配与数据模型 | 用于 highlight、fold、symbol、函数范围、sticky symbol。 |
| 全文搜索 | ripgrep / Rust `grep`、`ignore` 相关 crate | 不自研搜索引擎，只自研索引调度策略 | 复用成熟搜索和 ignore 规则处理，重点做资源、分页和 UI。 |
| 语义跳转 | LSP + tsserver、Pyright、gopls、JDT LS、clangd、SourceKit-LSP 等 | 不自研语言服务器，只自研调度与降级 | 难点在 runtime、进程、内存、超时和 fallback。 |
| Web reader/editor | CodeMirror 6；Monaco 作为重 Web 备选 | Web 端不自研完整编辑器 | CodeMirror 更轻，更适合可定制阅读器；Monaco 更像桌面 IDE。 |
| Android reader/editor | Sora Editor 等开源 Android code editor 组件 | 先 spike，必要时自研核心渲染 | 如果开源组件满足大文件、折叠、只读、选区、横向滚动和自定义 gutter，可作为 MVP 起点。 |
| iOS reader/editor | Runestone 等开源 iOS code editor 组件 | 后续 spike，必要时自研 shell | iOS 版应复用 core 模型，但 renderer 可评估现成组件。 |
| 高亮主题 | TextMate grammar / Shiki 生态可作为参考 | 移动端样式映射需要自研 | Web 端可直接复用更多；原生端需要映射到 chunk style。 |

结论：**语言能力复用开源，阅读体验自研或深度定制。**

不建议把 Pocket Vibe 做成“移动端 Monaco/WebView 包壳”，因为产品差异化不在桌面 IDE 复刻，而在手机上的 Jump / Ask / Save 流程、函数级阅读、上下文篮子、阅读轨迹、半屏预览和轻量知识沉淀。开源工具负责底层语言能力，Pocket Vibe 负责把这些能力变成移动端顺手的源码阅读系统。

MVP 推荐 spike 顺序：

1. Android 先评估 Sora Editor：大文件滚动、只读模式、行号、横向滚动、选区、语法高亮、折叠、gutter 自定义、事件拦截。
2. 同步沉淀 `pocket-core` 的 `CodeDocument` / `VisualLineModel` / `HighlightChunk` / `FoldRange`，避免被某个 UI 组件锁死。
3. 如果 Sora Editor 无法可靠承载函数折叠、sticky symbol、半屏 preview 和上下文 chip，就切到自研 `View`/`Canvas` renderer。
4. Web/PWA 首发优先验证 CodeMirror 6 只读阅读器；后续 Android/鸿蒙是否使用 WebView 只作为过渡策略评估，不作为最终体验假设。

## 3. Tree-sitter 与后端索引集成方案

### 3.1 可行性判断

Tree-sitter 很适合 Pocket Vibe：

- runtime 是 C11，可嵌入 App。
- 解析足够快，面向编辑器场景设计。
- 支持查询系统，可用 query 提取 highlight、fold、function/method、docstring、symbol range。
- 对 MVP 的只读源码阅读场景，比完整编译器前端更轻。

推荐接入方式：

1. Web/PWA 首发先在后端 core service 集成 `libtree-sitter` 与第一梯队语言 grammar，避免浏览器端承担重解析和大文件内存压力。
2. JS/TS、Python、Go、Java 分别提供 parser 与 highlight/fold/symbol query。
3. 用 Rust `tree-sitter` binding 或直接 C API 封装为后端 core module；后续需要本地化时再沉淀为 `pocket-core`。
4. Web/Android/ArkTS shell 只拿结构化结果，不持有 Tree-sitter 原始树对象。

### 3.2 Bridge 接口设计

Web/PWA MVP 阶段先通过后端 API 调用 core service；后续 Android 原生版可通过 JNI 调用本地 `pocket-core`，HarmonyOS NEXT 原生版可通过 NAPI/FFI 调用同一套 core。无论哪种 bridge，边界都要粗粒度。推荐接口形态：

```kotlin
data class ParseRequest(
    val projectId: String,
    val filePath: String,
    val language: String,
    val contentVersion: Long,
    val needHighlights: Boolean,
    val needFolds: Boolean,
    val needSymbols: Boolean
)

data class ParseResult(
    val filePath: String,
    val contentVersion: Long,
    val lineCount: Int,
    val byteLength: Long,
    val highlightChunks: List<HighlightChunk>,
    val foldRanges: List<FoldRange>,
    val symbols: List<CodeSymbol>,
    val diagnostics: List<ParseDiagnostic>
)
```

Native core 内部：

- 后端直接读取隔离 workspace 文件；后续本地化时再使用 mmap 或 native file read 减少大字符串复制。
- 维护 line offset table，所有 Tree-sitter byte range 可映射到 line/column。
- query 编译后按 language 缓存。
- highlight span 按可视窗口或 chunk 返回，例如每 256 行一个 chunk。
- fold range 和 symbol range 写入 SQLite 缓存。

### 3.3 高亮与折叠流水线

```text
Open file
  -> detect language by extension / shebang
  -> build line offset table
  -> Tree-sitter parse
  -> run query:
       highlights.scm
       folds.scm
       locals.scm / symbols.scm
  -> normalize captures to token styles
  -> persist fold/symbol index
  -> renderer only requests visible highlight chunks
```

降级规则：

- 文件小于 1 MB 或小于 10k 行：打开时可直接异步完整解析。
- 1 MB 到 5 MB：先纯文本打开，再按 chunk 补高亮；fold/symbol 异步完成。
- 超过 5 MB 或超过 50k 行：默认关闭全量语法高亮，仅做可视窗口浅高亮和搜索。
- Tree-sitter 失败：退化为纯文本 + ripgrep 搜索，不影响阅读。

## 4. LSP / 语义服务集成与资源策略

### 4.1 LSP 可行性判断

LSP 协议层可行。LSP 是编辑器/IDE 与 language server 之间的 JSON-RPC 协议，定义了 go to definition、find references、document symbol 等能力。

真正的难点不是协议，而是语言服务器：

| 语言 | 推荐路线 | 资源/运行时风险 | MVP 建议 |
|---|---|---|---|
| JS/TS | TypeScript server / `typescript-language-server`，通过 stdio LSP | 需要 Node runtime；`node_modules`、project reference、tsconfig 会带来高内存 | 支持，但必须排除 `node_modules`，按打开文件和 tsconfig 根懒加载 |
| Python | Pyright / basedpyright / Jedi 类方案 | Pyright 需要 Node；Jedi 需要 CPython；三方包索引成本高 | 支持常见纯 Python repo；默认不扫虚拟环境和 site-packages |
| Go | `gopls` | 需要 Go binary 适配 Android；module cache 与依赖缺失影响准确性 | 可作为第一梯队较可控语言，按 `go.mod` 根启动 |
| Java | Eclipse JDT LS | 需要 Java 21 runtime；JDT、Gradle/Maven 导入和索引非常重 | 不建议默认全量启用；MVP 用 Tree-sitter + package/class symbol 降级，JDT LS 作为实验开关 |

因此，MVP 对外体验应写成：

- “索引就绪后提供准确跳转/引用”。
- “索引中提供候选结果和弱 loading”。
- “资源不足或语言服务器不可用时，降级为符号索引 + 搜索候选”。

不要在 UI 上假装所有语言都能随时提供桌面 IDE 级语义。

### 4.2 LSP 架构

```text
LspCoordinator
  - project language detection
  - active language priority
  - server state machine
  - request timeout and cancellation
  - memory / battery / thermal policy

LspClient
  - JSON-RPC 2.0
  - initialize / initialized / shutdown
  - didOpen / didClose / didChange
  - definition / references / documentSymbol
  - progress and diagnostics

LanguageServerHost
  - process launcher
  - stdio pipe
  - cache directory
  - environment variables
  - kill / restart / crash backoff

SemanticFallback
  - Tree-sitter symbol graph
  - import resolver
  - ripgrep word search
  - candidate ranking
```

### 4.3 “按需索引 + 休眠降级”策略

#### 4.3.1 分层索引

索引分四层，严格按用户价值排序：

**L0：Repository manifest**

clone 完成后立即做，成本低：

- 文件树。
- `.gitignore` / ignore 规则。
- 语言统计。
- 大文件/二进制文件标记。
- 包管理文件：`package.json`、`tsconfig.json`、`pyproject.toml`、`go.mod`、`pom.xml`、`build.gradle`。

**L1：阅读基础索引**

不依赖 LSP，必须快：

- 当前文件 Tree-sitter parse。
- 最近打开文件 Tree-sitter parse。
- document symbols。
- fold ranges。
- ripgrep 搜索准备。

**L2：焦点语义索引**

用户打开某语言文件、点击符号、请求引用时触发：

- 启动对应 LSP server。
- 只 `didOpen` 当前文件与最近访问文件。
- 根据 import/include/module graph 扩展一跳依赖。
- 优先响应 `definition`，再做 `references`。

**L3：项目语义索引**

只在合适资源条件下做：

- App 前台且用户停留。
- 或设备充电、非低电量、温度正常、用户允许后台索引。
- 使用 WorkManager 约束执行可延期任务。
- 可随时取消，不影响阅读。

#### 4.3.2 LSP 状态机

```text
Stopped
  -> Starting        用户打开该语言文件或点击语义动作
  -> Warming         initialize 完成，发送 workspace/didChangeConfiguration
  -> Hot             可响应 definition/references
  -> Idle            60-120 秒无语义请求
  -> Hibernating     保存 cache，停止 diagnostics / 后台任务
  -> Stopped         3-5 分钟无使用、内存紧张、App 后台、低电量
  -> Disabled        连续崩溃、资源超限、用户关闭
```

状态策略：

- 同一时间默认只允许 1 个 Hot LSP server。
- 第二个语言请求进入队列，必要时先休眠前一个。
- `definition` 超时建议 1500-2500 ms；超时展示 fallback 候选。
- `references` 超时建议 5000-8000 ms；可流式展示部分结果。
- 监听 `onTrimMemory`，中高压力下立即 kill 非当前语言服务器。
- App 后台后 30 秒内没有前台任务，则关闭 LSP，只保留 Tree-sitter/ripgrep 能力。

#### 4.3.3 调度伪代码

```kotlin
fun onSemanticAction(project: Project, file: SourceFile, action: SemanticAction) {
    val lang = detectLanguage(file)

    if (!policy.canRunLsp(lang)) {
        showFallback(action, reason = policy.reason)
        return
    }

    val server = coordinator.ensureServer(project, lang)
    server.prioritize(file)

    val request = when (action) {
        is GoToDefinition -> server.definition(file.uri, action.position)
        is FindReferences -> server.references(file.uri, action.position)
    }

    request
        .withTimeout(action.timeout)
        .onSuccess { result -> showSemanticResult(result) }
        .onTimeout { showFallback(action, reason = "LSP warming") }
        .onFailure { showFallback(action, reason = it.userMessage) }
}
```

#### 4.3.4 降级结果排序

当 LSP 不可用时，使用 `Tree-sitter symbol graph + import resolver + ripgrep` 给候选结果：

得分建议：

| 信号 | 分值 |
|---|---:|
| 同文件同 symbol 定义 | +40 |
| import/module path 可解析到目标文件 | +30 |
| Tree-sitter symbol 名称完全匹配 | +25 |
| qualified name 匹配 | +25 |
| ripgrep word boundary 命中 | +10 |
| 文件路径靠近当前文件 | +8 |
| 行号/上下文接近历史位置 | +5 |
| 位于依赖目录、构建产物、vendor | -30 |

UI 必须标明“候选结果”，不要标成“准确定义”。

### 4.4 语言级策略

语言支持要和平台支持分开看。Android、HarmonyOS NEXT、iOS、Web 是 App 运行平台；JS/TS、Python、Go、Java、Kotlin、ArkTS/ETS、Swift、C/C++ 才是被阅读的源码语言。

MVP 建议仍以第一梯队语言压实体验：

| 梯队 | 语言 | 推荐能力 |
|---|---|---|
| P0 | JS/TS、Python、Go、Java | Tree-sitter 高亮/折叠/符号 + 搜索 + LSP 或 semantic-lite 降级 |
| P1 | Kotlin/Android、ArkTS/ETS、C/C++ | 先做 Tree-sitter/搜索/符号索引；LSP 运行时单独评估 |
| P1/P2 | Swift/Objective-C | iOS 版或服务端环境优先评估 SourceKit-LSP；移动端本机运行不作为 MVP 假设 |
| Web 端 | 与项目源码语言一致 | Reader UI 用 CodeMirror 6；heavy semantic 可走 server-side LSP |

HarmonyOS 不是一种源码语言。后续真正需要考虑的是 ArkTS/ETS 代码阅读：它可以先按 TypeScript-like 语言处理，P1 再评估专用 grammar、语义服务和 OpenHarmony 工程结构。

**JS/TS**

- 根目录选择：最近的 `tsconfig.json` / `jsconfig.json` / `package.json`。
- 默认排除：`node_modules`、`dist`、`build`、`.next`、`.turbo`。
- 只对用户打开过的 project root 启动 tsserver/LSP wrapper。
- 对 monorepo 按 package 分区，避免一次打开全仓。

**Python**

- 根目录选择：`pyproject.toml`、`setup.cfg`、`requirements.txt`、`.git`。
- 默认不索引 `.venv`、`venv`、`site-packages`。
- 没有解释器环境时，仍可做源码级跳转；三方库跳转提示“依赖未下载/未索引”。

**Go**

- 根目录选择：`go.mod`。
- 当前 repo 内 definitions/references 优先。
- 离线时不执行依赖下载。
- `vendor` 目录默认低优先级，用户可启用。

**Java**

- 全量 JDT LS 默认关闭或实验性启用。
- MVP 先做：
  - package/class/method Tree-sitter index。
  - `import` 到文件路径的解析。
  - 同 repo 内 class/method candidate。
- 如果后续要启用 JDT LS，需要独立评估 Java runtime 体积、内存上限、Gradle/Maven 导入策略和用户设备分层。

## 5. Web Reader 与后续原生文本渲染方案

### 5.1 不使用 WebView 的总体方案

后续 Android/鸿蒙原生版不建议长期用 WebView/Monaco 包壳，但也不等于必须从第一天完全自研渲染器。推荐路线是：

1. 先对 Sora Editor 等开源 Android code editor 组件做 spike，验证它能否承载只读源码阅读、大文件滚动、语法高亮、行号、选区、折叠、gutter 自定义和事件拦截。
2. 同时沉淀与 UI 组件无关的 `CodeDocument`、`VisualLineModel`、`HighlightChunk`、`FoldRange`、`SelectionRange` 等数据模型。
3. 如果开源组件无法可靠承载函数级折叠、sticky symbol、半屏 preview、上下文 chip 和阅读轨迹，再切到自研只读代码渲染器：

**Kotlin custom `View` + Android `Canvas` + line virtualization + background text measurement。**

Compose 可用于顶部栏、搜索面板、Chat 浮层、卡片视图等 UI，但核心代码阅读区建议使用 `AndroidView` 包裹 Sora/custom native view，避免把几万行富文本直接放进 Compose 文本树。

### 5.2 文本渲染方案对比

| 方案 | 可行性 | 优点 | 风险 | 结论 |
|---|---|---|---|---|
| Sora Editor 等开源 Android code editor | 中高 | 可快速获得代码编辑/高亮/行号/选区等基础能力 | 是否支持 Pocket Vibe 的只读阅读、函数折叠、sticky symbol、半屏 preview、上下文 chip 需要验证；许可证与维护活跃度需检查 | 先 spike |
| Custom View + Canvas | 高 | 控制力最强；可只绘制可视行；横向滚动、折叠、sticky header、选区都可精细控制 | 工程量较大 | Sora spike 不满足时推荐 |
| RecyclerView 每行一个 LineView | 中高 | 快速获得回收机制；实现成本比纯自研低 | 跨行选择、横向滚动、wrap、fold 映射会复杂 | 可作为 MVP 折中 |
| Jetpack Compose LazyColumn | 中 | UI 写法现代；和 App 其他 UI 一致 | 大量富文本、高频滚动、精细文本测量容易遇到 recomposition 和 layout 成本 | 不建议做核心代码区 |
| 单个 TextView / Spannable | 低 | 实现简单 | 几万行文件会卡顿和高内存；折叠/局部更新困难 | 不采用 |
| WebView / Monaco | 低 | 桌面编辑器生态强 | PRD 明确不使用传统 WebView；移动体验和内存不可控 | 不采用 |

### 5.3 可复用渲染模型

```text
CodeDocument
  - file path
  - byte buffer / mapped file
  - line offset table
  - line count
  - encoding

VisualLineModel
  - logical line -> visual row mapping
  - fold ranges
  - wrap mode
  - hidden line spans

StyleIndex
  - highlight chunks
  - diagnostic spans
  - selection spans
  - search hit spans

CodeLayoutCache
  - per-line measured width
  - optional StaticLayout for wrapped lines
  - LRU by visible window

CodeView
  - scroll state
  - draw line numbers
  - draw visible lines only
  - draw folded placeholders
  - draw sticky symbol overlay
  - handle gestures and selection
```

### 5.4 关键性能策略

1. **只渲染可视窗口**

   例如屏幕可见 40 行，buffer 额外上下各 80 行。无论文件 2k 行还是 50k 行，单帧绘制对象数量基本稳定。

2. **固定行高优先**

   默认不自动换行，用等宽字体和固定 line height。横向滚动比自动换行更适合源码。自动换行作为 P1/设置项。

3. **预计算 line offset table**

   打开文件时扫描换行，得到 byte offset -> line/column 映射。滚动、跳转、anchor 恢复都依赖它。

4. **高亮按 chunk 缓存**

   Tree-sitter 产生的 token span 按 128/256 行切块。renderer 请求可视 chunk，缺失时先画纯文本，再异步补色。

5. **文本测量放后台**

   Android `PrecomputedText` 可提前计算文本 metrics，`StaticLayout` 适合不可编辑文本布局。非换行模式下可进一步优化：等宽字体只测一次 char width，大多数行宽可用字符数估算，只有含 tab/宽字符的行特殊处理。

6. **折叠不改源文档**

   fold 只改变 logical line 到 visual row 的映射。源文件 byte offset、anchor range、LSP range 保持原始坐标。

7. **sticky 当前函数名用 interval tree**

   Tree-sitter symbol range 建 interval tree。滚动时用当前 top line 查询所在 function/method，更新 sticky header。

8. **大文件保护**

   - 超过 10k 行：关闭自动换行。
   - 超过 50k 行：只做可视窗口高亮。
   - 超过 5 MB：打开前提示性能风险，默认纯文本 + 搜索。
   - 单行超过阈值：截断绘制或分段绘制，避免一次测量超长字符串。

9. **移动端手势冲突提前设计**

   Android/鸿蒙原生版需要从一开始避开系统返回手势、横向代码滚动、选区拖拽、Chat sheet 拖拽之间的冲突。建议：

   - 右边缘不做强依赖入口，避免和系统返回手势冲突。
   - 代码横向滚动区域和底部 Chat sheet 拖拽区域分层命中测试。
   - 选区手柄出现时暂停左右滑动切卡片。
   - 搜索/定义/引用 preview 打开时不改变主 reader 位置，只有用户点 Open 才写入阅读轨迹。
   - 横屏优先展示重内容，竖屏优先保护 reader 当前行。

10. **软键盘与 Chat sheet 预算**

   Chat 是 P0，但不能把 reader 变成背景图。移动端需要约束：

   - 半屏 Chat 不弹键盘时，reader 当前行必须可见或有明确上下文摘要。
   - 键盘弹出后，不承诺完整阅读代码，但必须保留当前文件、当前函数、上下文 chip。
   - Chat 全屏退出必须恢复进入前的文件、滚动位置、折叠状态和选区。
   - 保存笔记不跳出 reader，只给轻反馈。

### 5.5 RecyclerView 折中方案

如果 Sora Editor spike 不满足，但团队仍希望比纯 Custom View 更快落地，可先做 RecyclerView：

- 每个 item 是一个自定义 `LineView`，绘制一行代码和行号。
- Adapter 输入不是文件行数组，而是 `VisualLineModel`，可表达折叠后的 placeholder 行。
- 横向滚动由外层 `HorizontalScrollView` 或自定义同步 scroll 管理。
- sticky header 独立 overlay，不放在 item 里。

这个方案比纯 Custom View 更易开发，但后续做跨行选区、minimap、平滑大跳转和自动换行时会遇到边界。若目标是“顶级移动端代码阅读器”，最终仍建议走 Custom View 或深度定制的成熟开源 editor。

## 6. Sidecar Anchor 映射机制

### 6.1 设计目标

Anchor 要解决的问题：笔记、批注、Chat chip 能在源码变更后尽可能找回原位置，同时不修改源码文件。

原则：

- Anchor 数据存在 sidecar SQLite/Room 数据库或 App 私有目录。
- Markdown 笔记只引用 `anchorId`，不内嵌脆弱行号。
- 定位必须有 confidence，不允许低置信度时静默跳错。
- Git commit、blob hash、symbol、snippet hash、上下文 hash、原始行号共同参与恢复。

### 6.2 数据结构设计

```kotlin
data class CodeAnchor(
    val anchorId: String,
    val projectId: String,
    val repoUrl: String,

    val baseCommit: String,
    val baseBranch: String?,
    val baseBlobSha: String,

    val filePath: String,
    val language: String,
    val kind: AnchorKind, // FILE, SYMBOL, SELECTION, LINE, SEARCH_RESULT

    val range: SourceRange,
    val symbol: AnchorSymbol?,
    val fingerprint: AnchorFingerprint,

    val createdAt: Long,
    val updatedAt: Long,
    val lastResolved: AnchorResolution?
)

data class SourceRange(
    val startLine: Int,
    val startColumn: Int,
    val endLine: Int,
    val endColumn: Int,
    val startByte: Int,
    val endByte: Int
)

data class AnchorSymbol(
    val name: String,
    val qualifiedName: String?,
    val kind: String, // function, method, class, interface, variable
    val containerName: String?,
    val symbolRange: SourceRange,
    val signatureHash: String?
)

data class AnchorFingerprint(
    val selectedTextSha256: String?,
    val normalizedSnippetSha256: String?,
    val prefixNormalizedSha256: String?,
    val suffixNormalizedSha256: String?,
    val lineTextSha256: String?,
    val simHash64: Long?,
    val tokenKGramMinHash: List<Long>,
    val algorithmVersion: Int
)

data class AnchorResolution(
    val status: ResolutionStatus, // EXACT, REMAPPED, AMBIGUOUS, STALE
    val currentCommit: String,
    val currentFilePath: String?,
    val currentRange: SourceRange?,
    val confidence: Double,
    val strategy: String,
    val resolvedAt: Long
)
```

SQLite 表建议：

```sql
CREATE TABLE anchors (
  anchor_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  base_commit TEXT NOT NULL,
  base_branch TEXT,
  base_blob_sha TEXT NOT NULL,
  file_path TEXT NOT NULL,
  language TEXT NOT NULL,
  kind TEXT NOT NULL,
  range_json TEXT NOT NULL,
  symbol_json TEXT,
  fingerprint_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE anchor_resolution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anchor_id TEXT NOT NULL,
  current_commit TEXT NOT NULL,
  current_file_path TEXT,
  current_range_json TEXT,
  status TEXT NOT NULL,
  confidence REAL NOT NULL,
  strategy TEXT NOT NULL,
  resolved_at INTEGER NOT NULL
);
```

### 6.3 Anchor 创建流程

用户保存笔记或批注时：

```text
1. 读取 repo HEAD commit。
2. 读取目标文件 git blob sha。
3. 记录 filePath、line/column、byte range。
4. 如果选区在函数/方法内，记录 Tree-sitter symbol：
   - name
   - qualifiedName
   - symbol range
   - signature hash
5. 提取 selected snippet。
6. 生成 fingerprint：
   - 原文 sha256
   - 归一化 snippet sha256
   - 前后各 N 行上下文 hash
   - token k-gram minhash / simhash
7. 写入 sidecar DB。
```

归一化建议：

- 统一换行。
- 去除行尾空白。
- 连续空白折叠。
- 可选：去注释后再 hash，用于代码移动后的弱匹配。
- 保留 language 和 algorithmVersion，后续算法升级可兼容。

### 6.4 Anchor 恢复算法

恢复时按从强到弱的策略执行：

**策略 A：Exact commit/blob**

条件：

- 当前 commit 等于 `baseCommit`，或当前文件 blob sha 等于 `baseBlobSha`。

动作：

- 直接用原始 range 跳转。
- confidence = 1.0。

**策略 B：Git diff line mapping**

条件：

- 本地仍有 `baseCommit`。
- 当前 repo 有新 commit。
- 文件未删除或可通过 rename detection 找到。

动作：

- 使用 git diff 将旧行号映射到新行号。
- 在新行附近搜索 selected hash / normalized hash。
- 命中则 remap。

**策略 C：Path + snippet window**

条件：

- filePath 仍存在。

动作：

- 在原行号附近窗口，例如 ±200 行，查找 normalized snippet。
- 再用 prefix/suffix hash 校验。
- 适合函数内部小范围编辑。

**策略 D：Symbol remap**

条件：

- symbol 信息存在。
- 当前文件或 repo 可通过 Tree-sitter 建 symbol index。

动作：

- 优先在同文件找同 qualifiedName / same name / same kind。
- signature hash 匹配时高置信。
- 在 symbol range 内查找 snippet；找不到则按旧 range 在 symbol 内的相对偏移恢复。

**策略 E：Repo-wide snippet / symbol search**

条件：

- 文件被移动、重命名或拆分。

动作：

- 先用 git rename detection。
- 再全仓搜索 normalized snippet hash。
- 再用 symbol qualifiedName 全仓搜索。
- 多候选时返回 ambiguous，让 UI 展示候选列表。

### 6.5 置信度计算

建议分数：

| 信号 | 分值 |
|---|---:|
| commit/blob 完全匹配 | 100 |
| filePath 完全匹配 | 20 |
| git rename 命中 | 18 |
| qualifiedName 匹配 | 25 |
| signatureHash 匹配 | 20 |
| selectedTextSha256 匹配 | 30 |
| normalizedSnippetSha256 匹配 | 24 |
| prefix/suffix 均匹配 | 16 |
| 行号映射距离小于 20 行 | 8 |
| simhash/minhash 高相似 | 8 |
| 多候选相似分接近 | -20 |

阈值：

- `>= 85`：直接跳转，标记 `REMAPPED`。
- `60-84`：展示候选并提示“位置可能已变化”。
- `< 60`：标记 `STALE`，不自动跳转。

### 6.6 Anchor URI

Markdown 笔记中只存稳定引用：

```markdown
[相关代码](pocketvibe://anchor/anc_01HX...)
```

App 展示时解析 `anchorId`，调用 resolver。这样笔记正文不依赖脆弱路径和行号，也方便未来同步。

## 7. AI Chat 与 Agent 架构

### 7.1 结论：Chat 是 P0，Agent 是受控编排层

PRD 已经把 Chat 浮层、上下文篮子、模型配置、token 估算、Chat 历史保存列为 P0。因此架构上不能把 Chat 当成一个 UI 面板补丁，而应该作为独立子系统。

Pocket Vibe MVP 的 Agent 定义应保持克制：

- 模型推理走云端模型 API，本地不做大模型推理。
- Agent runtime 在本机负责“上下文组织 + 工具调用 + 权限控制 + 结果落库”。
- MVP 默认只读源码，不允许 Agent 改代码、不允许自动提交、不做 PR。
- 工具能力围绕源码阅读：读文件、查符号、查引用、搜索、获取当前函数、生成笔记草稿、写入 App 私有笔记库。
- 所有工具调用必须可审计，涉及费用、隐私或长耗时任务时需要用户可见。

也就是说，MVP 不是 autonomous coding agent，而是“读码场景里的受控 AI 助手”。这样既符合产品定位，也能控制资源、费用和隐私风险。

### 7.2 推荐模块划分

```text
Reader UI
  - current file / function / selection
  - selection menu and Explain action
  - Chat half sheet / full screen
  - context chips

AgentCoordinator
  - chat session lifecycle
  - prompt assembly
  - context basket resolver
  - token budget and truncation
  - model provider routing
  - tool call dispatcher
  - streaming response state
  - citation extraction

Tool Gateway
  - read_file
  - get_current_symbol
  - search_text
  - find_definition
  - find_references
  - get_related_files
  - create_note_draft
  - save_ai_answer

Model Gateway
  - OpenAI-compatible chat completion
  - provider profile and base URL
  - API key lookup from platform secure storage
  - retry / timeout / cancellation
  - usage and cost estimate

Persistence
  - ChatSession
  - ChatMessage
  - ContextChip
  - ToolCallLog
  - ModelConfig
  - Note / Anchor
```

`AgentCoordinator` 可以先由后端 TypeScript/Go/Rust 服务实现，但接口应平台无关。后续 Android/鸿蒙可以复用同一套协议、DTO、工具名和状态机。

### 7.3 上下文篮子与 token 预算

上下文篮子是 Chat 与 Reader 的核心连接点。它不应该只是 UI chip，而应有稳定数据模型：

```kotlin
data class ContextChip(
    val chipId: String,
    val projectId: String,
    val type: ContextType, // FILE, SYMBOL, SELECTION, SEARCH_RESULT, REFERENCE_RESULT, CHAT_MESSAGE
    val filePath: String?,
    val range: SourceRange?,
    val symbolName: String?,
    val anchorId: String?,
    val tokenEstimate: Int,
    val pinned: Boolean,
    val createdFrom: String // reader, search, definition, references, note
)
```

发送前执行四步：

1. resolve：将 chip 解析为当前源码片段，失败时标记 stale，不静默丢失。
2. rank：当前选区 > 当前函数 > 用户 pinned chip > 最近跳转定义 > 搜索/引用候选。
3. trim：按 token budget 裁剪，优先保留用户显式选择内容和代码引用。
4. preview：展示 token / 费用粗估，超限时阻止发送或要求用户裁剪。

这样做可以避免 Chat 变成“看起来有上下文，实际把整仓库塞给模型”的不可控方案。

### 7.4 模型配置与 API key 边界

MVP 推荐模型层只做三件事：

- 支持 OpenAI-compatible base URL、model、API key。
- 支持 provider profile：OpenAI、DeepSeek、智谱等可通过同一抽象接入；GitHub Copilot 需要单独合规评估，不作为基础假设。
- API key 只存在本机安全存储，不进入账号同步。

模型请求必须具备：

- streaming response。
- cancel。
- retry。
- timeout。
- usage / token estimate。
- provider error 原样可读展示。
- no-key / invalid-key / network-offline 状态。

不要在 MVP 里引入复杂 Agent 框架。首发更需要清晰、可控、可调试的薄编排层，而不是重框架。

### 7.5 工具权限模型

MVP 工具默认分三档：

| 权限档 | 工具 | 默认策略 |
|---|---|---|
| Safe read | 读当前文件、读选区、读 symbol、搜索、查定义、查引用 | 可自动调用，但要在消息中可追溯 |
| App write | 保存 AI 回复为笔记、创建笔记草稿、添加代码批注、写 Chat 历史 | 用户点击保存或明确确认后执行 |
| Dangerous / out of scope | 改源码、执行 shell、安装依赖、commit、push、PR、运行测试 | MVP 禁止 |

后续如果引入“写设计文档 / 优化 PRD / 生成文档”等 Agent 任务，也应默认写入 App 私有草稿区或用户指定的文档区，不直接改源码仓库。

### 7.6 Chat 与 Reader 的交互状态

Chat 浮层需要进入架构状态机，而不是单纯 UI 开关：

- 半屏 Chat：保留当前代码上下文摘要，主 Reader 避让当前行。
- 全屏 Chat：保留当前文件路径、当前函数、上下文 chip 摘要，退出后恢复进入前阅读位置。
- 从 AI 回复引用跳转：默认复用已有文件卡片，写入阅读轨迹。
- 保存 AI 回复：不离开 Reader，保存成功给 snackbar / gutter 标记 / note chip。
- 失败重试：不得重复插入消息、重复扣上下文、重复创建笔记。

Reader 与 Chat 的共享状态包括：

```text
currentProject
currentFile
currentSelection
currentSymbol
readingTrail
contextBasket
chatSession
activeModelProfile
```

这些状态应在横竖屏切换、App 后台恢复、半屏/全屏切换时保持一致。

### 7.7 Agent 任务分级

MVP 可支持的 Agent 任务：

- 解释当前函数。
- 解释当前文件负责什么。
- 下一步读哪里。
- 查调用链并解释。
- 找相关文件。
- 生成笔记草稿。
- 将 AI 回复整理成 Markdown。

MVP 不支持的 Agent 任务：

- 修改源码。
- 自动运行命令。
- 自动安装依赖。
- 自动提交或创建 PR。
- 长时间后台 autonomous task。
- 访问用户未加入上下文的私有文件。

后续 P1/P2 可以增加自定义 Skill。Skill 本质建议是“prompt 模板 + 默认上下文规则 + 可用工具白名单”，不要一开始做 marketplace。

### 7.8 跨端复用边界

Chat/Agent 的跨端复用重点不是 UI，而是协议：

- `ContextChip` DTO。
- `ToolCall` schema。
- `ModelProfile` schema。
- `ChatSession` / `ChatMessage` schema。
- citation / anchor 引用格式。
- prompt assembly 的规则版本。
- token budget / truncation 策略。

Web/PWA MVP 可以先实现第一版，但必须避免把这些规则写死在 React/Vue/Svelte 组件或 CodeMirror 插件状态里。否则后续 Android、HarmonyOS 会重复踩同一套上下文和权限问题。

## 8. MVP 推荐落地路径

### Phase 0：Web/PWA 骨架与后端工作区

- TypeScript Web app / PWA 工程骨架。
- CodeMirror 6 只读 reader spike。
- 后端 repo workspace：公共 GitHub URL 校验、clone、清理、隔离。
- 后端 file tree API。
- 基础鉴权或匿名 workspace id。
- App shell cache、manifest、离线提示页。

验收底线：用户能粘贴公共 GitHub URL，并在 Web reader 中打开文件。

### Phase 1：Web 阅读闭环

- 文件树、最近文件、阅读位置。
- CodeMirror 6 高亮、行号、选区、折叠。
- Tree-sitter symbol outline / function range。
- 当前函数识别和 sticky symbol。
- ripgrep 搜索和搜索结果 preview。
- 大文件、二进制、依赖目录、构建产物过滤策略。

验收底线：即使 LSP 完全未就绪，用户仍能稳定读代码、搜索代码、定位函数。

### Phase 2：Web 语义导航闭环

- 后端 semantic-lite：Tree-sitter symbol graph + import resolver + ripgrep candidate ranking。
- 按语言逐步接入 LSP：JS/TS 优先，Go/Python 次之，Java 默认 semantic-lite。
- definition / references 候选列表。
- preview 后再打开，不直接打断主阅读位置。
- 阅读轨迹 back/forward。
- 结果 confidence 展示和失败降级。

验收底线：语义服务慢、失败或不准确时，UI 不误导用户，仍能回退到搜索和候选结果。

### Phase 3：Web AI Chat 与受控 Agent 闭环

- Chat panel / mobile bottom sheet。
- ContextChip 数据模型和上下文篮子。
- 当前文件、当前函数、选区、搜索结果、引用结果加入上下文。
- OpenAI-compatible model gateway。
- token / 费用粗估和超限裁剪。
- streaming response、cancel、retry、timeout。
- 只读 Tool Gateway：读文件、查 symbol、搜索、定义、引用、相关文件。
- ToolCallLog 与 ChatSession 持久化。
- AI 回复里的文件/代码引用提取为 anchor 候选。

验收底线：用户能围绕当前源码向 AI 提问；Chat 失败不影响 Reader；Agent 不改源码。

### Phase 4：Web 知识沉淀闭环

- Anchor DB。
- 保存 AI 回答为 Markdown 笔记。
- 代码批注。
- 从笔记跳回代码。
- Anchor resolver 与 confidence UI。
- Daily report 的本地统计版。

验收底线：保存笔记不打断阅读；anchor 失效时可解释；不修改源码文件。

### Phase 5：Android / HarmonyOS 原生化准备

- 稳定 Web MVP 的 API contract。
- 抽象 `ContextChip` / `ToolCall` / `ModelProfile` / `ChatSession` / `Anchor` schema。
- Android reader spike：Sora Editor 或 Custom View。
- HarmonyOS reader spike：ArkUI reader shell。
- 原生安全存储和本地阅读状态设计。
- 评估本地 Tree-sitter/ripgrep 下沉价值。
- 制定“Web 后端 core service -> 本地 pocket-core”的渐进迁移策略。

验收底线：Android/鸿蒙不是重做产品逻辑，而是复用 Web MVP 的协议、数据模型和后端能力。

### MVP 技术验收红线

以下红线用于保障 Web/PWA MVP 后续向 Android / HarmonyOS NEXT 迁移时不会变成重写工程：

- Tree-sitter parse、highlight chunk、fold range、symbol index 不能只存在于 Web UI 层。
- ripgrep-like 搜索和 ignore 规则处理必须进入后端 core service 或至少有平台无关 facade。
- Anchor 创建、fingerprint、resolver、confidence scoring 必须进入后端 core service；后续需要本地化时再下沉到 `pocket-core`。
- LSP JSON-RPC client、request timeout、fallback ranking 必须尽量平台无关；server launcher 可平台相关。
- ContextChip、ToolCall、ModelProfile、ChatSession、citation/anchor schema 不能只存在于 Web UI 层。
- Agent 工具权限、token budget、上下文裁剪规则必须有可版本化的 DTO 或策略层。
- 后端 API 不允许暴露 Web 前端组件私有状态，例如 CodeMirror 内部对象。
- UI 可以平台重写，但 repo、file、symbol、search result、anchor、note、chat 等数据模型必须复用。
- Web 数据库 schema 需要为后续 Android/HarmonyOS 迁移预留导出格式，不能只依赖浏览器 IndexedDB 私有形态。
- 新增核心能力时，必须先判断它属于 Web shell、backend core service、platform adapter 还是未来 local core。

### 移动端架构验收红线

以下红线用于后续 Android/鸿蒙原生化立项：

- 原生 Reader 不能直接复刻 Web DOM 结构，必须使用原生可虚拟化渲染模型。
- 原生端不得把 CodeMirror 的行号、selection id、DOM offset 作为持久引用。
- 本机 API key 必须进入系统安全存储，不得进入普通 SQLite、日志、crash report 或同步载荷。
- 后台索引必须可取消、可暂停、可降级，并响应低电量、高温、内存压力。
- 原生端必须支持阅读状态完整恢复：仓库、文件、滚动位置、折叠状态、选区、Chat sheet 状态。
- 原生端必须有大文件保护阈值，不能因单个文件导致 OOM 或主线程长时间阻塞。
- 原生端必须保留 Web MVP 的只读 Agent 权限边界，不能因为接入本地文件系统就默认开放写源码或 shell。
- 原生端首版只要复用后端语义服务即可，不得为了追求本地化一次性搬完整 LSP runtime。

## 9. 关键风险与缓解

| 风险 | 等级 | 缓解 |
|---|---|---|
| 后端仓库存储成本过高 | 高 | 限制 repo 体积、设置 workspace TTL、清理未活跃仓库、先只支持公共仓库 |
| 服务端 LSP 内存过高 | 高 | 单 workspace 限额、按需启动、空闲 kill、默认 semantic-lite、禁用全仓 diagnostics |
| Java JDT LS 太重 | 高 | MVP 默认 semantic-lite；JDT LS 不作为 P0 承诺 |
| JS/TS/Python 需要 Node/CPython runtime | 中 | 放在后端容器/worker 中，按语言懒加载；浏览器端不打包 runtime |
| 大文件滚动卡顿 | 高 | CodeMirror 虚拟化能力 + 大文件阈值 + 纯文本降级 + 后端切片读取 |
| 浏览器移动端手感不足 | 中 | P0 只要求核心链路可用；原生级手感放到 Android/鸿蒙阶段 |
| Anchor 跳错位置 | 中 | confidence 阈值、候选列表、低置信不自动跳转 |
| Chat 上下文过大或错误 | 高 | ContextChip resolve/rank/trim/preview 流程；发送前 token 预算；stale chip 可见 |
| Agent 权限越界 | 高 | MVP 工具白名单只读；App write 需确认；禁止改源码、shell、commit、push |
| 模型 API key 泄露或误同步 | 高 | 首发可优先走服务端托管模型配置；若支持自带 key，需加密存储、日志脱敏、不同步明文 |
| Chat 历史包含源码片段的隐私风险 | 高 | P0 只支持公共仓库；同步前做隐私说明；企业/私有仓库后续单独策略 |
| PWA 离线能力被误解 | 中 | UI 明确“仅缓存壳、草稿、最近状态”；完整离线放到原生版 |
| Android/鸿蒙适配返工 | 中 | Web MVP API contract 先行；reader/chat/note/anchor schema 平台无关 |
| 原生 Reader 坐标系统返工 | 高 | 从 Web MVP 起区分 SourceRange、VisualRange、Anchor，禁止持久化 UI 私有坐标 |
| 原生滚动和手势冲突 | 高 | 右边缘入口降级，选区/横向滚动/Chat sheet 分层命中测试，横屏承担重内容 |
| 原生端过早本地化 LSP | 高 | 先复用后端语义服务；只有明确离线价值和语言优先级后再下沉 runtime |
| core 边界虚化 | 高 | 建立 MVP 技术验收红线，禁止核心模型和算法依赖 CodeMirror 或 Web 前端私有状态 |
| HarmonyOS native bridge 后期踩坑 | 中 | Phase 5 做最小 ArkTS -> NAPI/FFI -> pocket-core spike，提前验证打包和序列化 |

## 10. 最终建议

Pocket Vibe 第一版应该把资源投入到五件事：

1. **Web/PWA 阅读闭环**：CodeMirror 6 reader、文件树、搜索、函数结构和阅读状态，先证明用户真的会读。
2. **后端 repo/index/semantic 服务**：GitHub public repo clone、Tree-sitter、ripgrep、semantic-lite 和按需 LSP，这是 Web 首发的能力底座。
3. **AI Chat + 受控 Agent 编排层**：把当前文件、函数、选区、搜索结果变成可控上下文，让用户能 Ask。
4. **Note / Anchor 知识沉淀**：让 AI 回复和用户理解可以保存、回跳、复习，这是 Save 闭环。
5. **平台无关 schema / API contract**：`ContextChip`、`ToolCall`、`Anchor`、`Note`、`ChatSession` 必须为后续 Android/鸿蒙复用。
6. **原生化验收门槛**：Web 数据跑通前不急着重写原生；Web 数据跑通后，原生端必须围绕离线、本地仓库、系统安全存储和高质量 reader 手感提供明确增量价值。

不要一开始追求“手机端完整桌面 IDE 语义能力”。更好的路线是：

```text
稳定阅读
  -> 快速结构理解
  -> 按需精确跳转
  -> 可控上下文提问
  -> 候选式引用查找
  -> 低成本知识沉淀
```

技术路线调整后，Web/PWA 是首发验证主栈；Android/鸿蒙是后续原生体验主栈。Web 版负责验证产品闭环和后端能力，原生版负责兑现移动端阅读手感、离线和本地能力。长期多端策略应是多 shell 共享 API contract、schema 和 Agent 协议，而不是幻想一套 UI 无损跑所有端。

## 11. 参考资料

- Tree-sitter 官方介绍与 C API 说明：https://tree-sitter.github.io/tree-sitter/
- Tree-sitter parser 使用文档：https://tree-sitter.github.io/tree-sitter/using-parsers/
- ripgrep：https://github.com/BurntSushi/ripgrep
- Language Server Protocol 官方页面：https://microsoft.github.io/language-server-protocol/
- LSP 3.17 specification：https://github.com/microsoft/language-server-protocol/blob/gh-pages/_specifications/lsp/3.17/specification.md
- CodeMirror：https://codemirror.net/
- Monaco Editor：https://microsoft.github.io/monaco-editor/
- MDN Progressive web apps：https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- MDN Service Worker API：https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- MDN File System API：https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
- Shiki：https://github.com/shikijs/shiki
- Sora Editor Android code editor：https://github.com/Rosemoe/sora-editor
- Runestone iOS code editor：https://github.com/simonbs/Runestone
- Android JNI tips：https://developer.android.com/training/articles/perf-jni
- Android RecyclerView 文档：https://developer.android.com/develop/ui/views/layout/recyclerview
- Android custom drawing 文档：https://developer.android.com/develop/ui/views/layout/custom-views/custom-drawing
- Android StaticLayout API：https://developer.android.com/reference/android/text/StaticLayout
- Android PrecomputedText API：https://developer.android.com/reference/android/text/PrecomputedText
- Android WorkManager 背景任务约束：https://developer.android.com/guide/background/persistent/getting-started/define-work
- Flutter Android C interop / dart:ffi：https://docs.flutter.dev/platform-integration/android/c-interop
- Flutter platform channels：https://docs.flutter.dev/platform-integration/platform-channels
- React Native Android Native Modules：https://reactnative.dev/docs/0.78/legacy/native-modules-android
- React Native C++ Turbo Native Modules：https://reactnative.dev/docs/0.77/the-new-architecture/pure-cxx-modules
- gopls 官方文档：https://go.dev/gopls/
- Eclipse JDT LS：https://github.com/eclipse-jdtls/eclipse.jdt.ls
- clangd：https://clangd.llvm.org/
- SourceKit-LSP：https://github.com/swiftlang/sourcekit-lsp
- TypeScript tsserver 官方说明：https://github.com/microsoft/TypeScript/wiki/Standalone-Server-%28tsserver%29
- TypeScript Language Server：https://github.com/typescript-language-server/typescript-language-server
- Pyright：https://github.com/microsoft/pyright
- Pyright 安装文档：https://github.com/microsoft/pyright/blob/main/docs/installation.md
