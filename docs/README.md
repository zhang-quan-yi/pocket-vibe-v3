# Pocket Vibe

Pocket Vibe 是一款移动端 AI 源码阅读器，目标是在手机上完成真正可用的代码阅读、预览跳转、AI 解释和知识沉淀。

## 当前文档入口

- [MVP PRD](./POCKET_VIBE_MVP_PRD.md)
- [移动端核心交互 UX 方案](./POCKET_VIBE_MOBILE_UX_SPEC.md)
- [技术可行性与架构报告](./POCKET_VIBE_TECH_FEASIBILITY_ARCHITECTURE_REPORT.md)
- [Web/PWA 高层设计与模块设计](./POCKET_VIBE_WEB_PWA_HIGH_LEVEL_AND_MODULE_DESIGN.md)
- [Web/PWA 前端模块设计](./POCKET_VIBE_WEB_PWA_FRONTEND_MODULE_DESIGN.md)
- [Web/PWA 后端模块设计](./POCKET_VIBE_WEB_PWA_BACKEND_MODULE_DESIGN.md)
- [产品经理启动计划](./POCKET_VIBE_PM_KICKOFF_PLAN.md)
- [架构蓝图](./POCKET_VIBE_ARCHITECTURE_BLUEPRINT.md)
- [CTO 技术战略](./POCKET_VIBE_CTO_TECH_STRATEGY.md)
- [项目管理计划](./POCKET_VIBE_PROJECT_MANAGEMENT_PLAN.md)
- [Code Map 竞品交互试用报告](./POCKET_VIBE_CODE_MAP_INTERACTION_REPORT.md)

## 当前工程入口

工程开工最短链路已经落到仓库根目录：

```text
../apps/web
../services/core
```

当前 mock walking skeleton：

```text
Open app
  -> choose mock repo
  -> open mock file
  -> select code
  -> add context
  -> ask mock chat
  -> save note
  -> jump back to source
```

启动方式见仓库根目录 `README.md`。

## 原型

当前 coded wireframe 原型位于，已包含 Code Map 鸟瞰、模块放大和节点 lens 链路：

```text
prototype/pocket-vibe-wireframe/index.html
```

该原型无需构建，直接用浏览器打开即可。

## 资料归档

旧版 Figma brief、UX review、优化摘要和评审截图已归档到：

```text
archive/2026-05-15-ux-refresh/
```

归档资料仅作为历史参考，当前 UX 决策以 `POCKET_VIBE_MOBILE_UX_SPEC.md` 为准。
