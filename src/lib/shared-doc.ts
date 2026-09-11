import type { ProjectNode } from "@/lib/project-tree.functions";

export const AUTO_END_MARKER = "<!-- 以下为问题背景补充，自动生成内容不会覆盖 -->";

export const DEFAULT_MANUAL_SECTION = `${AUTO_END_MARKER}

## 问题背景补充

- 现象：
- 复现步骤：
- 影响范围：
`;

function nodeText(node: ProjectNode): string {
  const value = node.value as unknown;
  if (node.content_type === "select") {
    const selected = (value as { selected?: string } | null)?.selected;
    return selected ? `${selected}` : "（未选择）";
  }
  if (node.content_type === "file" || node.content_type === "image") {
    const file = value as { name?: string; size?: number } | null;
    if (!file?.name) return "（未上传）";
    const label = node.content_type === "image" ? "图片" : "附件";
    return `${label}：${file.name}`;
  }
  return typeof value === "string" && value.trim() ? value.trim() : "（未填写）";
}

/** 把选中的一级标签及其全部子节点渲染成 Markdown 背景信息。 */
export function buildAutoSection(
  nodes: ProjectNode[],
  selectedRootIds: string[],
  projectName: string,
  pendingTitles: string[] = [],
): string {
  const byParent = new Map<string | null, ProjectNode[]>();
  nodes.forEach((node) => {
    const list = byParent.get(node.parent_id) ?? [];
    list.push(node);
    byParent.set(node.parent_id, list);
  });
  byParent.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));

  const lines: string[] = [`# 问题共享文档`, ``, `> 项目：${projectName}`, ``];

  if (pendingTitles.length > 0) {
    lines.push(`> 等待他人补充：${pendingTitles.join("、")}`, ``);
  }

  lines.push(`## 项目背景信息`, ``);

  const roots = (byParent.get(null) ?? []).filter((node) => selectedRootIds.includes(node.id));
  if (roots.length === 0) {
    lines.push("（未选择项目背景信息）", "");
  }

  const walk = (node: ProjectNode, depth: number) => {
    const children = byParent.get(node.id) ?? [];
    lines.push(`${"#".repeat(Math.min(depth + 2, 6))} ${node.title}`, "");
    if (children.length === 0) {
      lines.push(nodeText(node), "");
    }
    children.forEach((child) => walk(child, depth + 1));
  };

  roots.forEach((root) => walk(root, 1));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n\n";
}

/** 只替换自动段，保留用户手写的补充内容。 */
export function mergeDoc(auto: string, current: string): string {
  const index = current.indexOf(AUTO_END_MARKER);
  const manual = index >= 0 ? current.slice(index) : DEFAULT_MANUAL_SECTION;
  return `${auto}${manual}`;
}
