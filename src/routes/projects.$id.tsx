import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { FieldRow, MetaRow, SectionCard } from "@/components/ProjectDetailBits";
import { projectDetail, projectLifecycleStages } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "项目详情 · 摇人吧" },
      {
        name: "description",
        content: "查看单个项目的基础画像、生命周期阶段、责任体系与风险管理信息。",
      },
      { property: "og:title", content: "项目详情 · 摇人吧" },
      {
        property: "og:description",
        content: "查看单个项目的基础画像、生命周期阶段、责任体系与风险管理信息。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const p = projectDetail;
  const currentIndex = projectLifecycleStages.indexOf(p.stage);

  return (
    <PageShell title="项目详情" back>
      {/* 同步条 */}
      <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2">
        <RefreshCw className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[11.5px] font-medium text-foreground">企业微信实时数据</span>
        <span className="truncate text-[11px] text-muted-foreground">
          上次同步 {p.syncedAt} · 每5分钟自动刷新
        </span>
        <button type="button" className="ml-auto shrink-0 text-[11.5px] font-semibold text-blue-2">
          立即同步
        </button>
      </div>

      {/* 概览卡 */}
      <SectionCard className="mt-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-muted-foreground">项目名称</div>
            <h1 className="mt-1 text-[16px] font-bold leading-6">{p.name}</h1>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              项目编号：{p.code} · 企业微信记录ID：{p.wecomId}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {p.tags.map((t) => (
              <Tag key={t} tone="muted">
                {t}
              </Tag>
            ))}
            <Tag tone="blue">{p.urgent}</Tag>
          </div>
        </div>

        <div className="mt-3">
          <MetaRow label="项目经理" value={p.manager} />
          <MetaRow label="对接人" value={p.contact} strong />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-muted-foreground">项目时间进度</span>
            <span className="font-semibold text-blue-2">{p.progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-blue-2"
              style={{ width: `${p.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: "部署时间", v: p.deployAt },
            { l: "近期交付", v: p.nearDelivery },
            { l: "最终交付", v: p.finalDelivery },
          ].map((x) => (
            <div key={x.l}>
              <div className="text-[11px] text-muted-foreground">{x.l}</div>
              <div className="mt-0.5 text-[13px] font-semibold tabular-nums">{x.v}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 基础画像 */}
      <SectionCard title="项目基础画像" className="mt-3">
        {p.basics.map((f) => (
          <FieldRow key={f.label} label={f.label} value={f.value} kind={f.kind} />
        ))}
      </SectionCard>

      {/* 生命周期 */}
      <SectionCard title="项目生命周期" className="mt-3">
        <FieldRow label="项目阶段" value={p.stage} kind="select" />
        <ol className="mt-4">
          {projectLifecycleStages.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={s} className="relative flex items-center gap-3 pb-4 last:pb-0">
                {i < projectLifecycleStages.length - 1 ? (
                  <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border" />
                ) : null}
                <span
                  className={cn(
                    "z-10 grid size-[26px] shrink-0 place-items-center rounded-full",
                    done && "bg-foreground text-background",
                    active && "border-[3px] border-blue-2 bg-card",
                    !done && !active && "bg-secondary",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <span
                  className={cn(
                    "text-[13px]",
                    active ? "font-bold text-foreground" : done ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {done ? "已完成" : active ? "进行中" : "待开始"}
                </span>
                <button
                  type="button"
                  className="ml-auto shrink-0 rounded-md bg-secondary/70 px-2 py-1 text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary"
                >
                  + 补充说明
                </button>
              </li>
            );
          })}
        </ol>
      </SectionCard>

      {/* 责任体系 */}
      <SectionCard title="责任体系" className="mt-3">
        {p.duty.map((f) => (
          <FieldRow key={f.label} label={f.label} value={f.value} kind={f.kind} />
        ))}
      </SectionCard>

      {/* 风险管理 */}
      <SectionCard title="风险管理" className="mt-3">
        {p.risk.map((f) => (
          <FieldRow key={f.label} label={f.label} value={f.value} kind={f.kind} />
        ))}
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] text-muted-foreground">项目文档</div>
          <button
            type="button"
            className="grid size-[76px] place-items-center rounded-lg bg-secondary/70 transition-colors hover:bg-secondary"
            aria-label="上传项目文档"
          >
            <Plus className="size-5 text-muted-foreground" />
          </button>
        </div>
      </SectionCard>

      <Link
        to="/projects/auth/$id"
        params={{ id: p.code }}
        className="surface-card mt-3 flex items-center gap-2 p-4 transition-shadow hover:shadow-md"
      >
        <KeyRound className="size-4 text-muted-foreground" />
        <span className="text-[13px] font-semibold">项目授权管理</span>
        <span className="text-[11px] text-muted-foreground">licences · 人员</span>
        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
      </Link>
    </PageShell>
  );
}
