import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { Avatar } from "@/components/Bits";
import { tickets, kindTone } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "历史工单 · 摇人吧" },
      { name: "description", content: "检索历史工单记录，按状态筛选并查看处理人与最新进展。" },
      { property: "og:title", content: "历史工单 · 摇人吧" },
      { property: "og:description", content: "检索历史工单记录，按状态筛选并查看处理人与最新进展。" },
    ],
  }),
  component: History,
});

const tabs = ["全部", "新建", "处理中", "待处理", "已解决", "已取消", "已关闭"];

function statusForTab(label: string) {
  if (label === "全部") return null;
  if (label === "待处理") return "进行中";
  return label;
}

function History() {
  const [tab, setTab] = useState("全部");

  const counts = useMemo(() => {
    const map: Record<string, number> = { 全部: tickets.length };
    for (const t of tickets) {
      for (const label of tabs) {
        if (label === "全部") continue;
        const status = statusForTab(label);
        if (status && t.status === status) {
          map[label] = (map[label] ?? 0) + 1;
        }
      }
    }
    return map;
  }, []);

  return (
    <PageShell title="历史工单" back>
      <div className="surface-card flex items-center gap-2 px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="搜索工单标题 / 描述…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              tab === t ? "bg-foreground text-background" : "bg-card text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {tickets.map((t) => (
          <Link key={t.id} to="/tickets/$id" params={{ id: t.id }} className="block">
            <article className="surface-card p-4">
              <div className="flex items-center gap-2">
                <Tag tone={kindTone[t.kind]}>{t.kind}</Tag>
                <h3 className="flex-1 text-[14.5px] font-bold leading-6">{t.title}</h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{t.no}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{t.date}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-[12.5px] leading-6 text-muted-foreground">
                {t.desc}
              </p>
              <p className="mt-2 text-[11.5px] text-muted-foreground">所属项目 · {t.project}</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={t.reporter} tone="blue-3" />
                <div className="text-[12.5px] font-medium">{t.reporter}</div>
                <ArrowRight className="mx-auto size-4 text-blue-3" />
                <div className="text-right text-[12.5px] font-medium">{t.owner}</div>
                <Avatar name={t.owner} tone="blue-2" />
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-2.5">
                <Tag tone="blue" className="bg-secondary">
                  {t.status}
                </Tag>
                <Tag tone="blue" className="bg-secondary">
                  {t.priority}
                </Tag>
                <div className="ml-auto flex gap-2">
                  {["催办", "上报", "撤回"].map((a) => (
                    <span
                      key={a}
                      className="whitespace-nowrap rounded-md border border-border bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>

              </div>
            </article>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
