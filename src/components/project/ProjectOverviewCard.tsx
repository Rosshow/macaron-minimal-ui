import { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProjectOverview = {
  client: string;
  wecomId: string;
  manager: string;
  contact: string;
  progress: number;
  deployAt: string;
  nearDelivery: string;
  finalDelivery: string;
  tags: string[];
  urgent: string;
  agvCount: string;
  uspVersion: string;
  aiSummary: string;
};

export function ProjectOverviewCard({
  projectCode,
  projectName,
  overview,
}: {
  projectCode: string;
  projectName: string;
  overview: ProjectOverview;
}) {
  const [summary, setSummary] = useState({ name: projectName, ...overview });
  const [expanded, setExpanded] = useState(false);

  function edit(key: "name" | "client" | "manager" | "contact" | "agvCount" | "uspVersion", label: string) {
    const value = window.prompt(`修改${label}`, summary[key]);
    if (value?.trim()) setSummary((current) => ({ ...current, [key]: value.trim() }));
  }

  return (
    <section className="surface-card overflow-hidden p-4">
      <h2 className="mb-3 border-b border-border/70 pb-2.5 text-[14px] font-semibold">项目概况</h2>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] text-muted-foreground">项目名称</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <h3 className="min-w-0 text-[17px] font-bold leading-6">{summary.name}</h3>
            <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => edit("name", "项目名称")} aria-label="修改项目名称">
              <Pencil className="size-3.5" />
            </Button>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>项目编号</span><span>{projectCode}</span>
          </div>
          <div className="text-[10.5px] text-muted-foreground">· 企业微信记录ID: {summary.wecomId}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background">{summary.urgent} ›</span>
        </div>
      </div>

      <div className="mt-3 divide-y divide-border/70">
        <div className="flex min-h-10 items-center justify-between gap-3 py-2">
          <span className="text-[11px] text-muted-foreground">客户信息</span>
          <Button type="button" variant="ghost" size="sm" className="gap-2 px-1 text-[12.5px] text-foreground" onClick={() => edit("client", "客户信息")}>
            <span>{summary.client}</span><Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 py-2">
          {([["manager", "项目经理"], ["contact", "对接人"]] as const).map(([key, label]) => (
            <div key={key} className="flex min-h-10 flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <Button type="button" variant="ghost" size="sm" className="h-auto justify-start gap-2 px-0 py-0 text-[12.5px] text-foreground" onClick={() => edit(key, label)}>
                <span className="truncate">{summary[key]}</span><Pencil className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">项目时间进度</span>
          <span className="font-semibold text-primary">{summary.progress}%</span>
        </div>
        <progress
          className="project-progress mt-1.5 block h-1.5 w-full overflow-hidden rounded-full"
          max={100}
          value={Math.min(100, Math.max(0, summary.progress))}
          aria-label="项目时间进度"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/70 pt-3">
        {([["部署时间", summary.deployAt], ["近期交付", summary.nearDelivery], ["最终交付", summary.finalDelivery]] as const).map(([label, value]) => (
          <div key={label} className="min-w-0">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="mt-0.5 truncate text-[11.5px] font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 items-end gap-3 border-t border-border/70 pt-3">
        {([["agvCount", "AGV 数量"], ["uspVersion", "USP 版本"]] as const).map(([key, label]) => (
          <div key={key} className="min-w-0">
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto justify-start gap-1.5 px-0 py-0 text-[12.5px] font-semibold text-foreground"
              onClick={() => edit(key, label)}
            >
              <span className="truncate">{summary[key]}</span>
              <Pencil className="size-3 shrink-0 text-muted-foreground" />
            </Button>
          </div>
        ))}
        <Button size="sm" className="w-full gap-1.5 bg-primary text-[11.5px] text-primary-foreground hover:bg-primary/90">
          <BarChart3 className="size-3.5" />搬运效率分析
        </Button>
      </div>

      <div className="mt-3 rounded-xl bg-blue-soft/60 p-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-blue-2" />
          <span className="text-[12px] font-semibold">AI 项目摘要</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1 px-2 text-[11px] text-muted-foreground"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "收起" : "展开"}
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </div>
        <p className={expanded ? "mt-1.5 text-[12px] leading-5 text-foreground" : "mt-1.5 line-clamp-2 text-[12px] leading-5 text-foreground"}>
          {summary.aiSummary}
        </p>
      </div>
    </section>
  );
}
