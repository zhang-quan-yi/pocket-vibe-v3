# Pocket Vibe UX Review 精简总结

日期：2026-05-15  
来源：`POCKET_VIBE_PROTOTYPE_UX_REVIEW.md`

## 1. 核心结论

Pocket Vibe 的方向是对的：它不是把 IDE 缩小到手机里，而是围绕“移动端认真读代码”做轻量阅读、预览跳转、AI 解释和知识沉淀。

但当前原型更像“流程演示”，还不像真实高压场景下顺手的工具。主要问题不是页面不够多，而是核心读码链路还不够短、不够稳、不够符合手机操作习惯。

一句话概括：信息架构成立，产品原则成立，但 Reader、跳转、搜索、Chat、保存笔记这些高频动作还需要重新压实。

## 2. 应保留的设计原则

- **Reader first**：默认状态让代码占主屏，这是产品差异化的底座。
- **Preview before jump**：搜索和定义先预览，用户确认后才跳转，能减少迷路。
- **Honest degradation**：离线、索引中、token 超限、anchor 失效都明确降级，不假装可用。
- **Knowledge loop**：代码上下文进入 Chat，AI 回答再沉淀为带 source anchor 的笔记，闭环清楚。

## 3. 关键问题

### 3.1 Reader 还不是真正的代码阅读器

当前代码区偏静态，长行、滚动、字号、软换行、当前函数定位等基础能力没有被真实打磨。对这个产品来说，Reader 不是展示区，而是核心生产力界面。

### 3.2 核心链路太绕

用户想完成的是“找到符号 -> 看定义 -> 让 AI 解释”。现在 Symbol Menu 没有从真实 token 点击触发，搜索结果还要额外点 `Preview selected result`，Definition Peek 里 `Ask AI` 和 `Add context` 语义也重叠。

### 3.3 底部 sheet 抢占阅读空间

Search、Definition、References、Chat 打开后，代码可见区明显下降。尤其 References 和 Search 占用过重，会削弱 Reader first。

### 3.4 工具入口不够好找，也不够好点

右侧 Tool Rail 使用 `S / C / T`，语义弱；按钮只有 36×36，低于移动端舒适触控目标。搜索是高频动作，不应藏在低可发现入口里。

### 3.5 手势、键盘、横屏风险都偏高

右侧边缘手势会和代码横滑、系统返回冲突；Chat / Save Note 还没有验证真实键盘态；横屏原型被竖屏容器裁切，无法有效评审。

### 3.6 保存笔记会打断心流

保存 AI 回答后直接跳 Notes List，会让用户离开当前代码位置。对读码产品来说，保存应是轻动作，而不是导航跳转。

### 3.7 A11y 和长时间阅读支持不足

代码字号偏小，语义化按钮不足，状态表达过度依赖颜色；暗黑、高对比、字号档、软换行等阅读设置需要前置。

## 4. 优先优化方向

### P0：先把核心读码闭环做顺

1. 把 Reader 做成真实可读：支持纵向滚动、横向滚动或软换行、字号调整、当前函数定位、折叠入口。
2. 补真实 token 点击/长按：从 Reader 直接触发 Symbol Menu 或 Definition Peek。
3. 搜索结果行点击直接 preview，取消多余的 `Preview selected result`。
4. Definition Peek 主操作改成 `Explain definition`，次操作保留 `Open`。
5. 保存笔记后留在 Reader / Chat 原位置，只给 snackbar、bookmark 或轻反馈。
6. Chat / Save Note 做 keyboard-aware 布局，保证输入、发送、保存不被键盘挡住。
7. 修正横屏 frame，让右侧面板真实可见。

### P1：降低移动端操作成本

1. Tool Rail 图标化，触控目标至少 44×44。
2. 搜索入口前置到 sticky bar 或底部可达区。
3. 右侧边缘手势不要作为唯一入口，增加可见 handle。
4. Search / Definition / Chat 支持 snap points：小 peek、半屏、全屏。
5. 补齐 loading、empty、failed、retry、too many results 等边界状态。
6. 增加 Dark、High Contrast、Warm Light、字号、行高、软换行设置。

## 5. 我的看法

我认为 Pocket Vibe 的 MVP 不应该先追求“功能完整得像 IDE”，而应该先证明一个更锋利的命题：用户真的愿意在手机上连续读 5 分钟代码，并能顺手问 AI、保存理解、回到原位。

因此优先级要更狠一点：先压缩 `Jump / Ask / Save` 三个动作的路径，再补页面。只要“点一个符号 -> 预览定义 -> Explain -> 保存 -> 回到原代码”这条链路顺，产品就会有说服力；反过来，如果 Reader 本身读不舒服，再多 AI 和笔记能力都会显得像外挂。

下一轮原型最适合用一个任务验收：在手机宽度下找到 `resolveModule`，预览定义，让 AI 解释，并保存为笔记。全程不超过 4 次关键点击，不丢当前代码位置，不被键盘或弹层挡住。这个任务如果跑顺，Pocket Vibe 才真正从“有想法”进入“可用”。
