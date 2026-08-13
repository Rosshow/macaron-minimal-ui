# 「项目管理」入口指向项目授权页

后台管理页「更多功能」里的 **项目管理** 按钮，点击后直接进入刚设计好的项目授权页（项目导入 / 项目授权 / licences / 人员授权）。

## 改动

- `src/routes/admin.tsx`：将「项目管理」项的跳转由 `/projects` 改为 `/projects/auth/$id`，并传入默认项目 `params`（取 mock 项目列表第一个项目编号）。
- 其余三个入口（数据管理、日报周报、其他）保持不变。
- 项目列表 → 详情 → 授权 的原有链路不动，仍可正常使用。

## 技术细节

使用 TanStack Router 的 `<Link to="/projects/auth/$id" params={{ id }}>`，`id` 来自 `@/data/mock` 的 `projects[0].code`，避免硬编码不存在的编号。
