import { Link } from "@tanstack/react-router";
import { AlertTriangle, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectBlockingTicket, projectRiskCounts, projectTicketStats } from "@/data/mock";

const riskTone: Record<"高" | "中" | "低", string> = {
  高: "bg-blue-2 text-primary-foreground",
  中: "bg-blue-soft text-blue-2",
  低: "bg-secondary text-muted-foreground",
};

export function ProjectTicketsCard({ projectCode }: { projectCode: string }) {
  const stats = [
    ["全部", projectTicketStats.total],
    ["待处理", projectTicketStats.pending],
    ["处理中", projectTicketStats.processing],
    ["已关闭", projectTicketStats.closed],
  ] as const;

  return (
    <section className="surface-card overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2.5">
        <h2 className="text-[14px] font-semibold">项目工单</h2>
        <Button size="sm" variant="secondary" className="gap-1.5" asChild>
          <Link to="/projects/$id/tickets" params={{ id: projectCode }}>
            <ListTree className="size-3.5" />全部工单
          </Link>
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-secondary/60 px-2 py-2 text-center">
            <div className="text-[15px] font-bold tabular-nums">{value}</div>
            <div className="text-[10.5px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-border/70 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <AlertTriangle className="size-4 shrink-0 text-blue-2" />
            <span className="min-w-0 text-[12.5px] font-semibold">核心阻滞问题：{projectBlockingTicket.title}</span>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-blue-2">工单号 {projectBlockingTicket.no}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
          <div><span className="text-muted-foreground">提单人：</span>{projectBlockingTicket.reporter}</div>
          <div><span className="text-muted-foreground">接单人：</span>{projectBlockingTicket.owner}</div>
        </div>
        <div className="mt-2">
          <div className="text-[11px] text-muted-foreground">问题概况</div>
          <p className="mt-0.5 text-[12px] leading-5">{projectBlockingTicket.summary}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[12px] font-semibold">风险问题</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {projectRiskCounts.map((item) => (
            <div key={item.level} className={`rounded-lg px-2 py-2 text-center ${riskTone[item.level]}`}>
              <div className="text-[15px] font-bold tabular-nums">{item.count}</div>
              <div className="text-[10.5px] opacity-80">{item.level}风险</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
