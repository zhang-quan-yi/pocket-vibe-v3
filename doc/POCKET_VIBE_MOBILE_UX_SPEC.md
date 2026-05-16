# Pocket Vibe 移动端核心交互 UX 方案

版本：MVP UX v0.2  
日期：2026-05-15  
适用范围：Android 手机竖屏优先，横屏兼容；后续 HarmonyOS NEXT / 原生鸿蒙复用同一信息架构。  
输入来源：

- `POCKET_VIBE_MVP_PRD.md`
- `archive/2026-05-15-ux-refresh/docs/POCKET_VIBE_UX_OPTIMIZATION_SUMMARY.md`
- `archive/2026-05-15-ux-refresh/docs/POCKET_VIBE_PROTOTYPE_UX_REVIEW.md`

## 1. 设计判断

Pocket Vibe 的 MVP 先证明一件事：用户真的愿意在手机上认真读 5 分钟代码，并能顺手完成 `Jump / Ask / Save`。因此本版 UX 不追求 IDE 功能堆叠，而是优先压实读码、预览、AI 解释和轻量保存。

核心验收任务：

1. 用户在 Reader 中找到或搜索 `resolveModule`。
2. 先预览定义，不立刻跳走。
3. 在 Definition Peek 中点击 `Explain definition`。
4. 在 Chat 中看到解释，并保存为笔记。
5. 保存后仍停留在原代码上下文，看到成功反馈和 gutter bookmark。

这条链路应不超过 4 次关键点击，不丢阅读位置，不被 sheet、键盘或横屏裁切打断。

## 2. 设计原则

### 2.1 Reader first

默认状态下代码阅读区占主屏。路径栏、sticky 函数栏、搜索入口、折叠入口和 Chat FAB 可以存在，但不能把 Reader 变成工具面板的背景。

最低要求：

- 默认 Reader 中代码可见面积不低于 80%。
- 代码支持纵向滚动。
- 长行支持横向滚动或软换行。
- 字号至少提供可读默认值，后续可扩展为 13 / 15 / 17px 档。

### 2.2 Preview before jump

搜索、定义、引用都先进入 preview / peek。只有用户点击 `Open` / `Jump to source` 时，才改变主 Reader 位置并写入阅读轨迹。

### 2.3 少点、少挡、少迷路

高频动作要短：

- 搜索结果行点击直接进入 preview。
- Definition Peek 的主操作是 `Explain definition`。
- 保存笔记是轻动作，不跳完整 Notes 页面。

浮层要轻：

- Search 和 Definition 优先使用紧凑 peek。
- References 属于重内容，默认不做大半屏常驻。
- Chat 打开时必须保证当前选区或当前函数仍可见。

### 2.4 Honest degradation

LSP indexing、LSP failed、offline、token limit、anchor stale 都必须明确表达。不能把候选搜索包装成精准定义，不能在 anchor 失效时静默跳到低置信位置。

### 2.5 可触达与可访问

高频触控目标不低于 44px；搜索、Explain、Open、Save、Send 优先放在屏幕中下部或 sheet 主操作区。关键入口必须有可访问名称，状态表达不能只依赖颜色。

## 3. Reader 工作台

### 3.1 默认布局

竖屏从上到下：

1. Path bar：仓库短名、当前文件路径、文件卡片入口。
2. Sticky function bar：当前函数、行范围、函数长度、索引状态和低占用搜索入口。
3. Code reader：行号、可点击 token、语法高亮、真实滚动。
4. Visible tool handle：可点开工具轨，不依赖隐形右边缘手势。
5. Chat FAB：右下角，52px 左右。

Reader 必须支持：

- 纵向滚动长文件。
- 横向查看长行，或切换软换行。
- 点击 / 长按 token 触发符号动作。
- 折叠入口可发现，不只存在独立页面。
- Gutter bookmark 表示笔记或批注 anchor。

### 3.2 显性工具入口

旧设计中右边缘隐形手势风险高，容易和代码横滑、系统返回冲突。本版规则：

- 搜索入口在 sticky bar 常驻为小按钮。
- 工具轨有可见 handle，点击打开。
- 右侧边缘滑动只作为增强手势，不能是唯一入口。
- 代码区横向滚动优先级高于工具唤出。

Tool Rail 按钮：

- Search
- Cards
- Trail

按钮至少 44px，带 label / tooltip / aria name。不要使用 `S / C / T` 这种只有设计者懂的缩写。

## 4. 搜索与预览

### 4.1 Search Sheet

搜索面板从底部出现，但默认不超过半屏。进入搜索后不强制自动聚焦键盘，避免一打开就压缩 Reader；用户点击输入框后才弹键盘。

结果行内容：

- 文件路径。
- 行号。
- 命中片段。
- 可选 token / 类型提示。

### 4.2 结果行为

搜索结果行点击直接进入 `Search Preview`。不再需要 `Preview selected result` 按钮。

Preview 必须提供：

- `Back to results`
- `Explain`
- `Open`

规则：

- `Back to results` 返回列表并保留 query。
- `Explain` 将该结果作为上下文进入 Chat。
- `Open` 才改变主 Reader 并写入轨迹。

## 5. 符号点击与 Definition Peek

### 5.1 Token 触发

Reader 内真实代码 token 可点击或长按。触发后：

- token 本身有命中反馈。
- 菜单靠近 token，但要避让上下文。
- 点击空白处或关闭按钮收起。
- LSP indexing 时禁用精准定义 / 引用，并提供 candidate search。

### 5.2 Symbol Menu

菜单动作收敛为：

- `Go to definition`
- `Find references`
- `Explain symbol`

`Add context` 不作为主按钮展示，避免用户理解产品内部概念。

### 5.3 Definition Peek

即使只有一个定义，也先 peek。Peek 内容：

- 目标文件路径、行号、symbol 名称。
- 目标代码 snippet。
- 来源提示，例如 `from core.ts L132`。
- 主操作 `Explain definition`。
- 次操作 `Open`。
- 可选更多操作 `Add to chat context`。

`Explain definition` 进入 Chat 并带入 definition context chip。`Open` 才提交导航。

## 6. Chat 与键盘态

### 6.1 Chat Half Sheet

Chat 默认半屏，目标是短问答，不是完整聊天页。它必须保留当前代码上下文。

内容结构：

1. Sheet handle 和关闭按钮。
2. Context chips。
3. 快捷问题：Explain、Next file、Call chain。
4. AI response。
5. `textarea` 输入框和 Send。
6. token / cost 状态。
7. 仅当已有 AI response 时出现 `Save note`。

### 6.2 Keyboard-aware 规则

Chat 和 Save Note 都必须把键盘态当成一等状态：

- 不自动聚焦输入框。
- 键盘弹起后输入栏贴键盘上方。
- Send / Save / Later 保持可见。
- 小屏下保留紧凑的当前代码上下文摘要，不承诺完整阅读代码。
- 需要验证 360x780、390x844、430x932 三档。

### 6.3 Token limit

token 超限时：

- Send 禁用。
- 超限 chip 明确标记。
- 提供 Trim context。
- 不丢失用户输入。

## 7. 保存笔记与 Anchor

### 7.1 Save Note 是轻动作

保存 AI 回答不离开 Reader / Chat。保存后：

- Save tray 收起或回到 Chat。
- 出现 snackbar：`Saved to notes`。
- snackbar 提供 `View` / `Undo`。
- 对应代码 gutter 出现 bookmark。
- 当前代码位置和 Chat context 不改变。

### 7.2 Save Note Tray

Save tray 内容：

- 标题输入。
- Source chip。
- AI 摘要预览。
- `Later`
- `Save`

如果没有 AI response，隐藏或禁用保存入口。

### 7.3 Anchor 失效

anchor 失效时：

- 笔记仍可打开。
- source chip 进入 stale 状态。
- 提供 Find candidates / Relink manually。
- 不自动跳到低置信位置。

## 8. 横屏

横屏必须使用真实横向容器，不得把 844x390 内容塞进 390px 竖屏 phone frame。

布局：

- 左侧 58%：代码 Reader。
- 右侧 42%：Chat / Search / Definition / References 活动面板。
- 两侧内容都必须完整可见。
- 横屏键盘态单独处理，因为高度只有约 390px。

横竖屏切换后保留：

- 当前文件。
- 滚动位置。
- 当前函数。
- Chat / peek 状态。
- context chips。

## 9. A11y 与阅读舒适度

最低要求：

- 高频按钮具备可访问名称。
- 关键状态有文字或图标冗余，不只靠颜色。
- 代码字号不低于可读默认值。
- 支持暗黑、高对比、暖光主题作为后续阅读偏好。
- Sheet 有关闭或返回。
- `input` / `textarea` 使用语义化控件。

## 10. MVP 交互验收清单

1. 首次用户 5 秒内能找到导入仓库入口。
2. 进入 Reader 后 5 秒内能找到搜索入口。
3. 默认 Reader 中代码可见面积不低于 80%。
4. 用户能纵向滚动代码，并横向查看长行。
5. 用户能从 Reader 直接点击 `resolveModule` 触发 Symbol Menu。
6. 搜索结果行点击直接 preview。
7. Preview 不改变主 Reader；只有 `Open` 才提交导航。
8. Definition Peek 中主操作是 `Explain definition`。
9. 从找定义到让 AI 解释不超过 4 次关键点击。
10. Chat 打开后当前函数或选区仍可见。
11. 键盘弹起后 Send / Save / Later 不被遮挡。
12. token 超限时 Send 不可用，用户知道如何裁剪。
13. 保存笔记后用户仍停留在阅读场景。
14. 保存成功有 snackbar 和 gutter bookmark。
15. 从笔记 source chip 能跳回代码；source 失效时不乱跳。
16. 离线时已 clone 代码、搜索和笔记可用，Chat send 禁用。
17. LSP indexing / failed 时不展示虚假的精准定义。
18. 横屏状态能同时看到左侧代码和右侧活动面板。
19. Tool Rail 不使用 `S / C / T`，按钮至少 44px。
20. 关键入口具备可访问名称。

## 11. 原型连线优先级

必须跑通：

1. Empty -> Paste URL -> Clone -> Reader。
2. Reader -> Search -> result row -> Search Preview -> Back / Explain / Open。
3. Reader -> token -> Symbol Menu -> Definition Peek -> Explain definition -> Chat。
4. Chat -> Save note -> Saved feedback -> Reader 原位置。
5. Reader -> Tool Rail -> Cards / Trail。
6. Reader -> Landscape -> Reader。
7. Notes -> Note Detail -> Source chip -> Reader。

本阶段不做：

- 最终品牌视觉。
- 完整动效系统。
- 真实 LSP、搜索、AI API。
- Figma 重做。
