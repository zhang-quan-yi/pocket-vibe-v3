# Pocket Vibe v3 产品经理启动计划

版本：PM Kickoff v0.1  
日期：2026-05-17  
角色视角：产品经理  
阶段：正式开发前产品收敛

## 1. 产品目标

Pocket Vibe v3 第一阶段要验证一个明确命题：

**用户愿意在手机优先的场景里认真阅读开源项目源码，并能顺手完成理解、提问和沉淀。**

首发采用 Web/PWA 验证，不追求一次性完成 Android 原生、完整 IDE、私有仓库、Agent 改代码或完整 LSP。核心闭环是：

```text
Open public repo -> Read code -> Add context -> Ask / Agentic Reading -> Save Answer -> Jump back
```

产品验证重点不是“功能很多”，而是用户是否会重复使用这条链路。

## 2. MVP 第一阶段范围

### P0 必须完成

| 模块 | P0 能力 | 验收标准 |
|---|---|---|
| Repo Intake | 粘贴公共 GitHub URL，创建导入任务 | 合法公开仓库可进入项目；失败有明确原因 |
| Reader | 打开文件、只读代码、行号、高亮或纯文本降级 | 用户能稳定读代码，不因索引未完成被阻塞 |
| Search / Preview | 全文搜索、结果预览、Open 后跳转 | Preview 不改变主阅读位置 |
| Context Basket | selection / file / symbol / definition / search result chips | 发送前用户知道 AI 将看到什么 |
| Chat / Agentic Reading | 围绕当前上下文提问，支持可追踪读码任务 | Agent 可读文件、搜索、查 symbol/definition/references，不改源码 |
| Save Answer | 将 AI 回答保存为 SavedAnswer，关联 Context Basket chip 和 source anchor | 保存后仍停留在 Reader，并有 source anchor |
| Annotate Code | 对当前行、函数或选区添加短批注 | 批注保存后 Reader 位置不变，gutter bookmark 可见 |
| Study Note | 创建或追加整理型 NoteDocument | 可引用多个源码位置、AI 回答和批注 |
| Anchor / Jump back | 从 source chip 回到代码 | 高置信自动跳转；低置信展示候选 |
| Daily Report draft | 基于阅读行为生成统计型日报草稿 | P1，不作为 P0 保存闭环前置 |

### P1 可延后

- 更完整的 definition / references LSP 精度。
- 多模型 profile。
- 账号登录与同步。
- 分享读码包。
- Daily Report。
- 知识卡片。
- Android 原生壳。
- 本地已 clone 仓库。

### 明确不做

- 私有仓库。
- GitHub OAuth。
- 本地目录导入。
- Agent 直接改源码。
- shell / terminal。
- commit / branch / PR。
- 完整离线读大仓库。
- Android / HarmonyOS NEXT 原生交付。
- GMS / Firebase / FCM 硬依赖。

## 3. 核心用户故事

1. 作为源码学习者，我想粘贴一个公开 GitHub 仓库 URL 并打开源码，以便不用桌面 IDE 也能开始阅读。
2. 作为移动端读码用户，我想先预览搜索和定义结果，再决定是否跳转，以免丢失当前阅读位置。
3. 作为学习者，我想知道 AI 本次看到了哪些文件、函数或选区，以便信任它的回答。
4. 作为读码用户，我想让 Agent 根据当前函数追调用链、找下一步阅读文件，以便少走弯路。
5. 作为长期学习者，我想把解释保存成带 source anchor 的学习条目，并能从保存内容跳回代码，以便复习。
6. 作为碎片时间用户，我想在需要时把多个回答、批注和源码位置整理成学习笔记，而不是被迫维护完整知识库。

## 4. 首次用户路径

目标路径：

```text
Landing / Empty
  -> Paste public GitHub URL
  -> Clone / import progress
  -> Open recommended file or recent file
  -> Search symbol
  -> Preview definition
  -> Explain definition
  -> Save Answer
  -> Stay in Reader
```

首次体验验收：

- 5 秒内能找到导入入口。
- 1 分钟内从公开 URL 进入 Reader。
- 进入 Reader 后 5 秒内能找到 Search。
- Search / Definition 默认 preview。
- 从 Definition Peek 到 AI 解释不超过 4 次关键点击。
- Save Answer / Annotate 不离开 Reader。

## 5. Read -> Ask -> Save 验收清单

| 步骤 | 验收 |
|---|---|
| Read | 默认代码可见面积足够，长文件可滚动，长行可处理 |
| Add Context | Context chips 可见，可移除，可查看来源 |
| Ask | Chat 能发送当前上下文问题，token 超限前置提示 |
| Agentic Reading | ToolCallLog 可见，读码工具调用可追踪 |
| Save | 保存为 SavedAnswer，保留 source anchor |
| Annotate | 添加短批注，Reader 不跳走 |
| Jump back | 从 source chip 跳回代码；stale anchor 不乱跳 |

## 6. Context Basket 产品定义

Context Basket 是用户和 AI 之间的信任层。它必须回答：

```text
这次 AI 到底会看什么？
```

MVP 支持的 context：

- 当前选区。
- 当前文件。
- 当前函数 / 类 / 方法。
- Definition Peek 结果。
- Search Preview 结果。
- References 候选集合。
- Reading Trail。
- SavedAnswer / Annotation / NoteDocument。
- Code Map node。
- `#codebase` 检索意图。

产品规则：

- 隐式上下文也必须可见。
- `#codebase` 不是整仓库 prompt，而是检索意图。
- 大上下文发送前必须 review。
- stale / oversized / missing 状态必须显式。
- 用户 pin 的 chip 裁剪优先级最高。

## 7. Agentic Reading 产品定义

Agentic Reading 是 Pocket Vibe 的差异点，不是普通 Chat。

它应支持：

- Explain current symbol。
- Trace call chain。
- Find next files to read。
- Compare definition candidates。
- Build context basket。
- Create study note draft。
- Create daily report draft（P1）。
- Recover stale anchor。

权限边界：

- Safe read / Analysis 可自动执行。
- App write 需用户确认。
- Source write 和 Dangerous action MVP 禁止。

产品呈现：

- Agent 有 Plan / Running / Completed / Failed 状态。
- 工具调用默认折叠，但可展开查看。
- 回答必须尽量带文件、symbol、anchor 引用。
- 不确定性要明确标注。

## 8. 首批测试用户

| 用户 | 需求 | 招募渠道 |
|---|---|---|
| 开源源码学习者 | 想系统读懂 React/Vue/FastAPI/Gin 等项目 | 技术社区、GitHub Discussions、掘金、V2EX |
| 大学生 / 自学者 | 想用碎片时间理解项目结构 | 编程学习群、课程社群 |
| 工作工程师 | 想快速熟悉陌生仓库 | 团队内部、开源项目贡献者 |
| 移动端重度用户 | 愿意在手机上看代码 | Android/PWA 用户群 |

## 9. 冷启动读码包建议

首批不做泛宣传，做可跟读的源码学习包：

| 方向 | 示例主题 |
|---|---|
| React | 一次 setState / hooks 调用从哪里开始 |
| Vue | 响应式核心数据结构 |
| FastAPI | 请求如何进入路由 |
| Gin | middleware 和 route tree |
| Next.js | app router 基础路径 |
| 小型 TS 项目 | 适合首批端到端 demo |

每个读码包包含：

- public GitHub URL。
- 推荐入口文件。
- 推荐搜索关键词。
- 推荐提问 prompt。
- 笔记模板。
- 15 分钟阅读目标。

## 10. 关键指标

产品验证优先看行为，不看下载量：

- URL -> Reader 成功率。
- Time to first reader。
- 首次 Search 使用率。
- Definition/Search Preview 使用率。
- Ask 发送率。
- Save Answer 转化率。
- 24 小时回访率。
- 7 天内重复阅读天数。
- 每用户保存 SavedAnswer / Annotation / NoteDocument 数量。

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 用户不愿在手机上读代码 | 先用 PWA 验证，控制原生投入 |
| Agent 变成普通聊天 | 明确定义 Agentic Reading 和 ToolCallLog |
| 上下文不透明导致不信任 | Context Basket 显示发送内容 |
| 搜索/语义不准 | preview before jump，confidence 明示 |
| 保存动作打断阅读 | Save Answer / Annotate 是轻动作，不离开 Reader |
| 首批功能过大 | 严格限制 P0，不做私有仓库和改代码 |

## 12. 第一周产品工作

1. 确认 P0 范围和不做事项。
2. 产出 3 个官方读码包草案。
3. 定义 Read -> Ask -> Save demo 脚本。
4. 和前端确认 Context Basket 的最小 UI。
5. 和后端确认 `#codebase` 是检索意图。
6. 定义首批用户访谈问题。
7. 建立 MVP 验收 checklist。

## 13. 待决问题

1. 首批官方读码包选哪些仓库。
2. P0 是否必须有真实模型调用，还是可先 mock streaming。
3. API key 策略：用户自带、测试托管 key 或混合。
4. 首批测试用户数量目标。
5. PWA 是否需要登录前的匿名 workspace。
