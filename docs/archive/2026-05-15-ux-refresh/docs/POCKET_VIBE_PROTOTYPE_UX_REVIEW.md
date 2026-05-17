# Pocket Vibe Prototype UX Review

版本：2026-05-15  
对象：`prototype/pocket-vibe-wireframe` coded wireframe prototype  
评审方式：代码状态机走查 + 浏览器渲染验证 + 移动端人体工学/A11y/手势走查 + 目标用户视角 Cognitive Walkthrough

## 0. 评审依据

本次更新整合了三类反馈：

- 原有 `POCKET_VIBE_PROTOTYPE_UX_REVIEW.md` 中的完整评审内容。
- 源码走查反馈：`index.html`、`app.js`、`styles.css` 中的状态机、组件结构、CSS 布局和可达性问题。
- 浏览器实测反馈：使用真实浏览器渲染本地 `index.html`，并对 Reader、Tool Rail、Search、Search Preview、Symbol Menu、Definition Peek、References、Chat、Save Note、Reading Trail、Landscape 等核心状态截图与量化检查。
- 人体工程学反馈：围绕右手单持大屏手机的拇指热区、右侧边缘手势冲突、软键盘遮挡、代码阅读视觉疲劳和无障碍语义进行专项走查。

相关文件：

- 原型入口：`prototype/pocket-vibe-wireframe/index.html`
- 交互状态：`prototype/pocket-vibe-wireframe/app.js`
- 视觉布局：`prototype/pocket-vibe-wireframe/styles.css`
- 本轮浏览器截图：`.codex-review/`
- 历史浏览器截图：`browser-review-shots/`
- 更完整链路截图：`browser-review-shots-live/`

说明：本轮先按 Browser 插件流程尝试连接 Codex in-app browser，但初始化连续超时；随后改用本机 Edge / Chromium 渲染同一个本地页面。结论基于真实浏览器渲染截图、DOM 尺寸数据和源码结构，不只基于静态阅读。

## 1. 总体结论

Pocket Vibe 的产品方向是成立的：它不是把桌面 IDE 缩小塞进手机，而是围绕“移动端认真读代码”建立了轻量阅读、预览跳转、AI 上下文和知识沉淀的闭环。

最值得保留的原则：

- Reader first：默认状态下代码区域占主屏，Reader 是第一现场。
- Preview before jump：搜索和 definition 都先 peek，只有 `Open` / `Jump` 才提交导航。
- Honest degradation：离线、LSP indexing、token limit、anchor stale 没有假装能力可用。
- Knowledge loop：代码上下文可以进入 Chat，AI 回答可以沉淀为带 source anchor 的笔记。

但现在原型还偏“演示流程”，不是“急着干活时真的顺手”。主要风险是：

- 代码阅读基础能力不够硬：字号偏小，`code-area` 是静态画布，长行、滚动、换行、字号设置都没有真实打磨。
- 符号操作链路不够真实：`Symbol Action Menu` 是独立状态，Reader 内从代码 token 到菜单的真实点按/长按体验没有被完整验证。
- 底部 sheet 抢视线：Search、Definition、Chat 打开后，代码可见区明显下降，和 Reader first 有张力。
- 工具入口发现和触达成本高：右侧工具轨使用 `S / C / T`，默认 Reader 里搜索入口不够明显；浏览器实测工具按钮只有 36×36，低于移动端舒适触控目标。
- 手势冲突风险高：代码区域天然需要上下滚动和横向浏览长行，右边缘唤出 Tool Rail / Reading Trail 的隐形手势容易和代码横滑、系统返回手势冲突。
- 键盘态风险未验证：Chat / Save Note sheet 视觉上可用，但输入框触发软键盘后，Send、Save、底部动作区很可能被遮挡。
- 横屏状态当前不可有效评审：`Landscape Reader + Chat` 在固定 390px 手机壳内被裁切，右侧面板实际不可见。
- 多处轻动作会打断心流：保存笔记直接跳 Notes List，预览缺返回列表，部分按钮没有后续状态或反馈。

一句话判断：信息架构对，核心原则对，但移动端“少点、少挡、少迷路、少伸手”的手感还需要压一轮。

## 2. 急躁后端用户任务流

场景：我在通勤路上，只剩几分钟，需要在手机上找到 `resolveModule` 的定义，并让 AI 解释它。我不会欣赏花活，我只想快。

### 2.1 如果符号已经在当前屏幕里

理想操作路径：

1. 在 Reader 中点 `resolveModule`。
2. 弹出 Symbol Action Menu。
3. 点 `Go to definition`。
4. 出现 Definition Peek。
5. 点 `Ask AI` 或更理想的 `Explain definition`。

这个路径大约 3 次关键点击：点符号、点 Go to definition、点 Ask AI。可以接受。

问题是当前原型没有证明第 1 步真实可用。`Symbol Action Menu` 在 `app.js` 里是一个单独 screen state，不是从 Reader 里的代码 token 点按后自然触发。因此现在能评估菜单视觉和流程，但不能评估真实误触率、命中区域、长按延迟、菜单避让。

### 2.2 如果符号不在当前屏幕里

当前可推演路径：

1. 找工具入口。
2. 打开 Right Tool Rail。
3. 点 `S`。
4. 在 Search Sheet 看到结果。
5. 点 `Preview selected result`。
6. 在 Search Preview 中判断。
7. 再点 `Add context`、`Open` 或进入 Chat。

这条路径很快变成 6 到 7 步。急的时候我会觉得多余，尤其是搜索结果本身不能直接点开 preview，还要额外点一个底部按钮。对于移动端读码，高频路径应该被压缩成“搜索/跳转统一命令”：输入符号，结果行直接 preview，peek 上直接 `Explain` / `Open`。

### 2.3 我会立刻吐槽的点

- `Ask AI` 和 `Add context` 并排出现时含义重叠。作为用户我只想“解释这个定义”，不想理解产品内部的 context 语义。
- Symbol Menu 盖住代码中段。移动端点代码本来就精细，弹层挡住刚才的上下文会让人烦。
- Search 结果没有直接 preview，必须按 `Preview selected result`，这是机械步骤。
- Chat 面板底部按钮在截图里已经贴近裁切区，真实小屏加键盘后风险更高。
- 保存笔记后直接跳 Notes List，这会打断我正在读的代码。

### 2.4 人体工程学四问结论

围绕本轮提出的四个专项问题，结论如下：

- 热区分析：Chat FAB 位于右下角，52×52，是目前最符合右手单持热区的高频入口；Tool Rail 和 Symbol / Selection 操作偏中上，且 Tool Rail 按钮实测只有 36×36，不适合作为搜索这种高频动作的唯一入口。
- 手势冲突：`Right edge -> Tool Rail` 和 Reading Trail 右边缘手势是高风险设计。代码阅读需要纵向滚动和横向浏览长行，右侧边缘又接近 Android / HarmonyOS 系统返回手势，三者会天然争抢同一块操作空间。
- 空间舒适度：Chat half sheet 不弹键盘时还能保留有限代码上下文；Search、References、Save Note 等 sheet 打开后，阅读空间明显下降。软键盘弹起后的状态目前没有真实验证，是必须补的交互测试。
- 无障碍与视觉疲劳：代码字号偏小、语义按钮不足、暗黑/高对比/字号调整/软换行缺失。对代码阅读产品来说，这些是基础可用性，不是后期美化项。

## 3. 源码走查发现

### 3.1 状态机覆盖面不错，但部分状态不可达

`app.js` 已定义 F-01 到 F-26，覆盖 repo import、reader、folded、tool rail、search、definition、references、selection、chat、notes、offline、indexing、stale、landscape 等状态。这个覆盖面很完整。

但存在几个“定义了，主流程不顺”的点：

- F-06 `Reader Folded` 有 screen，但主路径和 Reader UI 没有显性入口。
- F-10 `Symbol Action Menu` 是独立 screen，缺少 Reader 内 token 点按触发的真实交互。
- F-12 `References Panel` 有状态，但高频路径里没有被真正走通。
- F-25 `Anchor Stale State` 有 `Find candidates` / `Relink manually`，但没有后续状态。
- Header 右侧动作被 `mobileHeader(title, right)` 简化为跳 Reader 或 Paste，`Close`、`Cancel`、`Edit`、`Filter`、`Share` 的语义没有真实分化。

### 3.2 Reader 画布还不是真正的代码阅读器

当前 `codeCanvas()` 生成的是静态代码区和 AI FAB。CSS 中：

- `.code-area` 使用 `overflow: hidden`。
- `.line-code` 使用 `white-space: nowrap`。
- 没有横向滚动、纵向滚动、软换行、字号切换、当前行定位、selection drag 等真实阅读能力。

这对 MVP 风险很大。Pocket Vibe 的核心不是“看起来像代码”，而是“手机上真的能读代码”。如果代码长行看不到、无法横向拖、无法稳定回到当前函数，Reader first 会变成视觉口号。

### 3.3 Tool Rail 语义弱

Right Tool Rail 目前是 `S / C / T` 三个字母按钮。它们对设计者清楚，对首次用户不够清楚。

建议把它们改成图标：

- Search：放大镜。
- File Cards：堆叠卡片。
- Trail：历史/轨迹。

同时在首次进入 Reader 时提供一次性提示，并在 sticky bar 保留低占用搜索入口。搜索是读码的高频动作，不应该藏得太深。

### 3.4 Search 结果交互多了一步

Search Sheet 中结果卡片本身没有直接承担 preview 行为，而是通过 `Preview selected result` 按钮跳转。这个交互在代码里很明确，但在真实使用中很低效。

建议：

- 结果行点击直接进入 Search Preview。
- 长按或右侧小按钮用于 `Add context`。
- 保留 query、结果滚动位置和 `Back to results`。
- 支持上一个/下一个结果切换，但不提交主 Reader。

### 3.5 Definition Peek 操作语义需要收敛

Definition Peek 中同时有 `Ask AI`、`Add context`、`Open`。对用户来说：

- `Open` 是明确导航动作。
- `Ask AI` 是明确任务动作。
- `Add context` 更像内部概念，含义不如 `Ask AI` 直接。

建议主按钮变成：

- Primary：`Explain definition`
- Secondary：`Open`
- More：`Add to chat context` 或收进更多菜单

这样更符合“我找到定义以后立刻让 AI 解释”的真实任务。

### 3.6 Chat 闭环方向对，但状态还早

Chat Half Sheet 有 context chip、快捷提问、输入框、Send、token/cost 和 Save note，方向正确。

但源码和截图共同暴露了几个问题：

- AI response 为空时 `Save note` 已可见，语义不清。
- 底部 `Token limit` / `Save note` 在小屏中有被裁切风险。
- 输入框获得焦点后如果弹出键盘，当前布局没有验证。
- `Save note` 后跳 Notes List，会打断阅读。

建议保存动作跟随 AI 回复卡片出现；无回复时禁用或隐藏。保存成功只给 snackbar 和 gutter bookmark，不默认离开 Reader。

### 3.7 从 CSS 坐标看到的物理操作风险

源码层面的坐标已经能暴露一些移动端物理操作问题：

- `.fab` 固定在 `right:18px; bottom:18px`，尺寸 52×52，右手拇指可达性较好。
- `.tool-rail` 固定在 `right:0; top:236px`，按钮为 36×36。对 390×844 的大屏手机来说，首个搜索按钮落在屏幕中上段，不是舒适热区；按钮尺寸也低于常见 44×44 最小触控目标。
- `.symbol-menu` 固定在 `top:188px; left:138px`，宽 202px。它不会根据被点击 token 的位置动态避让，容易盖住刚才阅读的上下文。
- `.selection-toolbar` 固定在 `top:104px; left:58px`，是明显的顶部操作区。选中代码后再点 `Chat / Annotate / Copy`，对右手单持不友好。
- `.bottom-sheet.refs` 高 520px，`.bottom-sheet.search` 高 456px，`.bottom-sheet.chat` 高 388px，`.bottom-sheet.save` 高 354px。它们都是固定高度，没有 snap point、键盘避让或小屏自适应规则。
- `.landscape-frame` 是 844×390，但仍放在 390px 宽的 `.phone-frame` 内；父容器 `overflow:hidden` 会裁掉横屏右侧内容。

这些问题不只是视觉布局问题，而是会直接转化为手指伸展、误触、遮挡和系统手势冲突。

## 4. 浏览器实测发现

### 4.1 覆盖状态

本次浏览器验证覆盖：

1. Reader Default
2. Right Tool Rail
3. Search Sheet Results
4. Search Preview
5. Symbol Action Menu
6. Definition Peek
7. References Panel
8. Reading Trail Drawer
9. Code Selection Toolbar
10. Chat Half Sheet
11. Save Note Tray
12. Code Annotation
13. Landscape Reader + Chat

原有更完整截图集 `browser-review-shots-live/` 还覆盖：

1. Repo Empty
2. Paste URL / Validation
3. Clone Progress
4. Reader after Open
5. Token Limit
6. Save Note
7. Notes List
8. Note Detail
9. Anchor Stale
10. Offline
11. LSP Indexing

### 4.2 代码可见区量化

浏览器中手机框内容区实测约 818px 高，默认代码区约 750px。默认 Reader 状态下，代码区占内容屏约 91.7%，很好。

打开面板后，代码仍在 DOM 上占 750px，但被底部 sheet 遮住，可见区下降。以下是本轮浏览器实测数据：

| 状态 | Sheet 高度 | Sheet 占内容屏 | Sheet 上方可见高度 | 扣除 path/sticky 后约剩 | 结论 |
| --- | ---: | ---: | ---: | ---: | --- |
| Reader Default | 0px | 0% | 818px | 750px | 符合 Reader first |
| Search Sheet | 456px | 55.7% | 362px | 294px | 搜索抢走太多视线 |
| Search Preview | 456px | 55.7% | 362px | 294px | 预览本身可用，但代码上下文很少 |
| Definition Peek | 438px | 53.5% | 380px | 312px | 可以接受，但偏重 |
| References Panel | 520px | 63.6% | 298px | 230px | 已明显不适合边读边看 |
| Chat Half Sheet | 388px | 47.4% | 430px | 362px | 短问答可用，键盘态高风险 |
| Save Note Tray | 354px | 43.3% | 464px | 396px | 不弹键盘可用，标题输入后风险上升 |
| Annotation Sheet | 270px | 33.0% | 548px | 480px | 是目前最接近轻量 sheet 的状态 |

这个数据说明：默认 Reader 是好的，但一旦进入搜索、定义、引用、聊天，Reader first 会明显变弱。需要 snap points 或更紧凑的 peek；References 不适合作为默认半屏 sheet，应该优先考虑可滚动侧栏、全屏结果页或横屏右侧面板。

### 4.3 截图观察

Definition Peek 截图显示：上半屏保留当前代码，下半屏展示定义 snippet 和 `Ask AI / Add context / Open`。结构清楚，但三个按钮占宽很满，`Ask AI` 与 `Add context` 的区别不够直观。

Chat 截图显示：context chip 和快捷提问可见，输入区合理。`Send` 在右侧，`Token limit / Save note` 在底部，这在不弹键盘时可用；但真实手机键盘弹起后，输入框、Send、Save note 的布局需要单独验证。当前输入框还是 `div.input-box`，不是实际 `input` / `textarea`，因此浏览器无法触发真实键盘态。

Symbol Menu 截图显示：菜单覆盖代码中段，正好挡住上下文。菜单宽度和位置固定，不能根据被点符号避让。移动端误触和遮挡风险较高。

Tool Rail 截图显示：右侧 rail 不算大，但 `S / C / T` 语义弱，且贴右边。按钮实测 36×36，不适合高频点击；搜索按钮中心位于屏幕高度约 32% 处，对大屏右手单持偏高。

Reading Trail 截图显示：抽屉宽 282px，占 388px 内容宽度约 73%。它能清晰展示轨迹，但打开后右侧几乎成为主屏，左侧代码只剩窄条，已经不是“边看边回溯”，而是临时覆盖模式。

Landscape 截图暴露了一个实际渲染问题：`landscape-frame` 是 844×390，但仍被放进 390px 宽的手机框里，右侧 Chat / Results Panel 被裁掉，当前横屏状态无法有效评审。

### 4.4 热区与触控尺寸实测

本轮浏览器测量得到：

- Chat FAB：52×52，位于右下角，属于舒适热区。
- Tool Rail：48px 宽，三个按钮均为 36×36；作为搜索、卡片、轨迹入口偏小。
- Symbol Menu：202×174，四个按钮每个约 180×38；按钮高度接近但仍低于更稳妥的 44px 触控目标。
- Selection Toolbar：241×42，位于屏幕上方，选中后操作不在右手拇指舒适区。
- 顶部 `cards` 文本入口没有按钮语义，视觉像链接，触控目标和 A11y 语义都偏弱。

建议所有高频触控目标至少达到 44×44；搜索、Chat、Save、Open、Explain 这类关键动作应优先布置在屏幕中下部或底部 sheet 的主操作位。

### 4.5 手势冲突判定

当前设计把多个高频或重要动作放在右侧边缘：Tool Rail 唤出、Reading Trail 唤出、代码横向浏览长行、系统返回手势都可能争抢同一区域。

风险判断：

- 严重冲突：右边缘滑出 Tool Rail / Trail 与代码横向滚动。
- 严重冲突：右边缘滑出 Trail 与 Android / HarmonyOS 系统返回手势。
- 中等冲突：底部 sheet 上下拖动与代码纵向滚动、sheet 内部列表滚动。
- 中等冲突：代码 selection drag 与 Symbol Menu / Selection Toolbar 的弹出时机。

建议不要把右侧工具条主入口押在隐形边缘手势上。保留一个可见 edge tab 或小把手；如果仍支持边缘滑动，必须限定为窄热区起始、水平位移超过阈值、角度接近水平，并且不能拦截普通代码横向滚动。

### 4.6 A11y 与视觉疲劳

浏览器 DOM 检查显示，`S / C / T`、`AI`、顶部 `cards` 等入口缺少 `aria-label` 或 tooltip。输入框也只是视觉上的 `div.input-box`，还不是语义化表单控件。

主要问题：

- 代码字号约 10px，snippet 约 11px，长时间阅读吃力。
- 语法高亮颜色依赖较强，状态点只有颜色提示；indexing / ready 等状态需要文字或图标冗余。
- 暗黑模式、高对比模式、字号档、行高档、软换行开关缺失。
- Tool Rail 使用单字母，视觉识别和屏幕阅读器语义都弱。
- Sheet 没有明确的关闭按钮、焦点陷阱、Esc/系统返回关闭规则。

建议至少提供三套阅读主题：Dark、High Contrast、Warm Light；代码字号提供 13 / 15 / 17px 档；高亮、书签、状态不要只依赖颜色表达。

## 5. 关键问题分级

### 5.1 P0：把 Reader 做成真正可读

必须补齐：

- 纵向滚动。
- 横向滚动或软换行。
- 字号调节。
- 长路径省略。
- 当前函数定位。
- 折叠入口。
- 长行和超长函数名的破版验证。

验收标准：用户能在真实手机宽度下连续读 5 分钟代码，不因为字号、长行、无法滚动而放弃。

### 5.2 P0：符号操作要真实可点

现在 Symbol Menu 是状态，不是从 Reader 里的 token 真实触发。MVP 原型至少要补：

- 点击/长按代码 token。
- 命中区域反馈。
- 菜单避让逻辑。
- 点击空白处关闭。
- LSP indexing 时禁用或降级。

验收标准：用户能从 Reader 中直接点一个符号，进入 Definition Peek，再让 AI 解释。

### 5.3 P0：搜索结果直接 Preview

当前 `Preview selected result` 是多余步骤。搜索结果行应该承担 preview 行为。

验收标准：从 Reader 找一个函数定义并预览，不超过 4 次关键点击。

### 5.4 P0：保存笔记不要离开阅读

当前 F-18 `Save` 跳 F-20 Notes List，会打断阅读心流。

建议行为：

- Save 后回到 Chat / Reader 原位置。
- snackbar：`已保存到笔记`。
- 提供 `查看` / `撤销`。
- gutter 出现 bookmark。

验收标准：保存 AI 解释后，用户仍在原代码附近。

### 5.5 P0：导入页状态不能矛盾

F-02 同时显示合法示例 URL 和错误提示，会损害信任。

建议拆成：

- Empty：等待输入。
- Validating：loading。
- Valid：显示仓库元信息。
- Invalid：真实失败后再显示错误。

### 5.6 P0：右侧边缘手势不能和代码滚动抢控制权

右侧边缘现在承担了 Tool Rail 和 Reading Trail 的发现/唤出职责，但代码区本身需要横向浏览长行，系统也会占用边缘返回手势。这个冲突会直接影响可用性。

建议行为：

- 不依赖隐形右边缘滑动作为唯一入口。
- 增加可见 edge tab / handle，点击打开 Tool Rail 或 Trail。
- 将搜索入口放到 sticky bar 或底部可达区，避免搜索必须先打开 rail。
- 右边缘手势只作为增强能力，并限定起始区域、方向阈值和位移阈值。
- 代码区横向滚动优先级高于工具唤出。

验收标准：用户能在代码区横向拖动长行，不误触 Tool Rail / Trail；从系统边缘返回也不误开应用抽屉。

### 5.7 P0：键盘态下 Chat / Save Note 不遮挡关键操作

当前 Chat 和 Save Note 在不弹键盘时视觉可用，但真实输入态还没有验证。标题输入、聊天输入、长回复编辑都会触发软键盘。

建议行为：

- 不自动聚焦输入框，避免进入 Chat 就弹键盘。
- 键盘弹起后输入栏贴键盘上方，Send 保持可见。
- Save Note 的 `Save` / `Later` 不被键盘遮挡。
- 键盘态保留一个紧凑的“当前代码上下文”摘要，而不是承诺完整阅读代码。
- 为小屏设备单独验证 360×780、390×844、430×932 三档。

验收标准：键盘弹起后，用户仍能输入、发送、保存或关闭，不需要盲滑寻找底部按钮。

### 5.8 P0：横屏右侧面板必须真实可见

当前 `Landscape Reader + Chat` 的设计方向合理，但浏览器实测显示右侧面板被固定手机框裁切。它现在是一个不可有效评审的状态。

建议行为：

- 横屏状态使用 844×390 的横向手机框，而不是塞进 390px 宽竖屏框。
- 或者在原型外层切换 phone frame 宽高，模拟真实设备旋转。
- 右侧 Chat / Search / LSP / References 面板必须在截图中完整可见。
- 横屏键盘态要单独处理，因为可用高度只有 390px 左右。

验收标准：横屏截图中能同时看到左侧代码和右侧活动面板，且两侧内容不被 phone frame 裁切。

### 5.9 P1：Sheet 需要 snap points 和统一退出

Search / Definition / Chat 都是固定高度 sheet。建议改成：

- 小 peek：只展示标题、关键 snippet、主操作。
- 半屏：展示完整结果。
- 全屏：搜索列表、长 AI 回复、references 等重内容。

统一规则：

- Sheet 必须有关闭或返回。
- Preview 必须有 `Back to results`。
- 只有 `Open` / `Jump to source` 写入阅读轨迹。
- 点击遮罩或代码空白处收起临时层。

### 5.10 P1：工具入口需要更可发现、更可触达

建议：

- 右侧 rail 图标化，触控目标至少 44×44。
- 将 rail 整体下移到更接近中下热区，或支持用户左右手模式。
- sticky bar 增加搜索入口。
- 首次进入 Reader 提示右侧工具。
- 右侧手势热区内缩 12-24dp，避免和系统返回冲突。

### 5.11 P1：异常与边界状态补齐

需要继续补齐：

- Search loading / empty / too many results。
- Clone failed / retry / delete residue。
- AI no API key / timeout / retry / streaming。
- Save note failed but keep draft。
- LSP failed with retry。
- Unsupported / binary / encoding error。
- Very large file warning。
- 小屏 + keyboard + bottom sheet。

## 6. 已覆盖较好的状态

- F-01 Repo Empty：导入 CTA 明确。
- F-03 Clone Progress：有阶段、进度、速度和剩余时间。
- F-05 Reader Default：默认代码区占比高。
- F-09 Search Preview：坚持 preview before jump。
- F-11 Definition Peek：单一定义也先 peek，不直接跳。
- F-17 Token Limit：有超限 chip、warning 和 disabled send。
- F-23 Offline：明确 code/search/notes 可用，Chat send disabled。
- F-24 LSP Indexing：禁用高置信 LSP 动作，保留 candidate search。
- F-25 Anchor Stale：不低置信乱跳，保留 relink 思路。
- F-26 Landscape：横屏代码 + 面板布局方向合理，但当前原型被竖屏 phone frame 裁切，需要修正后再评审。

## 7. 可执行优化清单

### 7.1 立即修复

1. F-02 默认不显示错误框，只在真实校验失败后出现。
2. Reader 代码区支持真实滚动，补字号和长行策略。
3. Reader 内补真实 token 点按/长按，触发 Symbol Menu。
4. Search 结果行直接进入 preview，移除 `Preview selected result` 机械按钮。
5. Definition Peek 合并 `Ask AI` / `Add context` 的主路径，使用 `Explain definition`。
6. F-18 Save 后返回 Reader / Chat，并显示 snackbar，不直接跳 Notes。
7. F-09 增加 `Back to results`。
8. F-06 增加 Reader 入口，例如 sticky bar 的 fold icon。
9. F-25 给 `Find candidates` 和 `Relink manually` 补后续状态。
10. Tool Rail 从 `S / C / T` 改成图标 + 首次提示。
11. Tool Rail 按钮增至至少 44×44，并下移到更舒适的拇指热区。
12. 取消右侧隐形边缘手势作为唯一入口，增加可见 handle。
13. 为 Chat / Save Note 增加 keyboard-aware 布局。
14. 修正 F-26 横屏 frame，确保右侧面板真实可见。
15. 为 `S / C / T`、`AI`、`cards`、sheet handle 等入口补 `aria-label` / tooltip / 可访问名称。

### 7.2 第二优先级

1. 为 Search / Definition / Chat 增加 snap points。
2. 补齐 Search loading / empty / too many results。
3. 补齐 AI no key / loading / timeout / failed retry。
4. 补齐 Clone failed / retry / delete residue。
5. 为 Copy、Save、Add context 等轻动作增加 toast。
6. 让 Repo List 成为已有仓库用户的默认启动页。
7. 验证底部 sheet + 键盘 + 小屏布局。
8. 增加代码阅读主题：Dark、High Contrast、Warm Light。
9. 增加代码字号、行高、软换行设置。

### 7.3 第三优先级

1. 设计多候选 Definition 的候选 + 预览双区 peek。
2. 设计 References 点击某条后的 preview 子状态。
3. 设计 note save failed 的草稿保留。
4. 验证右侧边缘手势在 Android WebView / 原生壳中的冲突。
5. 补 Daily Report / Notes 的大量数据状态。

## 8. 建议的验收标准

下一轮原型评审建议用以下标准验收：

- 首次用户能在 5 秒内找到导入仓库入口。
- 进入 Reader 后，用户能在 5 秒内找到搜索入口。
- 默认 Reader 中代码可见面积保持 80% 以上。
- 高频触控目标不低于 44×44，且搜索、Chat、Save 等动作位于拇指可达区。
- 右侧工具入口有可见 handle 或按钮，不依赖隐形边缘滑动。
- 代码区横向滚动长行时，不误触 Tool Rail / Reading Trail。
- 打开 Chat 后当前选区或当前函数仍可见。
- 从 Reader 点代码符号可以真实触发 Symbol Menu。
- 搜索结果预览不改变主 Reader，只有 `Open` 才提交导航。
- Definition Peek 不写入轨迹，`Open` 后才写入轨迹。
- 从“找函数定义”到“让 AI 解释”不超过 4 次关键点击。
- Token 超限时 Send 不可用，用户知道如何裁剪。
- 保存笔记后用户仍停留在阅读场景，并能看到保存成功反馈。
- 从笔记 source chip 能跳回代码；source 失效时不乱跳。
- 离线时已 clone 代码、搜索和笔记可用，Chat send 禁用。
- LSP indexing / failed 时不展示虚假的精准定义。
- 小屏 + 键盘 + bottom sheet 不遮挡输入和关键操作。
- 横屏状态能同时看到左侧代码和右侧活动面板，不被竖屏容器裁切。
- Dark / High Contrast / 字号调整 / 软换行可用。
- 关键入口具备可访问名称，状态不只依赖颜色表达。

## 9. 最核心的产品诉求

为了让我这种忙、急、经常只用手机补上下文的后端开发者用得爽，MVP 最核心缺的不是更多页面，而是一个统一的 `Jump / Ask` 操作。

我想要：

1. 在 Reader 里点符号、长按符号，或打开搜索。
2. 输入/选择 `resolveModule`。
3. 结果先 preview，不立刻跳。
4. Peek 上直接有 `Explain` 和 `Open`。
5. 解释完能保存，但保存后还在代码原位。

这条链路如果顺，Pocket Vibe 的 MVP 就会很有说服力：手机不只是能看代码，而是真的可以在离开工位时继续理解代码。

## 10. 结论

Pocket Vibe 已经摸到了正确的差异化：移动端代码阅读的关键不是堆 IDE 功能，而是让用户不迷路、少被遮挡、少点几下，并且能把刚理解的东西沉淀下来。

下一步最值得投入的是：

1. 把 Reader 变成真正可滚动、可调字号、可处理长行的代码阅读器。
2. 把符号点击、搜索 preview、definition peek、AI explain 打成一条真实可点的核心链路。
3. 降低 sheet 对代码视线的侵占，并把键盘态做成一等状态。
4. 让保存笔记成为轻动作，不中断阅读。
5. 把工具入口做得更可发现、更少猜、更不抢代码滚动手势。
6. 修正横屏右侧面板裁切，让横屏真正承担重内容阅读。
7. 补齐暗黑、高对比、字号和可访问名称，降低长时间阅读疲劳。

做到这些以后，Pocket Vibe 的 MVP 会从“有想法的原型”变成“我真的愿意在手机上用它读代码”的工具。
