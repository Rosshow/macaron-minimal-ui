# 标签右上角感叹号样式统一为参考图

## 目标
将项目详情页与提单页「问题共享文档设置」中，标签右上角的信息不全感叹号，改成参考图样式：灰色实心圆底 + 白色感叹号，覆盖在标签右上角。

## 改动

### 1. 新建可复用感叹号组件
- 文件：`src/components/TagWarningBadge.tsx`
- 样式：直径 16px 的灰色实心圆（`bg-gray-400` 或更接近参考图的灰），白色 `!` 文字，绝对定位在父元素右上角（`-top-1.5 -right-1.5`），带细微阴影避免与标签底色融合。
- 语义：`aria-label="信息不全"`。

### 2. 提单页标签感叹号替换
- 文件：`src/components/ticket/TicketCreateSheet.tsx`
- 将共享文档设置里标签右上角的红色 `!` 自定义 span 替换为 `<TagWarningBadge />`。
- 保持只在选中且信息不全时显示。

### 3. 项目详情页标签感叹号替换
- 文件：`src/components/project/ProjectDetailCard.tsx`
- 将根标签右上角的 `AlertCircle`（橙色）替换为 `<TagWarningBadge />`。
- 保证与提单页、编辑页口径一致。

### 4. 编辑页缺失计数保持不变
- `ProjectInformationTree.tsx` 中的「缺 N」数字徽标逻辑与样式本次不动，仅处理「感叹号」图标。

## 验证
- `bunx tsgo --noEmit` 通过。
- Playwright 检查 `/projects/100` 与提单流程：信息不全标签右上角显示灰色圆底白感叹号，选中/未选中状态均可见，无控制台错误。
