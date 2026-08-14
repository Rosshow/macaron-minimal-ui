import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users, Tags, KeyRound, UserCog, Shuffle, ScrollText } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { toast } from "sonner";

export const Route = createFileRoute("/other")({
  head: () => ({
    meta: [
      { title: "其他 · 用户与权限管理" },
      { name: "description", content: "用户管理、角色管理、权限管理、分配角色、设置用户与操作记录的统一入口。" },
      { property: "og:title", content: "其他 · 用户与权限管理" },
      { property: "og:description", content: "用户管理、角色管理、权限管理、分配角色、设置用户与操作记录的统一入口。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Other,
});

const items = [
  { label: "用户管理", desc: "用户账号 CRUD、派单画像", icon: Users, tone: "blue-1" },
  { label: "角色管理", desc: "角色定义、权限绑定", icon: Tags, tone: "blue-2" },
  { label: "权限管理", desc: "权限项定义、分配", icon: KeyRound, tone: "blue-3" },
  { label: "分配角色", desc: "为用户在项目中分配角色", icon: UserCog, tone: "blue-2" },
  { label: "设置用户", desc: "迁移用户数据、合并账号", icon: Shuffle, tone: "blue-3" },
  { label: "操作记录", desc: "操作日志审计与追溯", icon: ScrollText, tone: "blue-4" },
] as const;

function Other() {
  const navigate = useNavigate();
  return (
    <PageShell title="其他" back>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(({ label, desc, icon: Icon, tone }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              label === "用户管理"
                ? navigate({ to: "/users" })
                : label === "角色管理"
                  ? navigate({ to: "/roles" })
                  : label === "分配角色"
                    ? navigate({ to: "/assign-roles" })
                    : toast(`${label}（功能开发中）`)
            }
            className="surface-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/40"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-2xl"
              style={{
                background: `color-mix(in oklab, var(--${tone}) 12%, var(--card))`,
                color: `var(--${tone})`,
              }}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight">{label}</span>
              <span className="mt-1 block truncate text-[11.5px] text-muted-foreground">{desc}</span>
            </span>
          </button>
        ))}
      </section>
    </PageShell>
  );
}
