import type { Ticket } from "@/data/mock";

export type DepRef = {
  /** 展示的一个直接前置（可见、未用箭头表达） */
  prev?: Ticket | undefined;
  prevMore: boolean;
  next?: Ticket | undefined;
  nextMore: boolean;
};

export type RelationRow = {
  ticket: Ticket;
  depth: number;
  childCount: number;
  childDone: number;
  /** 与上一行之间显示「上一行 → 本行」的小箭头 */
  arrowFromPrev: boolean;
  ref: DepRef | null;
};

const DONE: Ticket["status"][] = ["已解决", "已关闭"];
export const isDone = (t: Ticket) => DONE.includes(t.status);

const byNo = (a: Ticket, b: Ticket) => a.id.localeCompare(b.id, "en", { numeric: true });

/** 计算某工单在给定“已用箭头表达”边集合之外的顶部依赖引用 */
function buildRef(
  t: Ticket,
  all: Map<string, Ticket>,
  visible: Set<string>,
  successors: Map<string, string[]>,
  arrowed: Set<string>,
): DepRef | null {
  const preds = (t.dependsOn ?? []).filter((p) => all.has(p) && !arrowed.has(`${p}>${t.id}`));
  const succs = (successors.get(t.id) ?? []).filter((s) => !arrowed.has(`${t.id}>${s}`));
  if (!preds.length && !succs.length) return null;
  // 不可见（被筛选掉）的关联工单不生成链接，只计入省略号
  const vp = preds.filter((p) => visible.has(p)).map((p) => all.get(p)!).sort(byNo);
  const vs = succs.filter((s) => visible.has(s)).map((s) => all.get(s)!).sort(byNo);
  return {
    prev: vp[0],
    prevMore: preds.length > (vp[0] ? 1 : 0),
    next: vs[0],
    nextMore: succs.length > (vs[0] ? 1 : 0),
  };
}

function successorMap(all: Ticket[]) {
  const m = new Map<string, string[]>();
  for (const t of all) for (const p of t.dependsOn ?? []) m.set(p, [...(m.get(p) ?? []), t.id]);
  return m;
}

/** 普通列表：保持原排序，所有依赖都用顶部引用 */
export function buildFlatRefs(all: Ticket[], visibleList: Ticket[]) {
  const map = new Map(all.map((t) => [t.id, t]));
  const visible = new Set(visibleList.map((t) => t.id));
  const succ = successorMap(all);
  return new Map(visibleList.map((t) => [t.id, buildRef(t, map, visible, succ, new Set())]));
}

/** 同级排序：依赖连通的工单连续排列，块内按拓扑顺序，块按原顺序首次出现排列 */
export function orderSiblings(siblings: Ticket[]): Ticket[] {
  const ids = new Set(siblings.map((s) => s.id));
  const index = new Map(siblings.map((s, i) => [s.id, i]));
  const adj = new Map<string, Set<string>>(siblings.map((s) => [s.id, new Set()]));
  for (const s of siblings)
    for (const p of s.dependsOn ?? [])
      if (ids.has(p)) {
        adj.get(s.id)!.add(p);
        adj.get(p)!.add(s.id);
      }
  const seen = new Set<string>();
  const out: Ticket[] = [];
  for (const s of siblings) {
    if (seen.has(s.id)) continue;
    const comp: Ticket[] = [];
    const stack = [s.id];
    seen.add(s.id);
    while (stack.length) {
      const id = stack.pop()!;
      comp.push(siblings[index.get(id)!]!);
      for (const n of adj.get(id)!) if (!seen.has(n)) (seen.add(n), stack.push(n));
    }
    comp.sort((a, b) => index.get(a.id)! - index.get(b.id)!);
    // Kahn 拓扑排序（稳定）
    const compIds = new Set(comp.map((c) => c.id));
    const indeg = new Map(comp.map((c) => [c.id, (c.dependsOn ?? []).filter((p) => compIds.has(p)).length]));
    const done = new Set<string>();
    while (done.size < comp.length) {
      const next = comp.find((c) => !done.has(c.id) && indeg.get(c.id) === 0) ?? comp.find((c) => !done.has(c.id))!;
      done.add(next.id);
      out.push(next);
      for (const c of comp) if ((c.dependsOn ?? []).includes(next.id)) indeg.set(c.id, indeg.get(c.id)! - 1);
    }
  }
  return out;
}

/** 关系列表：缩进表达父子，相邻同级的依赖用小箭头，其余用顶部引用 */
export function buildRelationRows(all: Ticket[], visibleList: Ticket[], collapsed: Set<string>): RelationRow[] {
  const map = new Map(all.map((t) => [t.id, t]));
  const visible = new Set(visibleList.map((t) => t.id));
  const succ = successorMap(all);
  const children = new Map<string, Ticket[]>();
  const roots: Ticket[] = [];
  for (const t of visibleList) {
    if (t.parentId && visible.has(t.parentId)) children.set(t.parentId, [...(children.get(t.parentId) ?? []), t]);
    else roots.push(t);
  }

  const rows: Omit<RelationRow, "ref" | "arrowFromPrev">[] = [];
  const parentOf = new Map<string, string | null>();
  const walk = (list: Ticket[], depth: number, parent: string | null) => {
    for (const t of orderSiblings(list)) {
      const kids = children.get(t.id) ?? [];
      const allKids = all.filter((k) => k.parentId === t.id);
      parentOf.set(t.id, parent);
      rows.push({ ticket: t, depth, childCount: allKids.length, childDone: allKids.filter(isDone).length });
      if (kids.length && !collapsed.has(t.id)) walk(kids, depth + 1, t.id);
    }
  };
  walk(roots, 0, null);

  const arrowed = new Set<string>();
  const arrows = rows.map((r, i) => {
    const prev = rows[i - 1];
    if (!prev || parentOf.get(prev.ticket.id) !== parentOf.get(r.ticket.id)) return false;
    if (!(r.ticket.dependsOn ?? []).includes(prev.ticket.id)) return false;
    arrowed.add(`${prev.ticket.id}>${r.ticket.id}`);
    return true;
  });
  return rows.map((r, i) => ({
    ...r,
    arrowFromPrev: arrows[i] ?? false,
    ref: buildRef(r.ticket, map, visible, succ, arrowed),
  }));
}

export function parentIds(all: Ticket[]) {
  return new Set(all.map((t) => t.parentId).filter((x): x is string => Boolean(x)));
}
