import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, RefreshCw, FolderKanban, Database, FileBarChart, MoreHorizontal, Bell, LayoutGrid } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Donut, Stat, Avatar, Legend } from "@/components/Bits";
import { MonthBars } from "@/components/MonthBars";
import { Tag } from "@/components/Tag";
import { stageChips, ticketStatusSegments, projectMonthly, projectYears } from "@/data/mock";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "后台管理 · 工单与项目看板" },
      { name: "description", content: "工单状态监测与跨项目看板：总量、待处理、解决率与项目阶段分布一览。" },
      { property: "og:title", content: "后台管理 · 工单与项目看板" },
      { property: "og:description", content: "工单状态监测与跨项目看板：总量、待处理、解决率与项目阶段分布一览。" },
    ],
  }),
  component: Admin,
});


function SectionTitle({ title, to, action }: { title: string; to?: string; action?: string }) {
  return (
    <div className="mb-2 mt-6 flex items-center gap-2 px-1">
      <span className="h-4 w-1 rounded-full bg-mint" />
      <h2 className="text-[14px] font-bold">{title}</h2>
      {to ? (
        <Link
          to={to}
          className="ml-auto flex items-center text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          {action ?? "查看明细"} <ChevronRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function WelcomeHeader() {
  return (
    <section className="mb-2 flex items-center justify-between px-1">
      <div className="flex items-center gap-3">
        <Avatar name="管" tone="mint" className="size-11 text-[15px]" />
        <div>
          <div className="text-[13px] leading-tight text-muted-foreground">Hello,</div>
          <div className="text-[17px] font-bold leading-tight tracking-tight text-foreground">
            管理员
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="通知"
          className="relative grid size-10 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-rose" />
        </button>
        <button
          type="button"
          aria-label="菜单"
          className="grid size-10 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <LayoutGrid className="size-[18px]" />
        </button>
      </div>
    </section>
  );
}

function Admin() {
  return (
    <PageShell title="后台管理">
      <WelcomeHeader />
      <SectionTitle title="工单状态监测" to="/tasks" />
      <section className="surface-card p-4">
        <div className="flex items-center gap-4">
          <Donut
            segments={[
              { value: 24, tone: "mint" },
              { value: 8, tone: "sky" },
              { value: 2, tone: "mint" },
              { value: 1, tone: "sky" },
            ]}
          />
          <div className="grid flex-1 grid-cols-2 gap-4">
            <Stat value={35} label="总工单数" tone="mint" />
            <Stat value={24} label="待处理" tone="sky" />
            <Stat value={0} label="超时工单" tone="mint" />
            <Stat value="6%" label="解决率" tone="sky" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-3">
          {ticketChips.map((c) => (
            <Tag key={c.label} tone={c.tone}>
              {c.label} {c.count}
            </Tag>
          ))}
        </div>
      </section>

      <SectionTitle title="跨项目看板" to="/projects" />
      <section className="surface-card p-4">
        <div className="flex items-center">
          <h3 className="text-[13px] font-semibold text-muted-foreground">调度项目看板</h3>
          <button className="ml-auto flex items-center gap-1 rounded-full bg-gray-soft px-3 py-1.5 text-[11.5px] font-medium text-gray">
            <RefreshCw className="size-3.5" /> 同步最新数据
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Donut
            segments={[
              { value: 21, tone: "gray" },
              { value: 18, tone: "gray-light" },
              { value: 16, tone: "gray-dark" },
              { value: 13, tone: "gray" },
              { value: 10, tone: "gray-light" },
              { value: 4, tone: "gray-dark" },
            ]}
          />
          <div className="grid flex-1 grid-cols-2 gap-4">
            <Stat value={106} label="项目总数" tone="gray" />
            <Stat value={0} label="本月新增" tone="gray" />
            <Stat value={0} label="风险项目" tone="gray" />
            <Stat value={3} label="对接人缺省" tone="gray" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/70 pt-3">
          {stageChips.map((c) => (
            <Tag key={c.label} tone="gray">
              {c.label} {c.count}
            </Tag>
          ))}
        </div>

        <h3 className="mt-5 text-[13px] font-semibold text-muted-foreground">项目紧急度看板</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { v: 69, l: "重要紧急", tone: "gray" },
            { v: 37, l: "重要不紧急", tone: "gray-light" },
            { v: 0, l: "紧急不重要", tone: "gray-dark" },
            { v: 0, l: "不重要不紧急", tone: "gray" },
          ].map((x) => (
            <div
              key={x.l}
              className="rounded-2xl px-3 py-3 text-center"
              style={{
                background: `color-mix(in oklab, var(--${x.tone}) 12%, var(--card))`,
              }}
            >
              <div className="text-[20px] font-bold" style={{ color: `var(--${x.tone})` }}>
                {x.v}
              </div>
              <div className="text-[11px] text-muted-foreground">{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle title="更多功能" />
      <section className="grid grid-cols-4 gap-2">
        {[
          { label: "项目管理", icon: FolderKanban, to: "/projects", tone: "butter" },
          { label: "数据管理", icon: Database, to: "/projects", tone: "sky" },
          { label: "日报周报", icon: FileBarChart, to: "/tasks", tone: "lilac" },
          { label: "其他", icon: MoreHorizontal, to: "/tasks", tone: "mint" },
        ].map(({ label, icon: Icon, to, tone }) => (
          <Link key={label} to={to} className="surface-card flex flex-col items-center gap-2 py-4">
            <span
              className="grid size-10 place-items-center rounded-2xl"
              style={{
                background: `color-mix(in oklab, var(--${tone}) 18%, var(--card))`,
                color: `var(--${tone})`,
              }}
            >
              <Icon className="size-4.5" />
            </span>
            <span className="text-[11.5px] text-muted-foreground">{label}</span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
