import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { Stat } from "@/components/Bits";
import { projects } from "@/data/mock";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "项目进度管理 · 摇人吧" },
      { name: "description", content: "查看全部项目阶段、时间进度与任务完成情况，快速定位风险项目。" },
      { property: "og:title", content: "项目进度管理 · 摇人吧" },
      { property: "og:description", content: "查看全部项目阶段、时间进度与任务完成情况，快速定位风险项目。" },
    ],
  }),
  component: Projects,
});

function Projects() {
  return (
    <PageShell title="项目进度管理" back>
      <div className="grid grid-cols-2 gap-3">
        <div className="surface-card py-4">
          <Stat value={106} label="项目总数" tone="blue-2" />
        </div>
        <div className="surface-card py-4">
          <Stat value={86} label="活跃项目" tone="blue-3" />
        </div>
      </div>

      <div className="surface-card mt-3 flex items-center gap-2 px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="搜索项目名称"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 space-y-3">
        {projects.map((p) => (
          <Link
            key={p.name}
            to="/projects/$id"
            params={{ id: p.code }}
            className="surface-card block p-4 transition-shadow hover:shadow-md"
          >
            <h3 className="text-[14.5px] font-bold leading-6">{p.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Tag tone="blue">{p.stage}</Tag>
              <span className="text-[11.5px] text-muted-foreground">
                {p.code} · 项目经理：未指定
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
                <span>项目时间进度</span>
                <span className="font-semibold text-blue-2">{p.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${p.progress}%`,
                    background: "linear-gradient(90deg, var(--blue-2) 0%, var(--blue-4) 100%)",
                  }}
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {["任务总数", "已完成任务", "任务完成率", "切手动次数"].map((l) => (
                <div key={l} className="rounded-2xl bg-secondary/60 py-2 text-center">
                  <div className="text-[13px] font-semibold">–</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
