import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  Paperclip,
  Send,
  Bot,
  Folder,
  AlarmClock,
  Clock,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Avatar } from "@/components/Bits";
import { tickets, type Ticket } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tickets/$id")({
  loader: ({ params }) => {
    const ticket = tickets.find((t) => t.id === params.id);
    if (!ticket) throw notFound();
    return ticket;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "工单详情"} · 摇人吧` },
      { name: "description", content: loaderData?.desc?.slice(0, 150) ?? "工单详情与讨论记录。" },
      { property: "og:title", content: `${loaderData?.title ?? "工单详情"} · 摇人吧` },
      {
        property: "og:description",
        content: loaderData?.desc?.slice(0, 150) ?? "工单详情与讨论记录。",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detail,
});

const statusText: Record<Ticket["status"], string> = {
  新建: "text-blue-3",
  处理中: "text-blue-2",
  进行中: "text-blue-2",
  已解决: "text-blue-1",
  已关闭: "text-muted-foreground",
  已取消: "text-muted-foreground",
};

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-2xl bg-secondary/70 px-3 py-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 leading-tight">
        <div className="text-[10.5px] text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-[12.5px] font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function PersonnelRow({ reporter, owner }: { reporter: string; owner: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-3 py-2.5">
      <div className="flex flex-1 items-center gap-2">
        <Avatar name={reporter} plain size="md" className="bg-gray-light text-white" />
        <div className="min-w-0 leading-tight">
          <div className="text-[10.5px] text-muted-foreground">创建人</div>
          <div className="truncate text-[12.5px] font-medium text-foreground">{reporter}</div>
        </div>
      </div>
      <div className="h-6 w-px bg-border" />
      <div className="flex flex-1 items-center gap-2">
        <Avatar name={owner} plain size="md" className="bg-gray-light text-white" />
        <div className="min-w-0 leading-tight">
          <div className="text-[10.5px] text-muted-foreground">处理人</div>
          <div className="truncate text-[12.5px] font-medium text-foreground">{owner}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card mt-3 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h3 className="truncate text-[13px] font-semibold">{title}</h3>
        {right}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Detail() {
  const t = Route.useLoaderData() as Ticket;
  const time = `${t.date.replace(/-/g, "/")} 18:07`;
  const activity = [
    `${t.date.slice(5).replace("-", "月")}日 18:07 · ${t.reporter} 创建了工单（AI 诊断）`,
    `${t.date.slice(5).replace("-", "月")}日 18:07 · 工单状态变更为「${t.status}」`,
    `${t.date.slice(5).replace("-", "月")}日 18:11 · ${t.owner} 查看了工单`,
  ];

  return (
    <PageShell title="工单详情" back>
      <section className="surface-card p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold",
                statusText[t.status],
              )}
            >
              {t.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground">
              {t.kind}
            </span>
            <span className="truncate text-[11.5px] text-muted-foreground">{t.no}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="rounded-md bg-secondary px-3 py-1.5 text-[11.5px] font-medium text-foreground">
              暂停任务
            </button>
            <button className="rounded-md bg-primary px-3 py-1.5 text-[11.5px] font-medium text-primary-foreground">
              处理完成
            </button>
          </div>
        </div>

        <h2 className="mt-2.5 text-[19px] font-bold leading-tight tracking-tight">{t.title}</h2>

        <PersonnelRow reporter={t.reporter} owner={t.owner} />

        <dl className="mt-2 grid grid-cols-2 gap-2">
          <MetaItem icon={Folder} label="所属项目" value={t.project} />
          <MetaItem icon={AlarmClock} label="最晚解决时间" value="未设置" />
          <MetaItem icon={Clock} label="创建时间" value={time} />
          <MetaItem icon={RefreshCw} label="更新时间" value={time} />
        </dl>
      </section>

      <SectionCard title="问题描述">
        <p className="text-[12.5px] leading-6 text-muted-foreground">{t.desc}</p>
      </SectionCard>

      <SectionCard
        title="工单动态"
        right={
          <button className="flex items-center text-[11.5px] text-blue-2">
            查看全部 <ChevronRight className="size-3.5" />
          </button>
        }
      >
        <ul className="max-h-[72px] space-y-1.5 overflow-hidden text-[12px] leading-5 text-muted-foreground">
          {activity.map((a) => (
            <li key={a} className="truncate">
              {a}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="讨论摘要">
        <p className="text-[12.5px] leading-6 text-muted-foreground">
          暂无摘要，U老师 将自动总结讨论进展
        </p>
      </SectionCard>

      <SectionCard title="附件（1）">
        <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-[10.5px] text-muted-foreground">
          截图.png
        </div>
      </SectionCard>

      <section className="surface-card mt-3 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="truncate text-[13px] font-semibold">讨论（1）</h3>
          <button className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
            <Bot className="size-3.5" /> 帮我分析
          </button>
        </div>

        <div className="mt-2 text-[11.5px] text-muted-foreground">1 人在线</div>
        <div className="mt-3 text-center">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] text-muted-foreground">
            18:07
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Avatar name="U" plain size="md" className="bg-blue-2 text-white" />
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-card p-3">
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">U老师</span> · {time}
            </div>
            <p className="mt-1.5 text-[12.5px] leading-6">
              核心问题是需求细节缺失：触发条件、责任人对应关系与内容模板均未明确，目前仅有一句话描述，无法直接进入开发。
            </p>
            <ul className="mt-2 space-y-1.5 text-[12.5px] leading-6 text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-3" />
                与项目方确认异常类型清单及对应责任人分组规则。
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-4" />
                核查现有消息通道能力，确认技术可行性。
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-2" />
                输出需求规格文档后再进入开发排期。
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[11.5px] font-semibold text-foreground">
            @U老师
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              placeholder="直接评论或者 @U老师 进行讨论"
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-[12.5px] outline-none transition focus:border-primary"
            />
            <button
              aria-label="附件"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              aria-label="发送"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Send className="size-4" />
            </button>
          </div>

        </div>

      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        {["修改工单", "退回工单", "重新指派", "升级上报"].map((label) => (
          <button
            key={label}
            className="rounded-md bg-blue-3 px-3.5 py-1.5 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-blue-2"
          >
            {label}
          </button>
        ))}
      </div>
    </PageShell>
  );
}
