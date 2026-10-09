import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowRight, ArrowDown, Calendar, Minus, Plus, Star } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Avatar, AvatarStack } from "@/components/Bits";
import { tickets as baseTickets, type Ticket } from "@/data/mock";
import { relationTickets } from "@/data/task-relations";
import { buildFlatRefs, buildRelationRows, parentIds, type DepRef, type RelationRow } from "@/lib/task-graph";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "系统任务 · 摇人吧工单台" },
      { name: "description", content: "按紧急度排序查看全部工单任务，快速定位待处理与我相关的工单。" },
      { property: "og:title", content: "系统任务 · 摇人吧工单台" },
      { property: "og:description", content: "按紧急度排序查看全部工单任务，快速定位待处理与我相关的工单。" },
    ],
  }),
  component: Tasks,
});

const ME = "张俊磊";
const tickets: Ticket[] = [...relationTickets, ...baseTickets];
const filters = ["全部", "项目相关", "待我处理", "与我相关", "新建", "进行中", "已挂起", "已解决"];
const sorts = ["紧急优先", "创建时间", "更新时间"];

const priorityRank: Record<Ticket["priority"], number> = { 紧急: 0, 高: 1, 中: 2, 低: 3 };

/** 状态文字色：唯一保留色彩的文本 */
const statusText: Record<Ticket["status"], string> = {
  新建: "text-blue-3",
  待处理: "text-blue-3",
  处理中: "text-blue-2",
  进行中: "text-blue-2",
  已解决: "text-blue-1",
  已关闭: "text-muted-foreground",
  已取消: "text-muted-foreground",
};

function matches(t: Ticket, f: string) {
  switch (f) {
    case "全部":
      return true;
    case "项目相关":
      return t.project.includes("项目");
    case "待我处理":
      return t.owner === ME;
    case "与我相关":
      return t.owner === ME || t.reporter === ME || t.participants.includes(ME.slice(0, 1));
    case "已挂起":
      return t.status === "已关闭" || t.status === "已取消";
    default:
      return t.status === f;
  }
}

function DepRefLine({ t, dep }: { t: Ticket; dep: DepRef }) {
  const link = (x: Ticket) => (
    <Link
      to="/tickets/$id"
      params={{ id: x.id }}
      onClick={(e) => e.stopPropagation()}
      aria-label={`打开工单 ${x.no} ${x.title}`}
      className="relative z-10 -my-1 px-0.5 py-1 font-semibold text-primary hover:underline"
    >
      {x.no}
    </Link>
  );
  const dim = "text-muted-foreground/70";
  return (
    <span
      className="flex min-w-0 items-center gap-0.5 overflow-hidden whitespace-nowrap text-[11px] tabular-nums"
      aria-label="依赖关系"
    >
      {dep.prevMore ? <span className={dim}>…</span> : null}
      {dep.prev ? link(dep.prev) : null}
      {dep.prev || dep.prevMore ? <span className={dim}>→</span> : null}
      <span className="font-medium text-muted-foreground">{t.no}</span>
      {dep.next || dep.nextMore ? <span className={dim}>→</span> : null}
      {dep.next ? link(dep.next) : null}
      {dep.nextMore ? <span className={dim}>…</span> : null}
    </span>
  );
}

type CardProps = {
  t: Ticket;
  dep?: DepRef | null | undefined;
  followed: boolean;
  onFollow: () => void;
  toggle?: { expanded: boolean; onToggle: () => void } | undefined;
  childSummary?: { done: number; total: number } | undefined;
};

function TicketCard({ t, dep, followed, onFollow, toggle, childSummary }: CardProps) {
  const priorityClasses: Record<Ticket["priority"], string> = {
    紧急: "bg-blue-1 text-white",
    高: "bg-blue-2 text-white",
    中: "bg-blue-3 text-foreground",
    低: "bg-blue-5 text-foreground",
  };

  return (
    <article className="surface-card @container relative p-4 transition-transform duration-300 active:scale-[0.99]">
      <div className="mb-2 grid grid-cols-2 items-center gap-x-2 gap-y-1 @min-[380px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="order-1 flex items-center gap-2">
        {toggle ? (
          <button
            type="button"
            aria-expanded={toggle.expanded}
            aria-label={toggle.expanded ? `收起 ${t.no} 的子工单` : `展开 ${t.no} 的子工单`}
            onClick={(e) => {
              e.stopPropagation();
              toggle.onToggle();
            }}
            className="relative z-10 grid size-6 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground"
          >
            {toggle.expanded ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
          </button>
        ) : null}
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold",
            statusText[t.status],
          )}
        >
          {t.status}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11.5px] font-medium",
            priorityClasses[t.priority],
          )}
        >
          {t.priority}
        </span>
        </div>
        <div className="order-3 col-span-2 flex min-w-0 justify-center @min-[380px]:order-2 @min-[380px]:col-span-1">
          {dep ? <DepRefLine t={t} dep={dep} /> : null}
        </div>
        <div className="order-2 flex min-w-0 items-center justify-end gap-2 @min-[380px]:order-3">
          <span className={cn("shrink-0 text-[11.5px] text-muted-foreground", dep && "hidden sm:inline")}>
            {t.kind}
          </span>
          <button
            type="button"
            aria-pressed={followed}
            aria-label={followed ? `取消关注 ${t.no}` : `关注 ${t.no}`}
            onClick={(e) => {
              e.stopPropagation();
              onFollow();
            }}
            className="relative z-10 -m-1 shrink-0 p-1 text-muted-foreground"
          >
            <Star className={cn("size-4", followed && "fill-current text-blue-2")} />
          </button>
        </div>
      </div>

      <h3 className="text-[19px] font-bold leading-tight tracking-tight text-foreground">
        <Link
          to="/tickets/$id"
          params={{ id: t.id }}
          className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none"
        >
          {t.title}
        </Link>
      </h3>

      <div className="mt-3 flex items-center gap-2">
        <Avatar name={t.reporter} plain size="md" className="bg-gray-light text-white" />
        <span className="text-[12px] font-medium text-foreground">{t.reporter}</span>

        <div className="mx-auto flex items-center gap-1.5">
          <AvatarStack names={t.participants} avatarClassName="bg-gray-soft text-muted-foreground ring-2 ring-card" />
          <ArrowRight className="size-3.5 text-muted-foreground" />
        </div>

        <span className="text-[12px] font-medium text-foreground">{t.owner}</span>
        <Avatar name={t.owner} plain size="md" className="bg-gray-light text-white" />
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{t.no}</span>
        <span className="truncate">{t.project}</span>
        {childSummary ? (
          <span className="shrink-0">
            子工单 {childSummary.done}/{childSummary.total} 已完成
          </span>
        ) : null}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <Calendar className="size-3" />
          {t.date}
        </span>
      </div>
    </article>
  );
}

function RelationList({
  rows,
  collapsed,
  onToggle,
  followed,
  onFollow,
}: {
  rows: RelationRow[];
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  followed: Set<string>;
  onFollow: (id: string) => void;
}) {
  return (
    <div className="mt-1">
      {rows.map((r) => {
        const depth = Math.min(r.depth, 4);
        return (
          <div
            key={r.ticket.id}
            style={{ "--d": depth } as React.CSSProperties}
            className="pl-[calc(var(--d)*24px)] animate-in fade-in duration-200 motion-reduce:animate-none md:pl-[calc(var(--d)*36px)]"
          >
            {r.arrowFromPrev ? (
              <div className="flex h-5 items-center justify-center" aria-label="前置工单 → 后置工单">
                <ArrowDown className="size-3.5 text-muted-foreground/70" />
              </div>
            ) : (
              <div className="h-3" />
            )}
            <TicketCard
              t={r.ticket}
              dep={r.ref}
              followed={followed.has(r.ticket.id)}
              onFollow={() => onFollow(r.ticket.id)}
              toggle={
                r.childCount
                  ? { expanded: !collapsed.has(r.ticket.id), onToggle: () => onToggle(r.ticket.id) }
                  : undefined
              }
              childSummary={r.childCount ? { done: r.childDone, total: r.childCount } : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

function Timeline({
  items,
  cardExtras,
}: {
  items: Ticket[];
  cardExtras: (t: Ticket) => Omit<CardProps, "t">;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Ticket[]>();
    for (const t of items) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({
        date,
        list: [...list].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]),
      }));
  }, [items]);

  return (
    <div className="mt-3">
      {groups.map((g, gi) => (
        <div key={g.date} className={cn(gi > 0 && "border-t border-dashed border-border pt-4")}>
          <div className="flex gap-3">
            <div className="relative w-12 shrink-0 pt-1 text-right">
              <div className="text-[13px] font-semibold tabular-nums text-muted-foreground">
                {g.date.slice(5).replace("-", "-")}
              </div>
              <div className="text-[10px] text-muted-foreground/70">{g.date.slice(0, 4)}</div>
              <span className="absolute -right-[7px] top-2.5 size-1.5 rounded-full bg-border" />
            </div>
            <div className="relative flex-1 border-l border-dashed border-border pb-4 pl-3">
              <div className="space-y-3">
                {g.list.map((t) => (
                  <TicketCard key={t.id} t={t} {...cardExtras(t)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tasks() {
  const [filter, setFilter] = useState("全部");
  const [sort, setSort] = useState("紧急优先");
  const [view, setView] = useState<"flat" | "relation">("relation");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const allParents = useMemo(() => parentIds(tickets), []);
  const toggleIn = (set: Set<string>, id: string) => {
    const n = new Set(set);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  };

  const counts = useMemo(
    () => Object.fromEntries(filters.map((f) => [f, tickets.filter((t) => matches(t, f)).length])),
    [],
  );

  const list = useMemo(() => {
    const base = tickets.filter((t) => matches(t, filter));
    if (sort === "紧急优先") {
      return [...base].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    }
    return [...base].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [filter, sort]);

  const flatRefs = useMemo(() => buildFlatRefs(tickets, list), [list]);
  const rows = useMemo(() => buildRelationRows(tickets, list, collapsed), [list, collapsed]);
  const flatExtras = (t: Ticket) => ({
    dep: flatRefs.get(t.id),
    followed: followed.has(t.id),
    onFollow: () => setFollowed((f) => toggleIn(f, t.id)),
  });

  return (
    <PageShell title="系统任务">
      <div className="surface-card flex items-center gap-2 px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="搜索工单…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-[12px] text-muted-foreground">排序</span>
        {sorts.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              sort === s ? "bg-gray-soft text-foreground" : "bg-card text-muted-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1 pt-2">
        {filters.map((f) => {
          const n = counts[f] ?? 0;
          return (
            <div key={f} className="relative shrink-0">
              <button
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                  filter === f
                    ? "bg-black text-white"
                    : "bg-card text-muted-foreground",
                )}
              >
                {f}
              </button>
              {n > 0 ? (
                <span className="pointer-events-none absolute -right-1.5 -top-1.5 grid min-w-[17px] place-items-center rounded-full bg-primary px-1 py-px text-[10px] font-bold leading-4 text-primary-foreground">
                  {n > 99 ? "99+" : n}
                </span>
              ) : null}
            </div>
          );
        })}
        <button className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" /> 筛选
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="inline-flex rounded-full bg-card p-0.5" role="group" aria-label="列表视图">
          {(
            [
              ["flat", "普通列表"],
              ["relation", "关系列表"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                view === v ? "bg-gray-soft text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {view === "relation" ? (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(new Set())}
              className="rounded-full bg-card px-3 py-1 text-[12px] text-muted-foreground"
            >
              全部展开
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(new Set(allParents))}
              className="rounded-full bg-card px-3 py-1 text-[12px] text-muted-foreground"
            >
              全部折叠
            </button>
          </div>
        ) : null}
      </div>

      {view === "relation" ? (
        <>
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            当前按工单关系组织：缩进表示归属，↓ 表示前置 → 后置。
          </p>
          <RelationList
            rows={rows}
            collapsed={collapsed}
            onToggle={(id) => setCollapsed((c) => toggleIn(c, id))}
            followed={followed}
            onFollow={(id) => setFollowed((f) => toggleIn(f, id))}
          />
        </>
      ) : filter === "待我处理" ? (
        <Timeline items={list} cardExtras={flatExtras} />
      ) : (
        <div className="mt-3 space-y-3">
          {list.map((t) => (
            <TicketCard key={t.id} t={t} {...flatExtras(t)} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
