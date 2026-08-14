import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/Shell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { projectAuthProject } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "日报周报 · 摇人吧" },
      {
        name: "description",
        content: "按项目查看日报与周报：AI 数据摘要、项目进度分析、交付节点预警、风险变化与工单统计。",
      },
      { property: "og:title", content: "日报周报 · 摇人吧" },
      {
        property: "og:description",
        content: "按项目查看日报与周报：AI 数据摘要、项目进度分析、交付节点预警、风险变化与工单统计。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reports,
});

type ProjectOption = { name: string; code: string };

const ALL: ProjectOption = { name: "全部项目", code: "all" };

const projectOptions: ProjectOption[] = [
  ALL,
  { name: "安徽合肥赛美中储混场项目", code: "17" },
  projectAuthProject,
  { name: "广东佛山美的智慧工厂项目", code: "35" },
  { name: "上海临港特斯拉物流项目", code: "42" },
];

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <h3 className="mt-5 flex items-baseline gap-1.5 text-[14px] font-semibold text-foreground first:mt-0">
      <span className="text-muted-foreground">{index}、</span>
      {title}
    </h3>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-foreground/85">
          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span className="min-w-0 flex-1">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Reports() {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [project, setProject] = useState<ProjectOption>(projectOptions[1]!);
  const [pickerOpen, setPickerOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }, []);

  const periodLabel = tab === "daily" ? "日报" : "周报";
  const rangeLabel = tab === "daily" ? today : `${today} 当周`;

  const statusRows = [
    ["新建", 0],
    ["处理中", 0],
    ["待处理", 0],
    ["已解决", 0],
    ["已关闭", 0],
  ] as const;

  return (
    <PageShell title="日报周报" back>
      {/* 视图切换 */}
      <div className="surface-card grid grid-cols-2 overflow-hidden">
        {([
          { key: "daily", label: "日报视图" },
          { key: "weekly", label: "周报视图" },
        ] as const).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="relative py-3 text-[13.5px] font-medium transition-colors"
          >
            <span className={cn(tab === t.key ? "text-blue-2" : "text-muted-foreground")}>
              {t.label}
            </span>
            {tab === t.key && (
              <span className="absolute bottom-0 left-1/2 h-[2.5px] w-6 -translate-x-1/2 rounded-full bg-blue-2" />
            )}
          </button>
        ))}
      </div>

      {/* 项目选择 */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="surface-card mt-3 flex w-full items-center gap-2 px-4 py-3.5 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-foreground">
          {project.name}
        </span>
        {project.code !== "all" && (
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
            #{project.code}
          </span>
        )}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {/* 日期条 */}
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-blue-soft px-4 py-3">
        <CalendarDays className="size-4 text-blue-2" />
        <span className="flex-1 text-[13.5px] font-semibold text-blue-2 tabular-nums">
          {rangeLabel}
        </span>
        <button
          type="button"
          onClick={() => toast.success("已刷新报告数据")}
          className="flex items-center gap-1 rounded-md bg-card px-2.5 py-1 text-[11.5px] font-medium text-blue-2"
        >
          <RefreshCw className="size-3.5" />
          刷新
        </button>
      </div>

      {/* 报告正文 */}
      <article className="surface-card mt-3 px-4 py-4">
        <h2 className="text-[14.5px] font-semibold text-foreground">
          {periodLabel} · {rangeLabel} · {project.name}
        </h2>

        <SectionTitle index="一" title="AI 数据摘要" />
        <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
          本报告统计范围为{project.code === "all" ? "全部项目" : `指定项目「${project.code}」${project.name}`}。
          截至目前，该项目新增工单 0 条，其中 Bug 类问题占比 0%；解决工单 0 条，工单解决率 0%。
          项目当前状态为正在实施，共关联 1 个项目，该项目推进状态需进一步关注。当日无新增风险、无新增工单，各项运营指标处于低活跃状态。
        </p>

        <SectionTitle index="二" title="项目进度分析" />
        <p className="mt-2 text-[12.5px] text-foreground/85">项目总数：1 个</p>
        <Bullets
          items={[
            <>
              活跃项目：1 个（正在实施中）
              <div className="mt-1 pl-3 text-muted-foreground">· {project.name}</div>
            </>,
            "已完成项目：0 个",
            "暂停项目：0 个",
          ]}
        />

        <SectionTitle index="三" title="重点项目当日进展" />
        <div className="mt-2 rounded-xl border border-border bg-secondary/40 px-3 py-3">
          <div className="text-[12.5px] font-semibold text-foreground">
            {project.name}
            <span className="ml-2 font-normal text-muted-foreground">
              阶段：实施 | 更新时间：{today}
            </span>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">
            进度判断：需关注。该项目部署日期为 2025-12-12，最近一次交付内容为 11 台自研 XQC-161，
            最近交付日期为 2026-08-07，交付已过 1 周，但本次统计周期内无日程更新信息，需确认交付验收进展。
            项目分类为「重要紧急」，建议持续跟踪实施状态。
          </p>
        </div>

        <SectionTitle index="四" title="临近交付节点预警" />
        <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">
          当前无临近交付节点。项目最近交付日期为 2026-08-07，已超过当日日期（{today}），
          但该项目在本次统计范围内无明确的未来 7 天内交付节点记录。
        </p>

        <SectionTitle index="五" title="风险变化" />
        <Bullets
          items={[
            "当日新增风险：0 条",
            "当日关闭风险：0 条",
            "按风险等级分布：高 0 条 / 中 0 条 / 低 0 条",
            "高优先级风险提示：无",
          ]}
        />

        <SectionTitle index="六" title="工单数据统计" />
        <Bullets
          items={[
            "当日新增工单：0 条",
            "已解决工单：0 条",
            "已关闭工单：0 条",
            "待处理工单：0 条",
            "逾期工单：0 条",
            "工单解决率：0%",
          ]}
        />

        <p className="mt-4 text-[12px] text-muted-foreground">工单状态分布：</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-secondary/60 text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">状态</th>
                <th className="px-3 py-2 text-left font-medium">数量</th>
              </tr>
            </thead>
            <tbody>
              {statusRows.map(([s, n]) => (
                <tr key={s} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground/85">{s}</td>
                  <td className="px-3 py-2 text-foreground/85 tabular-nums">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-[15px]">选择项目</SheetTitle>
          </SheetHeader>
          <ul className="mt-1 space-y-1.5">
            {projectOptions.map((p) => {
              const active = project.code === p.code;
              return (
                <li key={p.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setProject(p);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-colors",
                      active ? "border-blue-2/50 bg-blue-soft" : "border-border bg-card",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {p.name}
                    </span>
                    {p.code !== "all" && (
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        #{p.code}
                      </span>
                    )}
                    {active && <Check className="size-4 shrink-0 text-blue-2" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
