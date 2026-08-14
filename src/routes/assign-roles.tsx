import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, FolderClosed, UserRound, ChevronLeft, Check } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { toast } from "sonner";
import { projects, projectMembers } from "@/data/mock";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/assign-roles")({
  head: () => ({
    meta: [
      { title: "分配角色 · 批量授权" },
      { name: "description", content: "支持项目优先与用户优先两种批量授权方式，为用户在项目中分配或移除角色。" },
      { property: "og:title", content: "分配角色 · 批量授权" },
      { property: "og:description", content: "支持项目优先与用户优先两种批量授权方式，为用户在项目中分配或移除角色。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssignRolesPage,
});

const roles = ["项目经理", "实施", "调度研发", "部门负责人", "销售", "售前"];

function ModeCard({
  title,
  desc,
  icon: Icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: typeof FolderClosed;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/40"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue-2">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-tight">{title}</span>
        <span className="mt-1 block truncate text-[11.5px] text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {active ? <Check className="size-3" /> : null}
      {label}
    </button>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string | undefined }) {
  return (
    <div className="mb-2 mt-5 flex items-baseline gap-2 px-1">
      <span className="h-4 w-1 self-center rounded-full bg-blue-3" />
      <h2 className="text-[14px] font-bold">{title}</h2>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function useToggle<T>(initial: T[] = []) {
  const [items, setItems] = useState<T[]>(initial);
  const toggle = (v: T) =>
    setItems((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  return [items, toggle, setItems] as const;
}

function ProjectFirst() {
  const [project, setProject] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [people, togglePerson] = useToggle<string>();
  const [role, setRole] = useState<string | null>(null);

  return (
    <>
      <section className="surface-card mt-3 p-4">
        <p className="text-[11.5px] text-muted-foreground">项目</p>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-3 text-left transition-colors hover:bg-secondary"
        >
          <span
            className={cn(
              "truncate text-[13.5px]",
              project ? "font-semibold" : "text-muted-foreground",
            )}
          >
            {project ?? "请先选择项目"}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </section>

      <Sheet open={picking} onOpenChange={setPicking}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-[15px]">选择项目</SheetTitle>
          </SheetHeader>
          <div className="mt-3 grid max-h-[50vh] gap-1.5 overflow-y-auto pb-4">
            {projects.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => {
                  setProject(p.name);
                  setPicking(false);
                }}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-semibold">{p.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    编号 {p.code} · {p.stage}
                  </span>
                </span>
                {project === p.name ? <Check className="size-4 shrink-0 text-blue-2" /> : null}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {!project ? null : (
        <>


      <SectionTitle title="选择人员" hint={people.length ? `已选 ${people.length} 人` : undefined} />
      <div className="flex flex-wrap gap-1.5 px-0.5">
        {projectMembers.map((m) => (
          <Chip
            key={m.name}
            label={m.name}
            active={people.includes(m.name)}
            onClick={() => togglePerson(m.name)}
          />
        ))}
      </div>

      <SectionTitle title="选择角色" />
      <div className="flex flex-wrap gap-1.5 px-0.5">
        {roles.map((r) => (
          <Chip key={r} label={r} active={role === r} onClick={() => setRole(r === role ? null : r)} />
        ))}
      </div>

      <Actions
        disabled={!project || !people.length || !role}
        onGrant={() => toast.success(`已为 ${people.length} 人授予「${role}」`)}
        onRevoke={() => toast(`已移除 ${people.length} 人的「${role}」`)}
      />
        </>
      )}
    </>

  );
}

function UserFirst() {
  const [people, togglePerson] = useToggle<string>();
  const [role, setRole] = useState<string | null>(null);
  const [projs, toggleProj] = useToggle<string>();

  return (
    <>
      <SectionTitle title="选择用户" hint={people.length ? `已选 ${people.length} 人` : undefined} />
      <div className="flex flex-wrap gap-1.5 px-0.5">
        {projectMembers.map((m) => (
          <Chip
            key={m.name}
            label={m.name}
            active={people.includes(m.name)}
            onClick={() => togglePerson(m.name)}
          />
        ))}
      </div>

      <SectionTitle title="选择角色" />
      <div className="flex flex-wrap gap-1.5 px-0.5">
        {roles.map((r) => (
          <Chip key={r} label={r} active={role === r} onClick={() => setRole(r === role ? null : r)} />
        ))}
      </div>

      <SectionTitle title="批量授权到项目" hint={projs.length ? `已选 ${projs.length} 个项目` : undefined} />
      <section className="grid gap-2">
        {projects.slice(0, 5).map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => toggleProj(p.name)}
            className={cn(
              "surface-card flex items-center justify-between gap-3 p-3.5 text-left transition-colors",
              projs.includes(p.name) ? "ring-1 ring-blue-2" : "hover:bg-secondary/40",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold">{p.name}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                编号 {p.code} · {p.stage}
              </span>
            </span>
            {projs.includes(p.name) ? <Check className="size-4 shrink-0 text-blue-2" /> : null}
          </button>
        ))}
      </section>

      <Actions
        disabled={!people.length || !role || !projs.length}
        onGrant={() => toast.success(`已在 ${projs.length} 个项目中授予「${role}」`)}
        onRevoke={() => toast(`已在 ${projs.length} 个项目中移除「${role}」`)}
      />
    </>
  );
}

function Actions({
  disabled,
  onGrant,
  onRevoke,
}: {
  disabled: boolean;
  onGrant: () => void;
  onRevoke: () => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onRevoke}
        className="rounded-lg border border-border bg-card py-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        移除角色
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onGrant}
        className="rounded-lg bg-blue-2 py-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        批量授权
      </button>
    </div>
  );
}

function AssignRolesPage() {
  const [mode, setMode] = useState<"project" | "user" | null>(null);

  return (
    <PageShell title="分配角色" back>
      {mode === null ? (
        <>
          <header className="mb-4 mt-2 text-center">
            <h1 className="text-[16px] font-bold tracking-tight">请选择授权方式</h1>
            <p className="mt-1.5 text-[11.5px] text-muted-foreground">
              两种方式均可完成批量授权，按需选择
            </p>
          </header>
          <section className="grid gap-2.5">
            <ModeCard
              title="项目优先"
              desc="先选一个项目，再批量给人员授权 / 移除角色"
              icon={FolderClosed}
              onClick={() => setMode("project")}
            />
            <ModeCard
              title="用户优先"
              desc="先选若干用户和角色，再批量授权到多个项目"
              icon={UserRound}
              onClick={() => setMode("user")}
            />
          </section>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setMode(null)}
            className="flex items-center gap-1 px-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
            {mode === "project" ? "项目优先" : "用户优先"} · 切换方式
          </button>
          {mode === "project" ? <ProjectFirst /> : <UserFirst />}
        </>
      )}
    </PageShell>
  );
}
