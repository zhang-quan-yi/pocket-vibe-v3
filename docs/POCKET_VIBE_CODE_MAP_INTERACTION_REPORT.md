# Pocket Vibe Code Map 竞品交互试用报告

日期：2026-05-15

## 结论

Code map 不是空白市场。现有产品已经覆盖了架构图、依赖图、风险热力图、blast radius、AI 摘要和 onboarding tour。

但它们几乎都默认桌面大屏、团队治理或代码审查场景。Pocket Vibe 的机会不是“也做一张图”，而是做 **手机上的源码地图阅读器**：

- 地图负责建立方位感：先看模块，再放大到文件、函数、调用路径。
- Reader 负责细读源码：地图上的节点必须能稳定回到代码位置。
- AI 负责路线，不负责霸占界面：用 `Next / Prev` 式 guide、节点解释和路径说明替代 chat-first。
- 保存笔记仍锚定源码：笔记不是孤立聊天记录，而是贴在地图节点和代码行上的阅读痕迹。

我的判断：Code Map 应成为 Pocket Vibe 的第二个主入口，甚至可以作为新 repo clone 后的默认第一屏；Reader 仍是最终落点。

## 试用范围

实际体验：

- CodersMap：打开公开样例 `bytedance/deer-flow` 分析页。
- CodeCanvas：在本地启动 `npx code-canvas-server`，打开 Web canvas；本地仓库连接被 Pro/sign-in 限制。
- GitHub Next Repo Visualization：打开公开 demo，并载入 `facebook/create-react-app`。
- CodeCharta：打开官方 sample visualization。
- CodebaseQA：打开 live demo repo，并进入 Graph tab。
- POLPROG CodeMap：从 GitHub 安装到临时 venv，对当前 Pocket Vibe 仓库执行 `scan` 和 `graph`。
- Sourcegraph：打开公开搜索/代码导航页面，验证其搜索与 code nav 交互模型。

受限体验：

- CodeSee：官网和 demo 说明可访问，但创建/编辑 map 需要账号；当前产品已被 GitKraken 收购。
- DevLens：官网和 OSS README 可访问；本机缺少 Bun，且完整体验需要 LLM key，因此只做安装可行性和交互信息评估。
- Codeface：iOS App Store 页面可访问；本机无法安装 iOS app。
- Sourcetrail：GitHub 仓库可访问，但项目已停止维护，未做桌面安装。

## 产品观察

### CodersMap

定位是“Google Maps for Code”，更像代码健康和架构治理仪表盘。公开样例先给 health score、hot zones、bus factor、fragile files、blast radius、systems index。

优点：

- 高层信息非常快，适合管理者、审查者、接手陌生 repo 的第一眼判断。
- 数字化摘要降低进入门槛：多少 files、areas、connections 一眼能懂。
- “地图 + 风险 + blast radius”组合很强，能回答“改这里会影响哪里”。

问题：

- 对移动端读码不友好，样例页首先是报告，不是连续阅读。
- 地图与源码细读之间的转换感不明显。
- 信息偏治理，开发者想读某个函数时还需要再钻。

Pocket Vibe 可借鉴：模块级鸟瞰、health/risk 作为图层，不作为主界面文案。

### CodeSee Maps

CodeSee 的核心是 codebase map、interactive tours、labels、collaboration 和 visual code review。

优点：

- “tour”是很值得借鉴的交互：不是让用户自由迷路，而是给一条可分享路线。
- labels 和自定义 map 能表达团队语境。
- 上下游依赖、refactor planning 和 onboarding 场景讲得很清楚。

问题：

- 需要账号，无法无门槛试用完整编辑链路。
- 产品语境偏团队协作和 PR，不是手机读码。

Pocket Vibe 可借鉴：把 AI guide 做成路线，而不是聊天记录；路线可以在地图上高亮节点。

### CodeCanvas

CodeCanvas 最接近“无限画布上的代码地图”。本地 server 成功启动，Web app 能检测到 local server；界面包含 select/move、zoom、fit、layout、edges、LSP、CST、watcher 等控制。

优点：

- 地图感很强：zoom、pan、fit nodes 是核心操作。
- LSP、CST、file watcher 与本地仓库结合，适合真实开发者。
- 控制粒度专业，能承载很复杂的 code graph。

问题：

- 本地仓库连接需要 Pro/sign-in，未能完整接入当前 repo。
- 桌面工具味很重，移动端会显得控制过密。
- 初始界面对新手压力偏大。

Pocket Vibe 可借鉴：zoom/pan/fit 是 code map 的基本手势；但移动端要把专业控制折进 layer sheet。

### GitHub Next Repo Visualization

这是一个研究型 demo。输入 GitHub repo 后直接生成文件/目录结构可视化，可搜索文件、排除路径。

优点：

- 进入快，几乎没有解释成本。
- 文件类型和目录结构的空间化表达直观。
- 适合“先看看这个 repo 长什么样”。

问题：

- 更像结构可视化，不是日常读码产品。
- 缺少代码语义、AI 引导、笔记和阅读回路。

Pocket Vibe 可借鉴：低摩擦 repo overview，不要一开始就要求用户理解复杂术语。

### CodeCharta

CodeCharta 是成熟的 3D code city。官方 sample 可以切换 area/height/color/edge metric，展示复杂度、代码行数、commit 等指标。

优点：

- 风险热力图和质量指标表达成熟。
- 文件/节点 explorer、legend、metric controls 很完整。
- 适合架构审计和质量分析。

问题：

- 控制过密，移动端难以直接照搬。
- 城市隐喻适合看热点，不适合点进某一段代码连续阅读。
- AI 或学习路线不是核心。

Pocket Vibe 可借鉴：把 heatmap 作为一个 layer：`Overview / Dependencies / Flow / Hotspots`。

### DevLens

DevLens 主张 React/Next/Node 项目的 interactive dependency graph、AI summaries、importance scoring、commit diff、blast radius。OSS README 显示其需要 Bun、Node 和 LLM provider key。

优点：

- “blast radius before merge”价值清晰。
- 节点摘要分 business/technical 两类，适合高低层切换。
- K-hop、security、commit diff 都是强开发场景。

问题：

- 运行门槛较高，本次没有完整本地体验。
- 产品仍默认桌面和工程审计，不是移动阅读。

Pocket Vibe 可借鉴：节点解释应有 `High-level / Technical / Risk / Next step` 四种视角，而不是单一 AI insight card。

### CodebaseQA

CodebaseQA 的 live demo 很有参考价值：Repo 列表进入后有 Chat、Learn、Graph 三个模式。Graph tab 有 file graph/overview、focus、fit、center、type filters、minimap、export、节点 inspector。

优点：

- 模式分离清楚：Chat 问答、Learn 学习、Graph 看结构。
- Graph 支持类型过滤，节点类型包括 Component、API、Utility、Config、File。
- “Select a node to inspect dependencies and source preview”非常接近 Pocket Vibe 需要的 map -> source 链路。

问题：

- 界面仍以桌面为主。
- Graph 和 Reader 不在同一个移动阅读节奏里。
- gamification 对 Pocket Vibe 未必是 MVP 重点。

Pocket Vibe 可借鉴：Graph mode 可以有明确类型过滤；节点 inspector 要直接提供 source preview 和 Open Reader。

### Codeface

Codeface 是 iOS 端代码阅读/审查类产品，App Store 页面强调移动端代码浏览、AI 辅助理解和 GitHub workflows。

优点：

- 说明手机上做源码阅读是成立的。
- 移动端交互应优先考虑触控、短 session、快速定位。

问题：

- 未能在本机安装体验。
- 重点更接近移动代码 review，不是 code map。

Pocket Vibe 可借鉴：移动端不是桌面缩小版，地图操作必须为单手和短时阅读设计。

### Sourcegraph

Sourcegraph 不是 code map 产品，但它是 code search 和 precise code navigation 的标杆。试用公开搜索页时，核心是 query、repo/path/symbol filters、结果与 docs。

优点：

- 搜索语义和过滤强。
- hover、definition、references 这类确定性导航是地图可信度的基础。

问题：

- 没有空间地图。
- 移动端阅读不是重点。

Pocket Vibe 可借鉴：地图不能只靠 AI 画，必须建立在 deterministic index、imports、LSP、tree-sitter、ripgrep 之上。

### Sourcetrail

Sourcetrail 是经典桌面代码探索工具，强调源码索引和图形化代码结构。项目已停止维护。

优点：

- “图 + 源码”双视图方向正确。
- 对 symbol navigation 的产品证明很早就存在。

问题：

- 桌面时代产品，移动端启发有限。
- 停止维护，不适合作为技术路线依赖。

Pocket Vibe 可借鉴：地图必须和源码视图互相定位，不能只是静态图。

### POLPROG CodeMap

本次从 GitHub 安装到临时 venv 后，对 Pocket Vibe 仓库执行：

- `codemap scan .`：识别到 `prototype/pocket-vibe-wireframe/app.js`。
- `codemap graph . --output <temp> --format html --fast`：生成 `codemap.html`。
- 首次运行遇到 Windows GBK 编码错误，设置 `PYTHONUTF8=1` 和 `PYTHONIOENCODING=utf-8` 后成功。

优点：

- 本地生成快，HTML 输出轻量。
- 具备 node、link、group、language、metrics、risk、legend、minimap 等结构。
- 很适合作为“静态地图导出”的参考。

问题：

- 对当前仓库只识别到一个 JS 文件，依赖关系为空，说明解析覆盖和 repo 适配还有限。
- UI 是桌面图谱，不是移动读码。

Pocket Vibe 可借鉴：先生成确定性 graph 数据，再让移动端按 zoom level 渲染。

## Pocket Vibe 设计判断

### 1. 地图不是图表，是阅读入口

不要把 Code Map 做成报告页。它应该像地图应用一样：

- 打开后先看到 repo 的模块地形。
- 双指缩放或 `+ / -` 进入更细层级。
- 点击节点出现 lens，不立即跳走。
- `Open Reader` 才进入源码细读。

### 2. AI 应该变成路线层

Chat 不应该是默认入口。更好的形态是：

- `Guide`: 新人路线、debug 路线、API 请求路线。
- `Next / Prev`: 在地图上移动当前讲解节点。
- `Explain`: 对当前节点给 high-level、technical、risk、related files。
- `Ask`: 保留，但作为二级能力。

### 3. 图层要回答不同问题

移动端不能堆控件。建议四个默认 layer：

- `Overview`: 模块和职责。
- `Deps`: 依赖方向和 fan-in/fan-out。
- `Flow`: 运行链路，如 request -> resolver -> cache -> result。
- `Hotspots`: 复杂度、频繁修改、缺测试、AI 生成风险。

### 4. 读码链路应是 Map -> Lens -> Reader

推荐主链路：

1. Clone 完成后进入 `Code Map Overview`。
2. 用户看到 `Runtime / Resolver / Loader / Tests` 等模块岛。
3. 点 `Resolver` 进入 `Module Zoom`。
4. 点 `resolveModule` 打开 `Node Lens`。
5. Lens 中可选 `Explain`、`Show deps`、`Open Reader`。
6. Reader 保留地图 breadcrumb，可回到相同缩放和节点。

### 5. Pocket Vibe 的差异化一句话

竞品更像“在桌面上分析代码库”，Pocket Vibe 应该是“在手机上沿着地图读懂代码库”。

## 原型落点

本轮原型已加入以下屏幕：

- `Code Map Overview`：鸟瞰模块岛、图层切换、缩放/fit 控制、mini map、Guide 入口。
- `Code Map Module Zoom`：放大 Resolver 模块，展示文件、函数、调用边和 guide step。
- `Code Map Node Lens`：节点详情 sheet，提供 high-level、dependencies、flow、risk 摘要和 `Open Reader`。
- Reader / Tool Rail 增加 `Map` 入口。

这些屏幕故意不做完整拖拽，只表达核心交互规则：地图可缩放、可平移、可切 layer；节点先 peek，再进入 Reader。

## 参考链接

- [CodersMap](https://codersmap.com/)
- [CodeSee Codebase Maps](https://www.codesee.io/codebase-maps)
- [CodeCanvas](https://www.codecanvas.app/)
- [GitHub Next Repo Visualization](https://githubnext.com/projects/repo-visualization)
- [CodeCharta](https://codecharta.com/)
- [DevLens](https://devlens.io/)
- [CodebaseQA](https://www.codebaseqa.com/)
- [Codeface App Store](https://apps.apple.com/us/app/codeface/id1578175415)
- [Sourcegraph Code Navigation Docs](https://sourcegraph.com/docs/code-navigation)
- [Sourcetrail GitHub](https://github.com/CoatiSoftware/Sourcetrail)
- [POLPROG CodeMap](https://polprog.pl/pl/apps/CodeMap/)
