# Pocket Vibe Visual Language

版本：Visual Language v0.2  
日期：2026-05-23  
适用范围：Pocket Vibe Web/PWA walking skeleton 与后续移动端 Reader-first UI。

## 1. 设计定位

Pocket Vibe 的视觉语言服务于一句产品判断：

```text
手机终于可以认真读代码了。
```

它不是桌面 IDE 的手机复刻，也不是 AI Chat 产品。它首先是移动端源码阅读器，其次才是带有 AI 上下文能力的阅读工作台。

核心气质：

- 安静：代码区长期可读，不用大面积装饰和强刺激动效。
- 精确：SourceRange、Anchor、ContextChip、ToolCallLog 都要清晰、可信。
- 紧凑：移动端优先，信息密度高但不拥挤。
- 有温度：Chat 和保存反馈可以更柔和，但不变成娱乐化界面。
- 诚实：indexing、offline、stale anchor、token limit 等状态必须明确表达。

## 2. 视觉原则

### 2.1 Reader is the canvas

Reader 是主画布。Search、Definition、Chat、Note 都是临时工具层，不应抢走代码的主导权。

视觉规则：

- Reader 使用低干扰背景和稳定 mono 排版。
- 高亮只用于 selection、anchor、bookmark、current line 等阅读相关状态。
- 工具入口可发现，但视觉重量低于代码。

### 2.2 Context is visible

AI 会看到什么，必须被看见。ContextChip 是 Pocket Vibe 的核心视觉识别。

视觉规则：

- Chip 要同时表达 kind、source、range/status。
- Chat、Save Answer、Notes 中复用同一种 chip 语言。
- 大上下文、stale、trimmed、missing 状态不能只靠颜色表达。

### 2.3 Panels are temporary

Chat、Search、Definition、Save Answer 是工具面板，不是主屏。

视觉规则：

- 面板使用 raised surface、轻边框和短动效。
- 不使用重卡片堆叠。
- 面板标题短，主操作清楚。

### 2.4 State is honest

工具状态要像工程工具一样可检查。

视觉规则：

- ToolCallLog 默认折叠或轻展示，但状态可见。
- Running、Saved、Failed、Offline、Token limit 使用稳定状态色。
- 状态文案直接说明发生了什么。

## 3. Token Direction

初始 token 方向：

```text
background       cool neutral, light-first
surface          white / near-white
surfaceRaised    slightly lifted tool surface
textPrimary      high contrast neutral
textSecondary    muted neutral
accent           teal for primary actions
context          blue for explicit AI context
anchor           amber for source anchors / saved references
danger           red for blocking errors
codeBackground   neutral dark, not terminal-green
selection        muted teal/blue highlight
```

圆角保持克制：常规 6px，较大容器 8px。按钮和 repeated item 不超过 8px。

动效保持短：

```text
fast   120ms
base   180ms
slow   240ms
```

动效用途限于 sheet/panel 进入、chip 状态变化、selection/anchor 高亮、save feedback。默认尊重 `prefers-reduced-motion`。

### 3.1 现代化方向：Quiet Core, Kinetic Tools

Pocket Vibe 可以更现代、更有动感，但动感主要发生在工具层和状态反馈中，不能打扰长期读码。

```text
Reader = quiet core
Tools  = kinetic assistant layer
```

规则：

- Reader 保持稳定、低闪烁、低装饰；不在代码行、滚动和选区上使用强动效。
- Sheet、Peek、ContextChip、ToolCallLog、Save feedback 可以使用短转场，让状态变化更清楚。
- Search result -> Preview、Definition -> Chat、Save Answer -> Gutter bookmark 这些链路可以用轻量连续动效表达“操作已接住”。
- Running 工具状态可用细微 progress / shimmer，但不能长期吸引视觉注意。
- Floating tools 可以比 Reader 更现代：更清晰的 elevation、更轻的边框、更顺的进入/退出。

建议动效语义：

| 场景 | 动效 | 时长 |
|---|---|---|
| Sheet / Peek 进入 | translateY + opacity | 180-240ms |
| ContextChip 添加/移除 | scale 0.98->1 + fade | 120-180ms |
| Chip stale / oversized | 状态色和文字切换，避免抖动 | 120ms |
| Save Answer 成功 | snackbar slide + gutter bookmark fade | 180-240ms |
| ToolCall running | 轻 progress，不影响阅读 | base loop, reduced-motion 下关闭 |

详细组件级 Motion 规格见 `POCKET_VIBE_MOTION.md`。

## 4. Product Components

最定义 Pocket Vibe 气质的组件不是通用 Button，而是：

- CodeLine
- ContextChip
- SourceAnchorBadge
- SearchResultItem
- DefinitionPeek
- ChatHalfSheet
- ToolCallLog
- SaveAnswerTray
- GutterBookmark
- ReadingTrailCard

这些组件要优先建立稳定视觉语言，再扩展通用组件库。

## 5. Reader 和 Chat 的关系

Reader 与 Chat 可以有不同角色感：

```text
Reader = quiet source surface
Chat   = raised assistant work surface
```

但它们必须共享同一套 color、type、space、radius、motion token。差异来自层级和用途，不来自完全不同的审美。

ContextChip 和 SourceAnchor 是两者之间的视觉桥梁。

## 6. 样式库策略

Pocket Vibe 的样式层应优先服务现有产品语言，而不是套用外部主题。推荐方案：

```text
React + Base UI primitives
+ Pocket Vibe owned tokens
+ Pocket Vibe product components
+ selective reference from Base UI ecosystem
```

决策：

- 使用 Base UI 作为行为和可访问性 primitive，尤其是 Dialog、Popover、Menu、Tabs、Toast、Select、Field 等复杂交互。
- 样式由 Pocket Vibe 自己维护，使用本文档中的 token、radius、motion 和状态语言。
- `CodeLine`、`ContextChip`、`SourceAnchorBadge`、`ToolCallLog`、`SaveAnswerTray` 等产品组件必须自建，不能直接由通用样式库决定结构和视觉。
- `baseui-cn`、`coss ui`、`Kumo` 可以作为组件结构和交互参考；不直接全量套用主题。
- 暂不把 Tailwind、shadcn registry 或完整设计系统生成器作为 MVP 前置依赖；只有在具体切片需要时选择性引入。

外部参考优先级：

| 来源 | 用途 |
|---|---|
| Base UI | Headless behavior、a11y、focus management |
| baseui-cn | Base UI-first shadcn-style 组件封装参考 |
| coss ui | 现代 SaaS 密度、CSS variables、组合方式参考 |
| Kumo | 工程感、状态感、克制现代化参考 |
| ReUI / basecn | 复杂组件 pattern 参考，不作为主视觉 |

## 7. 反例清单

避免：

- 大面积渐变、装饰图形、营销页 hero。
- 把 Reader 做成终端皮肤或游戏化界面。
- 把 Chat 做成独立聊天产品，脱离源码上下文。
- 直接套后台系统组件库导致界面像 admin dashboard。
- 用颜色作为状态的唯一表达。
- 在移动端堆多层卡片和重阴影。
- 把现代化理解成全局玻璃拟态、强弹性动画或大面积品牌插画。
- 让动效改变代码阅读位置、遮挡 Send / Save / Later 等主操作。
