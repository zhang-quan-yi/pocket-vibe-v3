# Pocket Vibe Visual Language

版本：Visual Language v0.1  
日期：2026-05-21  
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

## 6. 反例清单

避免：

- 大面积渐变、装饰图形、营销页 hero。
- 把 Reader 做成终端皮肤或游戏化界面。
- 把 Chat 做成独立聊天产品，脱离源码上下文。
- 直接套后台系统组件库导致界面像 admin dashboard。
- 用颜色作为状态的唯一表达。
- 在移动端堆多层卡片和重阴影。
