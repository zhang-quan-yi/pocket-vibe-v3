---
applyTo: "**"
---

# Pocket Vibe Copilot Instructions

请把 `AGENTS.md` 作为本仓库的统一 agent 指南。本文件只是给 VS Code Copilot Chat 的 always-on 摘要。

Pocket Vibe v3 当前是移动优先 AI 源码阅读器的 mock walking skeleton：

```text
Open app -> choose mock repo -> open mock file -> select code -> add context -> ask mock chat -> save note -> jump back to source
```

工作规则：

- 保持 walking skeleton 可运行。
- Web/PWA 代码在 `apps/web`，当前是 plain Vite + TypeScript。
- Go mock API 在 `services/core`。
- 产品和架构决策在 `docs`。
- 前端校验用 `npm run build:web`。
- 后端校验用 `npm run test:api`。
- 保持 `SourceRange`、`ReaderPayload`、`ContextChip`、`ToolCallLog`、`ChatSession`、`Anchor`、`Note` 等 DTO 平台无关。
- AI 上下文必须通过 Context Basket chip 或 send preview 可见。
- `#codebase` 是 retrieve intent，不是发送整个仓库。
- 除非明确要求，不要添加真实私有仓库、源码编辑、terminal、Agent source write、git commit/branch/PR flow 或 unrestricted network tool。

大改前阅读：

- `docs/POCKET_VIBE_MVP_PRD.md`
- `docs/POCKET_VIBE_ARCHITECTURE_BLUEPRINT.md`
- `docs/POCKET_VIBE_WEB_PWA_FRONTEND_MODULE_DESIGN.md`
- `docs/POCKET_VIBE_WEB_PWA_BACKEND_MODULE_DESIGN.md`

