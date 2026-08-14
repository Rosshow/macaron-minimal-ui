import { createFileRoute, notFound } from "@tanstack/react-router";
import { Paperclip, Send, ArrowRight, Bell, Upload, Pencil } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Avatar } from "@/components/Bits";
import { Tag } from "@/components/Tag";
import {
  tickets,
  ticketDiscussion,
  ticketSummary,
  type Ticket,
  type DiscussionMessage,
} from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history/$id")({
  loader: ({ params }) => {
    const ticket = tickets.find((t) => t.id === params.id);
    if (!ticket) throw notFound();
    return ticket;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "工单详情"} · 历史工单` },
      {
        name: "description",
        content: loaderData?.desc?.slice(0, 150) ?? "历史工单详情、附件与讨论记录。",
      },
      { property: "og:title", content: `${loaderData?.title ?? "工单详情"} · 历史工单` },
      {
        property: "og:description",
        content: loaderData?.desc?.slice(0, 150) ?? "历史工单详情、附件与讨论记录。",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryDetail,
});

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-[12.5px] leading-6">
      <span className="w-[84px] shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 font-medium text-foreground">{value}</span>
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
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

function Bubble({ m }: { m: DiscussionMessage }) {
  const mine = m.side === "me";
  return (
    <div className={cn("flex w-full gap-2", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] px-3 py-2 text-[12.5px] leading-6",
          mine
            ? "rounded-2xl rounded-br-md bg-blue-soft text-foreground"
            : "rounded-2xl rounded-bl-md border border-border bg-card text-foreground",
        )}
      >
        {!mine && m.time ? (
          <div className="mb-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{m.author}</span> · {m.time}
          </div>
        ) : null}
        {m.quote ? (
          <div className="mb-1.5 border-l-2 border-blue-2 pl-2 text-[11.5px] leading-5 text-muted-foreground">
            <div className="font-semibold text-blue-2">{m.quote.author}</div>
            <p className="mt-0.5">{m.quote.text}</p>
          </div>
        ) : null}
        <p>{m.text}</p>
        {mine && m.read ? (
          <div className="mt-1 text-[10.5px] text-muted-foreground">已读</div>
        ) : null}
      </div>
    </div>
  );
}

function HistoryDetail() {
  const t = Route.useLoaderData() as Ticket;
  const created = `${t.date.replace(/-/g, "/")} 20:10`;
  const due = `${t.date.replace(/-/g, "/")} 17:00`;
  const count = ticketDiscussion.reduce((n, g) => n + g.messages.length, 0);

  return (
    <PageShell title="工单详情" back>
      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="blue-muted">{t.kind}</Tag>
          <Tag tone="blue-muted">{t.priority}</Tag>
          <Tag tone="blue-muted">{t.status}</Tag>
          <span className="text-[11.5px] text-muted-foreground">{t.no}</span>
        </div>

        <h2 className="mt-2.5 text-[18px] font-bold leading-tight tracking-tight">{t.title}</h2>

        <div className="mt-3 space-y-1">
          <MetaRow label="所属项目" value={t.project} />
          <MetaRow label="创建时间" value={created} />
          <MetaRow label="最晚解决时间" value={due} />
        </div>
      </section>

      <section className="surface-card mt-3 flex items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar name={t.reporter} plain size="md" />
          <div className="min-w-0 leading-tight">
            <div className="text-[10.5px] text-muted-foreground">发起人</div>
            <div className="truncate text-[12.5px] font-medium">{t.reporter}</div>
          </div>
        </div>
        <ArrowRight className="size-4 shrink-0 text-blue-2" />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className="min-w-0 text-right leading-tight">
            <div className="text-[10.5px] text-muted-foreground">处理人</div>
            <div className="truncate text-[12.5px] font-medium">{t.owner}</div>
          </div>
          <Avatar name={t.owner} tone="blue-2" size="md" />
        </div>
      </section>

      <SectionCard title="问题描述">
        <p className="text-[12.5px] leading-6 text-muted-foreground">{t.desc}</p>
      </SectionCard>

      <SectionCard title="附件（1）">
        <div className="flex h-20 w-24 items-center justify-center rounded-xl border border-border bg-secondary/60 text-[10.5px] text-muted-foreground">
          截图.png
        </div>
      </SectionCard>

      <SectionCard title="讨论摘要">
        <p className="text-[12.5px] leading-6 text-muted-foreground">{ticketSummary}</p>
      </SectionCard>

      <section className="surface-card mt-3 p-4">
        <h3 className="text-[13px] font-semibold">讨论（{count}）</h3>
        <div className="mt-1.5 text-[11.5px] text-muted-foreground">1 人在线</div>

        <div className="mt-3 space-y-3">
          {ticketDiscussion.map((g) => (
            <div key={g.time} className="space-y-2">
              <div className="text-center">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10.5px] text-muted-foreground">
                  {g.time}
                </span>
              </div>
              {g.messages.map((m) => (
                <Bubble key={m.id} m={m} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <span className="inline-flex rounded-md bg-secondary px-3 py-1 text-[11.5px] font-semibold text-foreground">
            @U老师
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              placeholder="直接评论或者 @U老师 进行讨论。"
              className="h-10 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-[12.5px] outline-none transition focus:border-primary"
            />
            <button
              aria-label="附件"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground"
            >
              <Paperclip className="size-4" />
            </button>
            <button
              aria-label="发送"
              className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: "催办", icon: Bell },
          { label: "上报", icon: Upload },
          { label: "编辑", icon: Pencil },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    </PageShell>
  );
}
