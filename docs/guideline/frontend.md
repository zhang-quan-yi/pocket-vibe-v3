# 前端组件开发规范

1. 基础组件放在 apps\web\src\shared\ui 目录中。
2. 自定义业务组件以 “C” 开头，比如 “CButton”
3. 普通组件不拥有状态，只负责模版渲染，比如 “CButton”，没有内部状态
4. 容器组件只负责状态维护，将状态传递给普通组件，以 “Container” 结尾。比如 “CButtonContainer”，内部拥有状态，依赖 “CButton”。
5. 组件内部不负责业务逻辑，封装 “useXXXApp” 方法负责。比如 “useButtonApp”。

