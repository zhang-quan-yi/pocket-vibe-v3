# Pocket Vibe Figma Prototype Links Spec

版本：MVP Prototype Links v0.1  
日期：2026-05-14  
目标 Figma 文件：https://www.figma.com/design/eZU0VlMkuLVP8dfI2tqU8t

## 1. 当前状态

Figma 低/中保真静态画板已经生成完成。

由于当前 Figma Starter 计划的 MCP 调用额度仍未在工具侧恢复，prototype 点击连线暂未能写入 Figma。本文档记录下一次可写入时应批量创建的连线、评审注释和交互规则。

## 2. 页面结构

当前 Figma 文件因 Starter 计划最多 3 个页面，采用压缩结构：

- `00 Overview & Flows`
- `01 Mobile Wireframes`
- `02 Components & Edge States`

主要画板集中在 `01 Mobile Wireframes`：

- `F-01 / Repo Empty`
- `F-02 / Paste URL / Validation`
- `F-03 / Clone Progress`
- `F-04 / Repo List`
- `F-05 / Reader Default`
- `F-06 / Reader Folded`
- `F-07 / Right Tool Rail`
- `F-08 / Search Sheet Results`
- `F-09 / Search Preview`
- `F-10 / Symbol Action Menu`
- `F-11 / Definition Peek`
- `F-12 / References Panel`
- `F-13 / File Cards`
- `F-14 / Reading Trail Drawer`
- `F-15 / Code Selection Toolbar`
- `F-16 / Chat Half Sheet`
- `F-17 / Chat Token Limit`
- `F-18 / Save Note Tray`
- `F-19 / Code Annotation`
- `F-20 / Notes List`
- `F-21 / Note Detail with Source`
- `F-22 / Daily Report`
- `F-23 / Offline State`
- `F-24 / LSP Indexing State`
- `F-25 / Anchor Stale State`
- `F-26 / Landscape Reader + Chat`

## 3. Prototype 主路径连线

| From | To | Trigger | Label |
|---|---|---|---|
| F-01 Repo Empty | F-02 Paste URL / Validation | On click | paste url |
| F-02 Paste URL / Validation | F-03 Clone Progress | On click | validate |
| F-03 Clone Progress | F-05 Reader Default | On click | clone done |
| F-04 Repo List | F-05 Reader Default | On click | continue |
| F-05 Reader Default | F-07 Right Tool Rail | On click | tool rail |
| F-07 Right Tool Rail | F-08 Search Sheet Results | On click | search |
| F-08 Search Sheet Results | F-09 Search Preview | On click | result |
| F-09 Search Preview | F-05 Reader Default | On click | open |
| F-05 Reader Default | F-10 Symbol Action Menu | On click | tap symbol |
| F-10 Symbol Action Menu | F-11 Definition Peek | On click | definition |
| F-10 Symbol Action Menu | F-12 References Panel | On click | references |
| F-11 Definition Peek | F-05 Reader Default | On click | open |
| F-12 References Panel | F-16 Chat Half Sheet | On click | add context |
| F-05 Reader Default | F-13 File Cards | On click | cards |
| F-13 File Cards | F-05 Reader Default | On click | open card |
| F-05 Reader Default | F-14 Reading Trail Drawer | On click | trail |
| F-14 Reading Trail Drawer | F-05 Reader Default | On click | back |
| F-05 Reader Default | F-15 Code Selection Toolbar | On click | select |
| F-15 Code Selection Toolbar | F-16 Chat Half Sheet | On click | add chat |
| F-16 Chat Half Sheet | F-18 Save Note Tray | On click | save note |
| F-18 Save Note Tray | F-20 Notes List | On click | saved |
| F-20 Notes List | F-21 Note Detail with Source | On click | open note |
| F-21 Note Detail with Source | F-05 Reader Default | On click | source |
| F-16 Chat Half Sheet | F-17 Chat Token Limit | On click | limit |
| F-05 Reader Default | F-19 Code Annotation | On click | annotate |
| F-20 Notes List | F-22 Daily Report | On click | report |

## 4. Prototype 交互参数

建议统一参数：

- Trigger：`On click`
- Navigation：`Navigate to`
- Transition：`Smart animate`
- Duration：`250ms`
- Easing：`Ease out`
- Preserve scroll position：`false`

例外：

- F-09 Search Preview -> F-05 Reader Default：可用 instant 或 smart animate，表达“Open 后提交跳转”。
- F-11 Definition Peek -> F-05 Reader Default：建议 smart animate，表达 peek 扩展为主阅读。
- F-13 File Cards -> F-05 Reader Default：建议 smart animate，表达卡片回到全屏阅读。

## 5. 评审注释

应添加到 `01 Mobile Wireframes` 对应画板附近：

| 位置 | 标题 | 正文 |
|---|---|---|
| F-05 附近 | Review: Reader First | Default reader keeps code visible; tools appear through rail, sheet or peek. |
| F-09 附近 | Review: Preview Before Jump | Search and LSP use preview first. Only Open changes reader and trail. |
| F-16 附近 | Review: Chat Avoids Code | Chat sheet shrinks the code viewport and keeps selected lines visible. |
| F-25 附近 | Review: Anchor Failure | Notes remain readable when source anchor is stale; relink is explicit. |

## 6. Overview 页交互规则说明

应添加到 `00 Overview & Flows`：

标题：`Prototype Interaction Rules`

内容：

1. Sheets and peeks preview first; Open is the only action that commits a navigation.
2. Reader state should survive Search, LSP, Chat, Notes and Trail interactions.
3. LSP indexing and anchor stale states must not pretend to be accurate.
4. HarmonyOS NEXT shell should preserve the same information architecture and interaction sequence.

## 7. Components 页状态检查清单

应添加到 `02 Components & Edge States`：

标题：`State Coverage Checklist`

内容：

- LSP ready / indexing / failed
- Chat token ok / warning / blocked
- Source anchor resolved / remapped / stale
- Online / offline
- Clone progress / failed / retry

## 8. Figma MCP 写入脚本状态

已准备批量写入脚本，包含：

- prototype reactions
- visual flow arrows
- review notes
- overview interaction rules
- component state checklist

待 Figma MCP 调用额度恢复后执行一次即可。
