# 修复：历史工单详情页打不开（仍显示列表）

## 现状

详情页 `src/routes/history.$id.tsx` 已经写好了（标签行、信息行、发起人→处理人、问题描述/附件/讨论摘要、讨论气泡与输入区、底部催办/上报/编辑）。

问题出在路由嵌套：因为存在 `history.$id.tsx`，`history.tsx` 变成了它的父级布局路由，而 `history.tsx` 里渲染的是列表内容、没有 `<Outlet />`，所以访问 `/history/xxx` 时子路由无法挂载，页面看起来还是历史工单列表——像是「只加了路由、没加页面」。

## 要做的改动

把详情页改成不嵌套在列表下的独立路由：

- 将 `src/routes/history.$id.tsx` 重命名为 `src/routes/history_.$id.tsx`，并把内部改为 `createFileRoute("/history_/$id")`。
- URL 保持 `/history/$id` 不变，`src/routes/history.tsx`（列表页）与其中的 `<Link to="/history/$id">` 都不需要改。
- 页面内容不变。

## 验收

- `/history` 仍是列表页。
- 点击任意历史工单卡片，进入的是详情页内容（讨论气泡、附件、底部操作条），而不是列表。
- 构建通过。
