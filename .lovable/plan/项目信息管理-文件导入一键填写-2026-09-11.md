# 项目信息管理：文件导入一键填写

## 要做的事

### 1. 顶部新增「文件导入」按钮
- 「编辑项目信息」页顶部（信息节点标题栏，「新标签」左侧）增加「文件导入」按钮。
- 点击后选择本地文件，支持 Word（.docx）、Markdown/纯文本（.md/.txt）、Excel（.xlsx/.csv）。

### 2. AI 识别并匹配节点
- 文件内容交给 AI 识别，输出「节点名称 → 内容」的对应关系。
- AI 会参照当前项目已有的信息节点结构（标签路径）做匹配，尽量对上已有节点。

### 3. 先预览再确认
导入后弹出预览清单，分三组显示，用户可逐条勾选：
- **将填写**：节点当前为空，直接填入。
- **将覆盖**：节点已有内容，显示「原内容 → 新内容」，默认不勾选，需用户主动勾选。
- **未匹配到节点**：显示识别出的名称与内容，并询问「是否新增这些节点？」，勾选后作为新末级节点创建到 AI 建议的父标签下（父标签不存在时归入新建的「导入信息」标签）。

确认后统一保存到云端，完成提示「已填写 X 项，新增 Y 项，覆盖 Z 项」。取消则不做任何改动。

## 技术说明
- 新增 `src/components/tree/NodeImportDialog.tsx`：文件选择 + 预览清单 + 勾选确认。
- 文本提取在浏览器端完成：`.md/.txt/.csv` 直接读文本；`.docx` 用 `mammoth`；`.xlsx` 用 `xlsx`（两个包需安装，均可在浏览器运行，避免 Worker 端原生依赖问题）。
- 新增 `src/lib/node-import.functions.ts`：`createServerFn`，入参为提取出的纯文本 + 当前项目节点路径清单，调用 Lovable AI Gateway（`openai/gpt-6-astra`，Responses API，流式消费后取最终文本）返回结构化 JSON：`[{ path, title, value, matchedNodeId | null, suggestedParentPath }]`。`LOVABLE_API_KEY` 只在 handler 内读取。
- 匹配以服务端返回的 `matchedNodeId` 为准，前端再按标题路径做一次校验，仅对 `content_type === "text"` 的末级节点填写；`select` 节点只有当值命中已有选项时才填写，否则归入未匹配组。
- 应用变更复用现有 `updateProjectNode` / `createProjectNode`，逐条串行保存，完成后 invalidate `["project-nodes", projectCode]`，共享文档与详情页自动同步。
- 沿用现有黑白灰 + 马卡龙蓝语义色与 shadcn 组件，手机优先，不改动现有节点样式与缩进。

## 验收
- 顶部出现「文件导入」按钮，选一个 Word/Excel/Markdown 文件后弹出预览清单。
- 勾选确认后，对应节点内容被填入，页面立即刷新显示。
- 未匹配的条目可选择新增节点，也可以整体跳过。
