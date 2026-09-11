# 编辑页信息完整性提示 + 一键折叠/展开

## 目标
在「编辑项目信息」页（/projects/$id/edit）增强信息完整性的可视化管理。

## 改动

### 1. 一键折叠 / 一键展开
- 「信息节点」标题旁（文件导入、新标签按钮同一行或下一行）增加两个图标按钮：「全部展开」「全部折叠」。
- 实现：ProjectInformationTree 已有折叠状态（expanded Set），新增两个方法/受控入口：expandAll（把所有有子节点的节点 id 放入集合）、collapseAll（清空集合）。通过 ref 或 props 从编辑页头部触发。

### 2. 根节点旁的缺失信息计数
- 复用现有的叶子完整性判断逻辑（与共享文档里 computeTagCompleteness 一致：叶子节点 value 为空字符串/空对象视为未填写）。
- 每个一级根节点行右侧显示一个数字徽标（如「缺 12」），统计该根节点子树内未填写的叶子节点数量；为 0 时不显示。
- 折叠/展开不影响计数。

### 3. 项目详情页标签旁的感叹号
- 项目详情页「项目信息管理」卡片的根标签（tag 按钮）上，当该标签子树叶子未完整时，在标签右上角显示橙色感叹号图标（与工单页共享文档中标签的感叹号样式一致）。
- 复用同一完整性计算逻辑，保证三处口径一致。

## 技术说明
- 改动文件：`src/components/tree/ProjectInformationTree.tsx`（展开/折叠入口、计数）、`src/routes/projects.$id_.edit.tsx`（头部按钮）、`src/components/project/ProjectDetailCard.tsx`（标签感叹号）。
- 完整性计算抽取为共享工具函数（如 src/lib/tree-completeness.ts），供编辑页、详情页、工单共享文档三处复用，避免口径不一致。
- 纯前端改动，不涉及数据结构或云端变更。

## 验证
- `bunx tsgo --noEmit` 通过。
- Playwright 检查 /projects/100/edit：按钮可一键展开/折叠，根节点显示缺失计数；/projects/100：不完整标签显示感叹号。
