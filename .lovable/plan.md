# 节点重点关注标记 + 变动进入项目动态

## 1. 在「项目信息管理」卡片里标注节点

- 浏览页面（项目详情页的信息管理卡片）里，每个末级节点标题右侧出现一个星标按钮。
- 点一下＝标注为重点关注，再点一下＝取消；标注状态所有人共享，存在云端。
- 已标注的节点标题旁常亮显示星标，便于快速识别重点内容。

## 2. 被标注节点的变动展示在「项目动态」

- 编辑页面（或补充信息抽屉）里保存某个节点的内容时，系统记录一条变动：谁、什么时候、改前是什么、改后是什么。
- 「项目动态」卡片新增一个「关注节点变动」区块，只展示被标注节点的内容变动，按时间倒序，最多展示最近若干条。
- 每条显示：节点名称（含所属根标签）、改前 → 改后（过长自动截断），不显示操作人和时间。
- 未被标注的节点内容变动不记录展示，避免噪音。

## 3. 操作人

当前应用没有登录，操作人用本地填写/默认名（首次操作时提示输入一次并记住），随变动记录一起存云端。

## 技术说明

- 新增两张公开读写表（与 `project_nodes` 一致的开放策略，附 GRANT）：
  - `project_node_marks`：`node_id`（唯一）、`project_code`、`created_at`、`created_by`。
  - `project_node_changes`：`node_id`、`project_code`、`node_title`、`root_title`、`old_text`、`new_text`、`changed_by`、`created_at`。
- `src/lib/project-tree.functions.ts` 新增：`toggleNodeMark`、`getNodeMarks`、`getMarkedNodeChanges`（按项目取最近 N 条）；在 `updateProjectNode` 保存成功后，若该节点已被标注则写入一条变动记录（对比旧值与新值，内容一致则不记录）。
- `ProjectDetailCard.tsx`：末级节点渲染处加星标按钮，用 TanStack Query 读取标注集合，切换后失效缓存。
- `ProjectActivityCard.tsx`：接收 `projectCode`，新增「关注节点变动」区块，通过服务端函数读取真实记录；无记录时显示空态文案。`projects.$id.tsx` 传入项目编号。
- 操作人名称存 localStorage（`project-tree:operator`），随请求传给服务端函数。
