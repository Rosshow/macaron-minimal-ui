import type { Ticket } from "@/data/mock";

export const isDone = (t: Ticket) => t.status === "已解决" || t.status === "已关闭" || t.status === "已取消";

export type Row = { ticket: Ticket; depth: number; childCount: number; doneChildren: number };

/** 按父子树排列；同一父工单下的兄弟按依赖拓扑排序，无依赖的保持原顺序（并行不会变成串行）。 */
export function buildRows(list: Ticket[], collapsed: Set<string>): Row[] {
  const ids = new Set(list.map((t) => t.id));
  const children = new Map<string, Ticket[]>();
  const roots: Ticket[] = [];
  for (const t of list) {
    if (t.parentId && ids.has(t.parentId)) {
      const arr = children.get(t.parentId) ?? [];
      arr.push(t);
      children.set(t.parentId, arr);
    } else roots.push(t);
  }
  const rows: Row[] = [];
  const walk = (sibs: Ticket[], depth: number) => {
    for (const t of topoSort(sibs)) {
      const kids = children.get(t.id) ?? [];
      rows.push({ ticket: t, depth, childCount: kids.length, doneChildren: kids.filter(isDone).length });
      if (kids.length && !collapsed.has(t.id)) walk(kids, depth + 1);
    }
  };
  walk(roots, 0);
  return rows;
}

export function topoSort(sibs: Ticket[]): Ticket[] {
  const inSet = new Set(sibs.map((s) => s.id));
  const placed = new Set<string>();
  const out: Ticket[] = [];
  while (out.length < sibs.length) {
    const next =
      sibs.find((s) => !placed.has(s.id) && (s.dependsOn ?? []).every((d) => !inSet.has(d) || placed.has(d))) ??
      sibs.find((s) => !placed.has(s.id))!; // 环路兜底
    placed.add(next.id);
    out.push(next);
  }
  return out;
}

export type Edge = { from: string; to: string };
export const dependencyEdges = (all: Ticket[]): Edge[] =>
  all.flatMap((t) => (t.dependsOn ?? []).map((from) => ({ from, to: t.id })));

/** 返回端点状态：visible=两端可见可画；collapsed=一端被折叠；filtered=一端不在当前结果。 */
export function edgeState(e: Edge, visible: Set<string>, inResult: Set<string>) {
  if (!inResult.has(e.from) || !inResult.has(e.to)) return "filtered" as const;
  if (!visible.has(e.from) || !visible.has(e.to)) return "collapsed" as const;
  return "visible" as const;
}

export function ancestors(id: string, all: Ticket[]): string[] {
  const byId = new Map(all.map((t) => [t.id, t]));
  const out: string[] = [];
  let p = byId.get(id)?.parentId;
  while (p) {
    out.push(p);
    p = byId.get(p)?.parentId;
  }
  return out;
}
