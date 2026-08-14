import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { toast } from "sonner";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "角色管理 · 角色定义与权限绑定" },
      { name: "description", content: "查看系统角色与项目角色的权限绑定明细，支持新建角色与展开查看全部权限项。" },
      { property: "og:title", content: "角色管理 · 角色定义与权限绑定" },
      { property: "og:description", content: "查看系统角色与项目角色的权限绑定明细，支持新建角色与展开查看全部权限项。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RolesPage,
});

type Role = { name: string; perms: string[] };

const systemRoles: Role[] = [
  {
    name: "开发者",
    perms: [
      "后台系统权限增删改查",
      "获取全部系统中的项目",
      "后端角色增删改查权限",
      "后台角色权限",
      "系统角色增删改查权限",
      "后台用户增删改查权限",
      "后台项目用户增删改查权限",
      "后端权限读取",
      "后端用户数据获取",
    ],
  },
  {
    name: "超级管理员",
    perms: [
      "后台系统权限增删改查",
      "获取全部系统中的项目",
      "后端角色增删改查权限",
      "系统角色增删改查权限",
      "后台用户增删改查权限",
      "后台项目用户增删改查权限",
      "后端权限读取",
    ],
  },
  { name: "用户", perms: ["后端权限读取", "后端角色读取权限", "后端用户数据获取"] },
];

const projectRoles: Role[] = [
  {
    name: "调度研发",
    perms: [
      "添加公司",
      "添加部门权限（个人中心）",
      "后台系统权限增删改查",
      "后端角色增删改查权限",
      "后台用户增删改查权限",
      "后台项目用户增删改查权限",
      "后端权限读取",
    ],
  },
  { name: "实施", perms: ["后端角色读取权限", "后端用户数据获取"] },
  {
    name: "项目经理",
    perms: [
      "添加公司",
      "后台系统权限增删改查",
      "后端角色增删改查权限",
      "系统角色增删改查权限",
      "后台用户增删改查权限",
      "后台项目用户增删改查权限",
      "后端权限读取",
    ],
  },
  {
    name: "部门负责人",
    perms: [
      "后台系统权限增删改查",
      "获取全部系统中的项目",
      "后端角色增删改查权限",
      "系统角色增删改查权限",
      "后台用户增删改查权限",
      "后台项目用户增删改查权限",
      "后端权限读取",
      "后端用户数据获取",
    ],
  },
];

const VISIBLE = 6;

function RoleCard({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const shown = open ? role.perms : role.perms.slice(0, VISIBLE);
  const rest = role.perms.length - shown.length;

  return (
    <article className="surface-card p-4">
      <h3 className="text-[15px] font-semibold tracking-tight">{role.name}</h3>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {shown.map((p) => (
          <span
            key={p}
            className="rounded-md border border-blue-soft bg-blue-soft/60 px-2 py-0.5 text-[11px] text-blue-2"
          >
            {p}
          </span>
        ))}
        {rest > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            +{rest} 更多
          </button>
        ) : role.perms.length > VISIBLE ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            收起
          </button>
        ) : null}
      </div>
    </article>
  );
}

function GroupTitle({ title }: { title: string }) {
  return (
    <div className="mb-2 mt-5 flex items-center gap-2 px-1">
      <span className="h-4 w-1 rounded-full bg-blue-3" />
      <h2 className="text-[14px] font-bold">{title}</h2>
    </div>
  );
}

function RolesPage() {
  return (
    <PageShell title="角色管理" back>
      <button
        type="button"
        onClick={() => toast("新建角色（功能开发中）")}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-2 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" /> 新建角色
      </button>

      <GroupTitle title="系统角色" />
      <section className="grid gap-2.5">
        {systemRoles.map((r) => (
          <RoleCard key={r.name} role={r} />
        ))}
      </section>

      <GroupTitle title="项目角色" />
      <section className="grid gap-2.5">
        {projectRoles.map((r) => (
          <RoleCard key={r.name} role={r} />
        ))}
      </section>
    </PageShell>
  );
}
