import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal, ArrowRight, Calendar } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { Avatar } from "@/components/Bits";
import { tickets, kindTone, priorityTone, statusTone } from "@/data/mock";
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

const filters = ["全部", "项目相关", "待我处理", "与我相关", "新建", "进行中", "已挂起", "已解决"];
const sorts = ["紧急优先", "创建时间", "更新时间"];

function Tasks() {
  const [filter, setFilter] = useState("全部");
  const [sort, setSort] = useState("紧急优先");

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

      <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
        <button className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[12px] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" /> 筛选
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {tickets.map((t) => (
          <Link key={t.id} to="/tickets/$id" params={{ id: t.id }} className="block">
            <article className="surface-card p-4 transition-transform duration-300 active:scale-[0.99]">
              <div className="flex items-center gap-2">
                <Tag tone={statusTone[t.status]}>{t.status}</Tag>
                <Tag tone={priorityTone[t.priority]}>{t.priority}</Tag>
                <Tag tone={kindTone[t.kind]} className="ml-auto">
                  {t.kind}
                </Tag>
              </div>
              <h3 className="mt-2.5 text-[15px] font-bold leading-6">{t.title}</h3>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={t.reporter} tone="blue-3" />
                <div className="leading-tight">
                  <div className="text-[10px] text-muted-foreground">发起人</div>
                  <div className="text-[12.5px] font-medium">{t.reporter}</div>
                </div>
                <ArrowRight className="mx-auto size-4 text-blue-3" />
                <div className="text-right leading-tight">
                  <div className="text-[10px] text-muted-foreground">处理人</div>
                  <div className="text-[12.5px] font-medium">{t.owner}</div>
                </div>
                <Avatar name={t.owner} tone="blue-2" />
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
        ))}
      </div>
    </PageShell>
  );
}
