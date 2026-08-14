import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "权限管理 · 权限项定义与分配" },
      { name: "description", content: "搜索、启用或停用系统权限项，查看权限编码与作用域，支持新建与删除权限。" },
      { property: "og:title", content: "权限管理 · 权限项定义与分配" },
      { property: "og:description", content: "搜索、启用或停用系统权限项，查看权限编码与作用域，支持新建与删除权限。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PermissionsPage,
});

type Perm = { name: string; code: string; scope: string; action: string; on: boolean };

const initial: Perm[] = [
  { name: "添加公司", code: "backend:company:add", scope: "frontend", action: "add", on: true },
  { name: "添加部门权限（个人中心）", code: "backend:part:add", scope: "frontend", action: "add", on: true },
  { name: "后台系统权限增删改查", code: "backend:permission:base:*", scope: "backend", action: "*", on: true },
  { name: "后端权限读取", code: "backend:permission:base:read", scope: "backend", action: "read", on: true },
  { name: "获取全部系统中的项目", code: "backend:project:all", scope: "backend", action: "*", on: true },
  { name: "后端角色增删改查权限", code: "backend:role:base:*", scope: "backend", action: "*", on: true },
  { name: "后端角色读取权限", code: "backend:role:base:read", scope: "backend", action: "read", on: true },
  { name: "后台角色权限", code: "backend:role:permission:*", scope: "backend", action: "*", on: true },
  { name: "系统角色增删改查权限", code: "backend:role:system:*", scope: "backend", action: "*", on: true },
  { name: "后台用户增删改查权限", code: "backend:user:base:*", scope: "backend", action: "*", on: true },
  { name: "后端用户数据获取", code: "backend:user:base:read", scope: "backend", action: "read", on: true },
  { name: "后台项目用户增删改查权限", code: "backend:user:role_project:*", scope: "backed", action: "*", on: true },
  { name: "前端后台管理-系统管理入口显示", code: "frontend:admin:user:show", scope: "前端", action: "入口显示", on: true },
  { name: "系统任务新建任务-同步任务按钮显示权限", code: "frontend:develop:*:*", scope: "frontend", action: "show", on: true },
  { name: "获取全部任务", code: "frontend:task:all", scope: "任务", action: "*", on: true },
];

function PermissionsPage() {
  const [perms, setPerms] = useState<Perm[]>(initial);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return perms;
    return perms.filter((p) => p.name.toLowerCase().includes(k) || p.code.toLowerCase().includes(k));
  }, [perms, q]);

  return (
    <PageShell title="权限管理" back>
      <button
        type="button"
        onClick={() => toast("新建权限（功能开发中）")}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-2 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" /> 新建权限
      </button>

      <div className="surface-card mt-3 flex items-center gap-2 px-3 py-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索权限名称或编码"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <section className="mt-3 grid gap-2">
        {list.map((p) => (
          <article key={p.code} className="surface-card flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[13.5px] font-semibold leading-tight">{p.name}</h3>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{p.code}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {p.scope} · {p.action}
              </p>
            </div>
            <Switch
              checked={p.on}
              onCheckedChange={(v) =>
                setPerms((prev) => prev.map((x) => (x.code === p.code ? { ...x, on: v } : x)))
              }
            />
            <button
              type="button"
              onClick={() => {
                setPerms((prev) => prev.filter((x) => x.code !== p.code));
                toast(`已删除「${p.name}」`);
              }}
              className="shrink-0 rounded-md border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              删除
            </button>
          </article>
        ))}
        {list.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-muted-foreground">未找到匹配的权限项</p>
        ) : null}
      </section>
    </PageShell>
  );
}
