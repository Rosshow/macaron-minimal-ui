import type { Ticket } from "@/data/mock";

export type Row = { t: Ticket; depth: number; hasChildren: boolean };

export type Ref = { id: string; linkable: boolean };
export type Summary = {
  pred: Ref | null;
  moreBefore: boolean;
  succ: Ref | null;
  moreAfter: boolean;
};

const byNo = (a: string, b: string) => Number(a) - Number(b) || a.localeCompare(b);

/** 所有依赖边（前置 → 后置），基于完整数据集 */
export function dependencyEdges(all: Ticket[]) {
  const edges: [string, string][] = [];
  for (const t of all) for (const d of t.dependsOn ?? []) edges.push([d, t.id]);
  return edges;
}

/**
 * 简单边：前置与后置是同一父工单下的兄弟，且在兄弟范围内前置只有这一个后置、后置只有这一个前置。
 */
export function simpleEdges(visible: Ticket[]) {
  const byId = new Map(visible.map((t) => [t.id, t]));
  const parentOf = (id: string) => {
    const p = byId.get(id)?.parentId;
    return p && byId.has(p) ? p : null;
  };
  const sibSucc = new Map<string, string[]>();
  const sibPred = new Map<string, string[]>();
  for (const t of visible) {
    for (const d of t.dependsOn ?? []) {
      if (!byId.has(d) || parentOf(d) !== parentOf(t.id)) continue;
      sibSucc.set(d, [...(sibSucc.get(d) ?? []), t.id]);
      sibPred.set(t.id, [...(sibPred.get(t.id) ?? []), d]);
    }
  }
  const next = new Map<string, string>();
  for (const [a, succs] of sibSucc) {
    if (succs.length !== 1) continue;
    const b = succs[0]!;
    if ((sibPred.get(b) ?? []).length === 1) next.set(a, b);
  }
  return next;
}

/** 关系列表：按父子缩进 DFS 展开，兄弟内把简单链连续排列；折叠的父工单隐藏全部后代。 */
export function buildRows(visible: Ticket[], collapsed: Set<string>): Row[] {
  const ids = new Set(visible.map((t) => t.id));
  const children = new Map<string | null, Ticket[]>();
  for (const t of visible) {
    const p = t.parentId && ids.has(t.parentId) ? t.parentId : null;
    children.set(p, [...(children.get(p) ?? []), t]);
  }
  const next = simpleEdges(visible);
  const prev = new Map([...next].map(([a, b]) => [b, a]));
  const rows: Row[] = [];

  const orderSiblings = (list: Ticket[]) => {
    const byId = new Map(list.map((t) => [t.id, t]));
    const out: Ticket[] = [];
    const used = new Set<string>();
    for (const t of list) {
      if (used.has(t.id)) continue;
      let head = t.id;
      const seen = new Set<string>();
      while (prev.has(head) && byId.has(prev.get(head)!) && !seen.has(head)) {
        seen.add(head);
        head = prev.get(head)!;
      }
      let cur: string | undefined = head;
      while (cur && byId.has(cur) && !used.has(cur)) {
        used.add(cur);
        out.push(byId.get(cur)!);
        cur = next.get(cur);
      }
    }
    return out;
  };

  const walk = (parent: string | null, depth: number) => {
    for (const t of orderSiblings(children.get(parent) ?? [])) {
      const hasChildren = (children.get(t.id) ?? []).length > 0;
      rows.push({ t, depth, hasChildren });
      if (hasChildren && !collapsed.has(t.id)) walk(t.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

/** 相邻两行之间是否画小箭头（rows[i] → rows[i+1]） */
export function arrowsBetween(rows: Row[], visible: Ticket[]) {
  const next = simpleEdges(visible);
  return rows.map((r, i) => {
    const b = rows[i + 1];
    return Boolean(b && b.depth === r.depth && next.get(r.t.id) === b.t.id);
  });
}

/**
 * 卡片顶部单行依赖摘要：直接前置/后置各最多一个，其余用省略号。
 * covered：已由相邻小箭头表达的边（"a>b"），不重复展示。
 * 不在当前结果中的工单不生成链接（linkable=false 时只用省略号表示）。
 */
export function summaryFor(
  t: Ticket,
  all: Ticket[],
  visibleIds: Set<string>,
  covered: Set<string>,
): Summary | null {
  const preds = (t.dependsOn ?? []).filter((d) => !covered.has(`${d}>${t.id}`)).sort(byNo);
  const succs = all
    .filter((x) => (x.dependsOn ?? []).includes(t.id) && !covered.has(`${t.id}>${x.id}`))
    .map((x) => x.id)
    .sort(byNo);
  if (!preds.length && !succs.length) return null;
  const pick = (list: string[]) => {
    const firstVisible = list.find((id) => visibleIds.has(id));
    return firstVisible ? { id: firstVisible, linkable: true } : null;
  };
  const pred = pick(preds);
  const succ = pick(succs);
  return {
    pred,
    moreBefore: preds.length > (pred ? 1 : 0),
    succ,
    moreAfter: succs.length > (succ ? 1 : 0),
  };
}

export function coveredEdges(rows: Row[], arrows: boolean[]) {
  const s = new Set<string>();
  arrows.forEach((on, i) => {
    if (on) s.add(`${rows[i]!.t.id}>${rows[i + 1]!.t.id}`);
  });
  return s;
}
