# Pocket Vibe Motion

版本：Motion v0.1  
日期：2026-05-23  
适用范围：Pocket Vibe Web/PWA walking skeleton、后续移动端 Reader-first UI、React + Base UI 组件实现。

## 1. Motion 定位

Pocket Vibe 的动效不是装饰，也不是把读码界面做成炫技产品。它服务三件事：

1. 让用户知道操作已经被接住。
2. 让 Preview、Ask、Save、Jump 之间的因果关系更连续。
3. 让 indexing、running、stale、token limit 等状态诚实、可检查。

核心方向：

```text
Quiet Core, Kinetic Tools

Reader = quiet core
Tools  = kinetic assistant layer
```

Reader 是稳定的阅读画布；Search、Definition、Context Basket、Chat、Save Answer、ToolCallLog 是更有动感的工具层。

## 2. Motion 原则

### 2.1 Reader stability first

Reader 中的代码位置、行高、横向滚动和选区不能因为动效产生跳动。代码行、行号、gutter、selection、anchor 高亮只允许短淡入、状态色过渡和一次性反馈。

禁止：

- 代码行进入时逐行飞入。
- 滚动过程中额外 parallax。
- selection / current line 使用持续闪烁。
- 动效改变阅读位置或遮挡代码主内容。

### 2.2 Motion explains causality

动效要解释“从哪来、到哪去、为什么变了”。

示例：

- 点击搜索结果后，Preview sheet 从结果列表上方进入，表达“这是同一条结果的预览”。
- `Explain definition` 后，definition chip 轻量进入 Context Basket，随后 Chat 打开。
- `Save Answer` 后，save tray 收起，snackbar 出现，gutter bookmark 淡入。

### 2.3 Honest state over delight

状态动效不能掩盖事实。`indexing`、`failed`、`stale`、`oversized`、`trimmed` 必须有文字或结构变化，不只靠颜色或动画。

### 2.4 Short, interruptible, reduced

动效要短、可打断，并尊重 `prefers-reduced-motion`。用户快速操作时，界面应直接进入最新状态，不排队播放历史动效。

## 3. Motion Tokens

### 3.1 Duration

```text
motion-instant   80ms   press / hover / tiny status response
motion-fast      120ms  chip status, button state, inline notice
motion-base      180ms  popover, menu, small panel
motion-slow      240ms  sheet, dialog, snackbar, save feedback
motion-settle    320ms  rare, only for large snap or first-run orientation
```

规则：

- 高频反馈优先 80-120ms。
- 工具层进入/退出优先 180-240ms。
- MVP 默认不使用超过 320ms 的动效。
- 循环动效只用于 running / streaming，且必须可关闭。

### 3.2 Easing

```text
motion-standard  cubic-bezier(0.2, 0, 0, 1)
motion-out       cubic-bezier(0.16, 1, 0.3, 1)
motion-in        cubic-bezier(0.4, 0, 1, 1)
motion-emphasis  cubic-bezier(0.2, 0, 0, 1)
```

使用建议：

- 进入：`motion-out`。
- 退出：`motion-in`。
- 状态切换：`motion-standard`。
- Sheet snap / save feedback：`motion-emphasis`。

### 3.3 Distance and scale

```text
motion-shift-xs  2px
motion-shift-sm  4px
motion-shift-md  8px
motion-shift-lg  16px
motion-shift-xl  24px

motion-scale-press  0.98
motion-scale-enter  0.98 -> 1
motion-scale-pop    0.96 -> 1
```

规则：

- 小组件只移动 2-8px。
- Sheet / snackbar 可移动 16-24px。
- 不使用夸张弹跳；Pocket Vibe 是工程读码工具，不是娱乐化界面。

### 3.4 CSS token draft

```css
:root {
  --motion-instant: 80ms;
  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 240ms;
  --motion-settle: 320ms;

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-emphasis: cubic-bezier(0.2, 0, 0, 1);

  --motion-shift-sm: 4px;
  --motion-shift-md: 8px;
  --motion-shift-lg: 16px;
  --motion-shift-xl: 24px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

## 4. Component Motion

### 4.1 Reader

允许：

- Selection highlight：120ms opacity / background-color。
- Current line：80-120ms background-color。
- Token press：80ms scale 0.98 或 background-color。
- Gutter bookmark：save 后 180ms fade + 4px translateY，最多一次。
- Anchor restore：目标行短暂高亮 240ms，随后稳定停留。

禁止：

- 打开文件时逐行 stagger。
- source code 横向或纵向自动漂移。
- 高亮循环闪烁。

### 4.2 ContextChip

ContextChip 是 Motion 的重点组件，因为它表达 AI 将看到什么。

| 状态变化 | 动效 | 时长 |
|---|---|---|
| suggested -> ready | kind badge / border 色过渡，轻 scale | 120ms |
| ready -> pinned | pin icon / label 区淡入 | 120ms |
| add chip | opacity 0->1, translateY 4px->0 | 120-180ms |
| remove chip | opacity 1->0, scale 1->0.98 | 120ms |
| oversized | status text 出现，border/status 色切换 | 120ms |
| trimmed | label 保持，status text 改为 trimmed | 120ms |
| stale | amber/red 状态 + Relink action 出现 | 120ms |

规则：

- chip 位置变化不能造成输入栏或 Send 按钮跳出屏幕。
- 大量 chip 更新时，只给新增/删除项动效，不对整行 chips 做全局重排动画。
- 状态变化必须有文字，不只靠颜色闪动。

### 4.3 Sheet / Peek / Dialog

用于 Search、Definition Peek、References、Chat、Save Answer、Annotation。

进入：

```text
opacity: 0 -> 1
transform: translateY(16px or 24px) -> translateY(0)
duration: 180-240ms
easing: motion-out
```

退出：

```text
opacity: 1 -> 0
transform: translateY(0) -> translateY(12px)
duration: 120-180ms
easing: motion-in
```

Backdrop：

- 只在 Dialog / full-screen confirm 中使用。
- opacity 不超过 0.18。
- Reader 仍应可感知为背景，不要被重遮罩吞掉。

Snap：

- Half -> Full 或 Peek -> Half 使用 180-240ms。
- snap 结束后主操作按钮位置必须可触达。
- 键盘态优先布局正确，动效可降级为直接布局切换。

### 4.4 Search and Preview

Search sheet：

- sheet 从底部进入。
- 结果行出现不做长 stagger；最多使用 80-120ms fade。
- 输入 query 后结果刷新使用 opacity 或 skeleton，不移动搜索框。

Search result -> Preview：

- 点击行后行本身给 80ms pressed state。
- Preview sheet 内容替换使用 120ms crossfade。
- `Back to results` 保留 query，列表返回时不重新播放完整进入动效。

### 4.5 Symbol Menu and Definition Peek

Symbol Menu：

- 以 token 为视觉来源，使用 120-180ms opacity + scale 0.96->1。
- 菜单不应遮住被点击 token 的所在行超过必要面积。
- indexing 时禁用项直接显示 disabled 状态，不用动效包装成“正在可用”。

Definition Peek：

- Peek 从底部或 token 附近进入，取决于屏幕空间。
- `Explain definition` 后，definition context chip 先进入 Context Basket，再进入 Chat。
- `Open` 才触发 Reader anchor restore，不要在 Explain 时移动 Reader。

### 4.6 Chat / Agent Surface

Chat 打开：

- 半屏或全屏 Chat 使用 180-240ms translateY / opacity。
- Context Basket 固定在顶部，chips 可以轻入场。
- 输入框不自动 focus，避免键盘突然压缩 Reader。

Streaming response：

- 文本流式出现即可，不额外逐词动效。
- ToolCallLog running 使用轻 progress bar 或 status pulse。
- pulse 仅作用于状态点或 progress，不作用于整张卡片。

Mode tabs：

- Ask / Plan / Agentic Reading 切换使用 120ms underline / background transition。
- 切换不清空 draft，不移动输入栏。

### 4.7 ToolCallLog

ToolCallLog 要像工程工具一样可检查。

| 状态 | Motion |
|---|---|
| queued | status pill fade in |
| running | subtle progress / status pulse |
| completed | progress stop, status color transition |
| failed | error row appears with text, no shake |
| cancelled | status text transition |

禁止：

- 整个 ToolCallLog 卡片持续闪烁。
- 使用强烈 shake 表达失败。
- 隐藏失败细节只显示动画。

### 4.8 Save Answer

保存链路是 Motion 的关键验收路径：

```text
Tap Save Answer
  -> button pressed
  -> tray action enters saving state
  -> tray closes or returns to Chat
  -> snackbar appears
  -> gutter bookmark fades in
  -> Reader position remains stable
```

规格：

- Saving button：80ms pressed + spinner/progress。
- Snackbar：240ms translateY 16px->0 + opacity。
- Bookmark：180ms fade + translateY 4px->0。
- Source chip：保存后的 `saved` / `anchor` 状态 120ms 过渡。

Undo：

- snackbar 内 Undo 点击后，bookmark 120ms fade out。
- Reader 不跳转。

### 4.9 Navigation and Jump

Preview before jump 是产品规则，Motion 必须强化这个规则。

- Preview：工具层进入，Reader 不动。
- Open / Jump：Reader 才滚动到 anchor。
- Jump 后目标行高亮 240ms，随后保持普通 current line / anchor 状态。
- Reading Trail 写入成功可以用小型 toast 或 trail chip 轻入场。

## 5. Reduced Motion

`prefers-reduced-motion: reduce` 下：

- 所有非必要 transition 缩短到 1ms。
- 关闭 shimmer、pulse、loop progress。
- Sheet / Dialog 直接显示最终位置。
- 保存、失败、stale、token limit 仍必须用文字和结构表达。
- Reader anchor restore 可以保留静态高亮，不使用滚动动画。

## 6. Performance Rules

移动端优先，动效只使用：

- `transform`
- `opacity`
- `background-color`
- `border-color`

谨慎使用：

- `box-shadow` 过渡。
- height/width 动画。
- 大面积 backdrop blur。
- filter。

禁止在 MVP 中使用：

- 全屏持续 canvas 动效。
- 大面积粒子、光斑、模糊渐变背景。
- 对代码内容区域做 expensive blur / filter。

## 7. Implementation Guidance

第一阶段使用 CSS transition / keyframes 即可：

```text
React + Base UI
+ CSS tokens
+ data-state / data-status selectors
+ prefers-reduced-motion
```

Base UI 封装建议：

- 用 `data-state="open|closed"` 驱动 Dialog / Popover / Menu / Toast 动效。
- 用 `data-status` 驱动 ContextChip / ToolCallLog / StatusPill 状态。
- Base UI 负责 focus、keyboard、dismiss；Motion 只负责视觉进入、退出和状态反馈。

暂不引入 motion library。只有出现以下需求时再评估：

- sheet drag / snap 需要真实手势物理。
- shared layout transition 成为关键体验。
- 多组件 choreography 难以用 CSS 管理。

## 8. Motion Acceptance Checklist

1. 默认 Reader 中代码可见面积不因动效降低。
2. Search / Definition / References preview 不移动 Reader。
3. `Open` / `Jump` 才改变 Reader 位置。
4. ContextChip 添加、删除、pin、stale、trimmed 都有可见状态反馈。
5. Chat 打开不自动聚焦输入框。
6. 键盘态下 Send / Save / Later 不被遮挡。
7. Save Answer 后 snackbar 和 gutter bookmark 出现，Reader 位置不变。
8. ToolCallLog running 不抢夺阅读注意力。
9. Failed / stale / token limit 有文字说明，不只靠颜色或动画。
10. `prefers-reduced-motion` 下仍可完整完成 walking skeleton。
11. 360x780、390x844、430x932 和 844x390 横屏下无重叠。
12. 动效不会造成 layout shift、横向溢出或按钮文本截断。

## 9. 不做事项

MVP Motion 不做：

- 品牌级复杂动效系统。
- 全局页面大转场。
- Reader 内复杂逐行动画。
- 源码编辑器式 cursor / typing illusion。
- 强弹性动画和娱乐化反馈。
- 大面积玻璃拟态、blur、粒子、光斑。
- 依赖 motion library 作为隐藏前置条件。
