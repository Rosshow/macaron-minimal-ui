import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ArrowRight, Calendar } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Avatar, AvatarStack } from "@/components/Bits";
import { tickets, type Ticket } from "@/data/mock";
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
const filters = ["全部", "项目相关", "待我处理", "与我相关", "新建", "进行中", "已挂起", "已解决"];
const sorts = ["紧急优先", "创建时间", "更新时间"];

const priorityRank: Record<Ticket["priority"], number> = { 紧急: 0, 高: 1, 中: 2, 低: 3 };

/** 状态文字色：唯一保留色彩的文本 */
const statusText: Record<Ticket["status"], string> = {
  新建: "text-blue-3",
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

function TicketCard({ t }: { t: Ticket }) {
  return (
    <Link to="/tickets/$id" params={{ id: t.id }} className="block">
      <article className="surface-card p-4 transition-transform duration-300 active:scale-[0.99]">
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className={cn("font-semibold", statusText[t.status])}>{t.status}</span>
          <span className="text-muted-foreground">{t.priority}</span>
          <span className="ml-auto text-muted-foreground">{t.kind}</span>
        </div>

        <h3 className="mt-2 text-[16px] font-semibold leading-6 tracking-tight text-foreground">
          {t.title}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <Avatar name={t.reporter} plain size="sm" />
          <div className="leading-tight">
            <div className="text-[10px] text-muted-foreground">发起人</div>
            <div className="text-[12px] font-medium text-foreground">{t.reporter}</div>
          </div>

          <div className="mx-auto flex items-center gap-1.5">
            <AvatarStack names={t.participants} />
            <ArrowRight className="size-3.5 text-muted-foreground/70" />
          </div>

          <div className="text-right leading-tight">
            <div className="text-[10px] text-muted-foreground">处理人</div>
            <div className="text-[12px] font-medium text-foreground">{t.owner}</div>
          </div>
          <Avatar name={t.owner} plain size="sm" />
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">{t.no}</span>
          <span className="truncate">{t.project}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <Calendar className="size-3" />
            {t.date}
          </span>
        </div>
      </article>
    </Link>
  );
}

function Timeline({ items }: { items: Ticket[] }) {
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
                  <TicketCard key={t.id} t={t} />
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
              sort === s ? "bg-blue-soft text-blue-2" : "bg-card text-muted-foreground",
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

      {filter === "待我处理" ? (
        <Timeline items={list} />
      ) : (
        <div className="mt-3 space-y-3">
          {list.map((t) => (
            <TicketCard key={t.id} t={t} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
