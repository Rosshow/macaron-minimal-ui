import { createFileRoute, notFound } from "@tanstack/react-router";
import { Paperclip, Send, Bell, Upload, Undo2, Pencil, ArrowRight, Bot } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { Avatar } from "@/components/Bits";
import { tickets, kindTone, priorityTone, statusTone } from "@/data/mock";

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
    ],
  }),
  component: Detail,
});

const actions = [
  { label: "催办", icon: Bell },
  { label: "上报", icon: Upload },
  { label: "撤回", icon: Undo2 },
  { label: "编辑", icon: Pencil },
];

function Detail() {
  const t = Route.useLoaderData();

  return (
    <PageShell title="工单详情" back>
      <section className="surface-card p-4">
        <div className="flex items-center gap-2">
          <Tag tone={kindTone[t.kind]}>{t.kind}</Tag>
          <Tag tone={priorityTone[t.priority]}>{t.priority}</Tag>
          <Tag tone={statusTone[t.status]}>{t.status}</Tag>
          <span className="ml-auto text-[12px] text-muted-foreground">{t.no}</span>
        </div>
        <h2 className="mt-2.5 text-[17px] font-bold leading-7">{t.title}</h2>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
          {[
            ["所属项目", t.project],
            ["创建时间", `${t.date} 16:31`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-secondary/70 px-3 py-2">
              <dt className="text-[10.5px] text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 truncate font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="surface-card mt-3 flex items-center gap-3 p-4">
        <Avatar name={t.reporter} tone="lilac" />
        <div className="leading-tight">
          <div className="text-[10px] text-muted-foreground">发起人</div>
          <div className="text-[13px] font-medium">{t.reporter}</div>
        </div>
        <ArrowRight className="mx-auto size-4 text-sky" />
        <div className="text-right leading-tight">
          <div className="text-[10px] text-muted-foreground">处理人</div>
          <div className="text-[13px] font-medium">{t.owner}</div>
        </div>
        <Avatar name={t.owner} tone="sky" />
      </section>

      <section className="surface-card mt-3 p-4">
        <h3 className="text-[13px] font-semibold">问题描述</h3>
        <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">{t.desc}</p>
      </section>

      <section className="surface-card mt-3 p-4">
        <h3 className="text-[13px] font-semibold">讨论摘要</h3>
        <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">
          暂无摘要，U老师 将自动总结讨论进展
        </p>
      </section>

      <section className="surface-card mt-3 p-4">
        <div className="flex items-center">
          <h3 className="text-[13px] font-semibold">讨论（2）</h3>
          <button className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
            <Bot className="size-3.5" /> 帮我分析
          </button>
        </div>

        <div className="mt-3 rounded-3xl bg-secondary/60 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-lilac">
            <Bot className="size-3.5" /> U老师
          </div>
          <p className="mt-2 text-[12.5px] leading-6">
            核心诉求是在评论交互层增加「引用」入口，并在发送时携带被引用评论的内容摘要和作者信息，避免讨论上下文断裂。
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-6 text-muted-foreground">
            <li className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mint" />
              在讨论区每条评论的操作区增加「引用」按钮，点击后将作者与内容摘要带入输入框。
            </li>
            <li className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky" />
              评论数据结构增加 quote 字段（被引用评论 ID、作者、内容快照），前端以引用卡片样式展示。
            </li>
            <li className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-apricot" />
              指定处理人评估组件复用方案与接口兼容性，建议排期纳入迭代。
            </li>
          </ul>
          <div className="mt-2 text-right text-[11px] text-muted-foreground">2 天前</div>
        </div>

        <div className="mt-3 flex gap-2">
          <Avatar name={t.owner} tone="sky" />
          <div className="rounded-2xl rounded-tl-md bg-card px-3 py-2 text-[12.5px] shadow-[var(--shadow-soft)]">
            <div className="text-[11px] text-muted-foreground">{t.owner} · 2 天前</div>
            <div className="mt-0.5">收到，本周排期评估。</div>
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-lilac-soft px-3 py-1 text-[11.5px] font-semibold text-lilac">
            @U老师
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              placeholder="直接评论或者 @U老师 进行讨论"
              className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-[12.5px] outline-none transition focus:border-mint"
            />
            <button className="grid size-9 place-items-center rounded-full bg-secondary text-muted-foreground">
              <Paperclip className="size-4" />
            </button>
            <button className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {actions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="surface-card flex flex-col items-center gap-1 py-3 text-[12px] text-muted-foreground"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </PageShell>
  );
}
