import type { ProjectNode } from "@/lib/project-tree.functions";

export type TagCompleteness = { total: number; empty: number; incomplete: boolean };

function isEmptyLeaf(node: ProjectNode): boolean {
  const value = node.value as unknown;
  if (node.content_type === "select") {
    return !(value as { selected?: string } | null)?.selected;
  }
  if (node.content_type === "file" || node.content_type === "image") {
    return !(value as { name?: string } | null)?.name;
  }
  return !(typeof value === "string" && value.trim());
}

/** 统计每个一级标签下末级节点的填写情况，只要存在空叶子节点即视为信息不全。 */
export function computeTagCompleteness(nodes: ProjectNode[]): Map<string, TagCompleteness> {
  const byParent = new Map<string | null, ProjectNode[]>();
  nodes.forEach((node) => {
    const list = byParent.get(node.parent_id) ?? [];
    list.push(node);
    byParent.set(node.parent_id, list);
  });

  const result = new Map<string, TagCompleteness>();

  const walk = (node: ProjectNode, acc: { total: number; empty: number }) => {
    const children = byParent.get(node.id) ?? [];
    if (children.length === 0) {
      acc.total += 1;
      if (isEmptyLeaf(node)) acc.empty += 1;
      return;
    }
    children.forEach((child) => walk(child, acc));
  };

  (byParent.get(null) ?? []).forEach((root) => {
    const acc = { total: 0, empty: 0 };
    walk(root, acc);
    result.set(root.id, {
      total: acc.total,
      empty: acc.empty,
      incomplete: acc.total > 0 && acc.empty > 0,
    });
  });

  return result;
}
