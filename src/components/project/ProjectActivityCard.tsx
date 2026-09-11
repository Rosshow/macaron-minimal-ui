import { ArrowRight, GitBranch, History, Milestone } from "lucide-react";
import { projectKeyChanges, projectStageChanges, projectTicketMonthly, projectVersionChanges } from "@/data/mock";

export function ProjectActivityCard() {
  const max = Math.max(...projectTicketMonthly.map((item) => item.value), 1);

  return (
    <section className="surface-card overflow-hidden p-4">
      <h2 className="mb-3 border-b border-border/70 pb-2.5 text-[14px] font-semibold">项目动态</h2>

      <div className="flex items-center gap-1.5 text-[12px] font-semibold">
        <GitBranch className="size-3.5 text-blue-2" />调度版本变更
      </div>
      <ol className="mt-2 space-y-2 border-l border-border/70 pl-3">
        {projectVersionChanges.map((item) => (
          <li key={item.version} className="relative">
            <span className="absolute -left-[15px] top-1.5 size-1.5 rounded-full bg-blue-2" aria-hidden />
            <div className="flex items-baseline gap-2">
              <span className="text-[12.5px] font-semibold">{item.version}</span>
              <span className="text-[10.5px] text-muted-foreground">{item.time}</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground">{item.note}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold">
        <History className="size-3.5 text-blue-2" />关键变动
      </div>
      <ul className="mt-2 space-y-1.5">
        {projectKeyChanges.map((item) => (
          <li
            key={`${item.time}-${item.text}`}
            className="flex items-center gap-2 rounded-lg bg-secondary/60 px-2.5 py-2 text-[11.5px]"
          >
            <span className="shrink-0 font-semibold text-blue-2">{item.kind}</span>
            <span className="min-w-0 flex-1 truncate">{item.text}</span>
            <span className="shrink-0 text-muted-foreground">{item.operator}</span>
            <span className="shrink-0 text-[10.5px] text-muted-foreground">{item.time}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold">工单增加变化趋势</div>
      <div className="mt-2 flex h-28 items-end gap-2">
        {projectTicketMonthly.map((item) => (
          <div key={item.key} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] tabular-nums text-muted-foreground">{item.value}</span>
            <span
              className="w-full rounded-md bg-blue-soft"
              style={{ height: `${Math.max(6, (item.value / max) * 72)}px` }}
              aria-hidden
            />
            <span className="text-[10px] text-muted-foreground">{item.month} 月</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold">
        <Milestone className="size-3.5 text-blue-2" />项目阶段变化
      </div>
      <ul className="mt-2 space-y-1.5">
        {projectStageChanges.map((item) => (
          <li key={item.time} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-2.5 py-2 text-[11.5px]">
            <span className="text-muted-foreground">{item.from}</span>
            <ArrowRight className="size-3.5 text-blue-2" />
            <span className="font-semibold">{item.to}</span>
            <span className="ml-auto text-[10.5px] text-muted-foreground">{item.time}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
