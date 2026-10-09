import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, AlertCircle, EyeOff } from "lucide-react";
import type { Ticket } from "@/data/mock";
import { ancestors, buildRows, dependencyEdges, edgeState, isDone, type Edge } from "@/lib/task-graph";
import { cn } from "@/lib/utils";

type Props = {
  all: Ticket[];
  result: Ticket[];
  collapsed: Set<string>;
  setCollapsed: (s: Set<string>) => void;
  onShowAll: () => void;
  renderCard: (t: Ticket) => ReactNode;
};

const LANE = 9;

function useIndent() {
  const [w, setW] = useState(24);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const f = () => setW(mq.matches ? 16 : 24);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return w;
}

export function RelationList({ all, result, collapsed, setCollapsed, onShowAll, renderCard }: Props) {
  const indent = useIndent();
  const rows = useMemo(() => buildRows(result, collapsed), [result, collapsed]);
  const visible = useMemo(() => new Set(rows.map((r) => r.ticket.id)), [rows]);
  const inResult = useMemo(() => new Set(result.map((t) => t.id)), [result]);
  const byId = useMemo(() => new Map(all.map((t) => [t.id, t])), [all]);
  const edges = useMemo(() => dependencyEdges(all), [all]);
  const drawn = useMemo(() => edges.filter((e) => edgeState(e, visible, inResult) === "visible"), [edges, visible, inResult]);
  const [selected, setSelected] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const pendingScroll = useRef<string | null>(null);

  // 车道分配：按行区间贪心错开，减少重叠
  const lanes = useMemo(() => {
    const idx = new Map(rows.map((r, i) => [r.ticket.id, i]));
    const sorted = [...drawn].sort((a, b) => span(a) - span(b));
    function span(e: Edge) { return Math.abs(idx.get(e.from)! - idx.get(e.to)!); }
    const used: [number, number][][] = [];
    const out = new Map<Edge, number>();
    for (const e of sorted) {
      const lo = Math.min(idx.get(e.from)!, idx.get(e.to)!), hi = Math.max(idx.get(e.from)!, idx.get(e.to)!);
      let l = 0;
      while (used[l]?.some(([a, b]) => !(hi < a || lo > b))) l++;
      (used[l] ??= []).push([lo, hi]);
      out.set(e, l);
    }
    return { map: out, count: Math.max(1, used.length) };
  }, [drawn, rows]);
  const gutter = 10 + lanes.count * LANE;

  const wrap = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [boxes, setBoxes] = useState<Record<string, { x: number; y: number }>>({});
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    const root = wrap.current;
    if (!root) return;
    const r0 = root.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    cardRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = { x: r.left - r0.left, y: r.top - r0.top + Math.min(28, r.height / 2) };
    });
    setBoxes(next);
    setHeight(root.scrollHeight);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    cardRefs.current.forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [measure, rows, indent, gutter]);

  useEffect(() => {
    const id = pendingScroll.current;
    if (!id) return;
    pendingScroll.current = null;
    cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(id);
    setSelected(id);
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [rows]);

  const toggle = (id: string) => {
    const n = new Set(collapsed);
    n.has(id) ? n.delete(id) : n.add(id);
    setCollapsed(n);
  };
  const reveal = (id: string) => {
    const n = new Set(collapsed);
    ancestors(id, all).forEach((a) => n.delete(a));
    pendingScroll.current = id;
    setCollapsed(n);
  };

  const related = (e: Edge) => selected && (e.from === selected || e.to === selected);

  return (
    <div className="mt-3" onClick={() => setSelected(null)}>
      <p className="mb-2 text-[11.5px] text-muted-foreground">
        缩进表示所属父工单，<span className="text-blue-1">箭头表示前置 → 后置</span>。点击卡片突出其直接依赖。
      </p>
      <div ref={wrap} className="relative">
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height={height} aria-hidden>
          <defs>
            <marker id="dep-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="fill-blue-2" />
            </marker>
          </defs>
          {drawn.map((e) => {
            const a = boxes[e.from], b = boxes[e.to];
            if (!a || !b) return null;
            const lx = gutter - 8 - lanes.map.get(e)! * LANE;
            const dim = selected && !related(e);
            return (
              <path
                key={e.from + e.to}
                d={`M${a.x},${a.y} H${lx} V${b.y} H${b.x - 1}`}
                fill="none"
                markerEnd="url(#dep-arrow)"
                className={cn(
                  "stroke-blue-2 transition-opacity motion-reduce:transition-none",
                  dim ? "opacity-15" : related(e) ? "opacity-100" : "opacity-70",
                )}
                strokeWidth={related(e) ? 2 : 1.4}
                strokeLinejoin="round"
              />
            );
          })}
        </svg>

        <div className="space-y-3">
          {rows.map(({ ticket: t, depth, childCount, doneChildren }) => {
            const mine = edges.filter((e) => e.from === t.id || e.to === t.id);
            const hidden = mine.filter((e) => edgeState(e, visible, inResult) === "collapsed");
            const filtered = mine.filter((e) => edgeState(e, visible, inResult) === "filtered");
            const blocked = (t.dependsOn ?? []).some((d) => { const p = byId.get(d); return p && !isDone(p); });
            const open = !collapsed.has(t.id);
            return (
              <div key={t.id} style={{ marginLeft: gutter + depth * indent }} className="animate-in fade-in duration-200 motion-reduce:animate-none">
                <div
                  ref={(el) => { el ? cardRefs.current.set(t.id, el) : cardRefs.current.delete(t.id); }}
                  onClickCapture={(ev) => {
                    if (selected !== t.id) { ev.preventDefault(); ev.stopPropagation(); setSelected(t.id); }
                  }}
                  onClick={(ev) => ev.stopPropagation()}
                  className={cn(
                    "rounded-[var(--radius-card,1.25rem)] transition-shadow",
                    selected === t.id && "ring-2 ring-blue-3",
                    flash === t.id && "ring-2 ring-blue-2",
                  )}
                >
                  {renderCard(t)}
                </div>
                {(childCount > 0 || blocked || hidden.length > 0 || filtered.length > 0) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11.5px]" onClick={(e) => e.stopPropagation()}>
                    {childCount > 0 && (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-label={open ? `收起 ${t.no} 的子工单` : `展开 ${t.no} 的子工单`}
                        onClick={() => toggle(t.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 font-medium text-foreground"
                      >
                        {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
                        子工单 {doneChildren}/{childCount} 已完成
                      </button>
                    )}
                    {blocked && (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <AlertCircle className="size-3.5" /> 前置未完成，暂不可完成
                      </span>
                    )}
                    {hidden.length > 0 && (
                      <button type="button" onClick={() => { const h = hidden[0]!; reveal(h.from === t.id ? h.to : h.from); }} className="inline-flex items-center gap-1 text-blue-1 underline-offset-2 hover:underline">
                        <EyeOff className="size-3.5" /> 有依赖工单被折叠 · 展开
                      </button>
                    )}
                    {filtered.length > 0 && (
                      <button type="button" onClick={onShowAll} className="inline-flex items-center gap-1 text-muted-foreground underline-offset-2 hover:underline">
                        依赖工单不在当前结果中 · 查看
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
