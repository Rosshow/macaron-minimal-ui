import { createFileRoute, Link } from "@tanstack/react-router";
import { CornerDownRight, MoveRight } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge } from "@/components/ui/badge";
import { kindTone, priorityTone, projectTickets, statusTone, type Ticket } from "@/data/mock";
import { Tag } from "@/components/Tag";

export const Route = createFileRoute("/projects/$id_/tickets")({
  head: () => ({
    meta: [
      { title: "全部工单 · 摇人吧" },
      { name: "description", content: "查看项目全部工单及父子、前置后置等关联关系。" },
      { property: "og:title", content: "全部工单 · 摇人吧" },
      { property: "og:description", content: "查看项目全部工单及父子、前置后置等关联关系。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectTicketsPage,
});

function ProjectTicketsPage() {
  const byId = new Map(projectTickets.map((ticket) => [ticket.id, ticket]));
  const roots = projectTickets.filter((ticket) => !ticket.parentId);
  const childrenOf = (id: string) => projectTickets.filter((ticket) => ticket.parentId === id);

  return (
    <PageShell title="全部工单" back>
      <p className="mb-3 text-[11.5px] text-muted-foreground">
        父子工单以缩进展示；卡片下方标注前置/后置工单，点击编号可查看详情。
      </p>
      <div className="space-y-2.5">
        {roots.map((ticket) => (
          <TicketBlock key={ticket.id} ticket={ticket} depth={0} byId={byId} childrenOf={childrenOf} />
        ))}
      </div>
    </PageShell>
  );
}

function TicketBlock({
  ticket,
  depth,
  byId,
  childrenOf,
}: {
  ticket: Ticket;
  depth: number;
  byId: Map<string, Ticket>;
  childrenOf: (id: string) => Ticket[];
}) {
  const children = childrenOf(ticket.id);
  const predecessors = (ticket.dependsOn ?? []).map((id) => byId.get(id)).filter((item): item is Ticket => Boolean(item));
  const successors = projectTickets.filter((item) => item.dependsOn?.includes(ticket.id));

  return (
    <div className={depth > 0 ? "ml-5 border-l-2 border-blue-4/50 pl-3" : undefined}>
      <div className="surface-card p-3">
        {depth > 0 ? (
          <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <CornerDownRight className="size-3" />子工单
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Link to="/tickets/$id" params={{ id: ticket.id }} className="shrink-0 text-[12px] font-bold text-blue-2">
            {ticket.no}
          </Link>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{ticket.title}</span>
          <Tag tone={statusTone[ticket.status]}>{ticket.status}</Tag>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Tag tone={kindTone[ticket.kind]}>{ticket.kind}</Tag>
          <Tag tone={priorityTone[ticket.priority]}>{ticket.priority}</Tag>
          <span className="text-[10.5px] text-muted-foreground">提单 {ticket.reporter} · 接单 {ticket.owner} · {ticket.date}</span>
        </div>
        {predecessors.length || successors.length ? (
          <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
            {predecessors.map((item) => (
              <RelationRow key={`pre-${item.id}`} label="前置" ticket={item} />
            ))}
            {successors.map((item) => (
              <RelationRow key={`post-${item.id}`} label="后置" ticket={item} />
            ))}
          </div>
        ) : null}
      </div>
      {children.length ? (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <TicketBlock key={child.id} ticket={child} depth={depth + 1} byId={byId} childrenOf={childrenOf} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RelationRow({ label, ticket }: { label: string; ticket: Ticket }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{label}</Badge>
      <MoveRight className="size-3 text-muted-foreground" aria-hidden />
      <Link to="/tickets/$id" params={{ id: ticket.id }} className="font-semibold text-blue-2">{ticket.no}</Link>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{ticket.title}</span>
      <Tag tone={statusTone[ticket.status]}>{ticket.status}</Tag>
    </div>
  );
}
