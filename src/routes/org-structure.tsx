import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Crown, Link2, Search, User, Users } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/org-structure")({
  head: () => ({
    meta: [
      { title: "人员结构 · 汇报关系配置" },
      {
        name: "description",
        content: "查看与配置人员汇报关系：设置部门管理员、自动挂靠同部门人员、按分组或列表查看组织结构。",
      },
      { property: "og:title", content: "人员结构 · 汇报关系配置" },
      {
        property: "og:description",
        content: "查看与配置人员汇报关系：设置部门管理员、自动挂靠同部门人员、按分组或列表查看组织结构。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgStructure,
});

type Person = {
  name: string;
  company?: string;
  dept?: string;
  manager?: boolean;
  reports?: string[];
};

const people: Person[] = [
  { name: "……" },
  { name: "彬斌" },
  { name: "柴青林", dept: "智能物流事业部" },
  { name: "车端老大", dept: "智能移动研究院", manager: true },
  { name: "陈彬", company: "浙江中力机械股份有限公司", dept: "数智飞仓事业部" },
  { name: "陈豪", dept: "数智仓储事业部" },
  { name: "陈丽" },
  { name: "陈晓", dept: "自动工业车辆事业部" },
  { name: "陈泽豪", dept: "国内销售部", manager: true },
  { name: "邓成达", company: "浙江中力机械股份有限公司", dept: "自动工业车辆事业部" },
  { name: "叮叮叮叮93" },
  {
    name: "董华来",
    company: "浙江中力机械股份有限公司",
    dept: "智能规划研究院",
    manager: true,
    reports: ["白永奇", "陈连鑫", "耿洪秀", "胡健楠", "吴佳秀", "李耀华"],
  },
];

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "blue" }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[10.5px] font-medium",
        tone === "blue" ? "bg-blue-soft text-blue-2" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function GhostButton({
  children,
  onClick,
  active,
  emphasis,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
        emphasis
          ? "border-blue-2/70 bg-blue-2/90 text-white hover:bg-blue-1"
          : active
            ? "border-blue-3/60 bg-blue-soft text-blue-2"
            : "border-border bg-card text-muted-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function PersonRow({
  p,
  open,
  onToggle,
}: {
  p: Person;
  open: boolean;
  onToggle: () => void;
}) {
  const hasReports = !!p.reports?.length;

  return (
    <article
      className={cn(
        "surface-card overflow-hidden",
        p.manager && "border-blue-3/50 bg-blue-soft/60",
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={hasReports ? onToggle : () => {}}
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
          aria-label={hasReports ? "展开下属" : "人员"}
        >
          {p.manager ? (
            <Crown className="size-3.5 text-blue-2" />
          ) : hasReports ? (
            <Users className="size-3.5" />
          ) : (
            <User className="size-3.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[13.5px] font-semibold tracking-tight">{p.name}</h3>
            {p.manager ? <Chip tone="blue">部门管理员</Chip> : null}
            {p.company ? <Chip>{p.company}</Chip> : null}
            {p.dept ? <Chip>{p.dept}</Chip> : null}
          </div>

          {p.manager ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <GhostButton emphasis onClick={() => toast.success(`已自动挂靠 ${p.name} 同部门人员`)}>
                <Link2 className="size-3" />
                自动挂靠（同部门人员）
              </GhostButton>
              <GhostButton onClick={() => toast(`已取消 ${p.name} 的管理员身份`)}>
                取消管理员
              </GhostButton>
            </div>
          ) : p.dept ? (
            <div className="mt-2">
              <GhostButton onClick={() => toast.success(`已将 ${p.name} 设为部门管理员`)}>
                设为部门管理员
              </GhostButton>
            </div>
          ) : null}
        </div>

        {hasReports ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex shrink-0 items-center gap-1 pt-1 text-[11px] text-muted-foreground"
          >
            {p.reports!.length} 人
            <ChevronRight
              className={cn("size-3.5 transition-transform", open && "rotate-90")}
            />
          </button>
        ) : null}
      </div>

      {hasReports && open ? (
        <div className="space-y-2 border-t border-border/60 bg-card/60 px-4 py-3 pl-8">
          {p.reports!.map((r) => (
            <div key={r} className="flex items-start gap-3 rounded-md border border-border/60 bg-card px-3 py-2">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <User className="size-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold">{r}</p>
                <p className="mt-0.5 text-[10.5px] text-muted-foreground">↑ 汇报给：{p.name}</p>
                <div className="mt-1.5">
                  <GhostButton onClick={() => toast.success(`已将 ${r} 设为部门管理员`)}>
                    设为部门管理员
                  </GhostButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function OrgStructure() {
  const [q, setQ] = useState("");
  const [grouped, setGrouped] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(["董华来"]);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return people;
    return people.filter((p) =>
      [p.name, p.dept ?? "", p.company ?? ""].join(" ").toLowerCase().includes(k),
    );
  }, [q]);

  const allCollapsed = openKeys.length === 0;

  return (
    <PageShell
      title="人员结构配置"
      back
      right={
        <button
          type="button"
          onClick={() => setOpenKeys(allCollapsed ? people.filter((p) => p.reports).map((p) => p.name) : [])}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary"
        >
          {allCollapsed ? "全部展开" : "全部折叠"}
        </button>
      }
    >
      <p className="rounded-md bg-muted px-3 py-2 text-[11.5px] leading-5 text-muted-foreground">
        拖拽用户到目标人上即可设置汇报关系；点击用户卡片可选择 / 修改上级。
      </p>

      <div className="mt-3 flex items-center gap-2">
        <div className="surface-card flex flex-1 items-center gap-2 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名 / 部门…"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <GhostButton active={grouped} onClick={() => setGrouped(!grouped)}>
          {grouped ? "列表视图" : "切换分组视图"}
        </GhostButton>
      </div>

      {grouped ? (
        <div className="mt-3 space-y-4">
          {Array.from(new Set(list.map((p) => p.dept ?? "未分配部门"))).map((dept) => (
            <section key={dept}>
              <h2 className="mb-2 px-1 text-[11.5px] font-semibold tracking-wide text-muted-foreground">
                {dept}
                <span className="ml-1.5 font-normal">
                  {list.filter((p) => (p.dept ?? "未分配部门") === dept).length} 人
                </span>
              </h2>
              <div className="space-y-2.5">
                {list
                  .filter((p) => (p.dept ?? "未分配部门") === dept)
                  .map((p, i) => (
                    <PersonRow
                      key={`${p.name}-${i}`}
                      p={p}
                      open={openKeys.includes(p.name)}
                      onToggle={() =>
                        setOpenKeys((keys) =>
                          keys.includes(p.name)
                            ? keys.filter((k) => k !== p.name)
                            : [...keys, p.name],
                        )
                      }
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="mt-3 space-y-2.5">
          {list.map((p, i) => (
            <PersonRow
              key={`${p.name}-${i}`}
              p={p}
              open={openKeys.includes(p.name)}
              onToggle={() =>
                setOpenKeys((keys) =>
                  keys.includes(p.name) ? keys.filter((k) => k !== p.name) : [...keys, p.name],
                )
              }
            />
          ))}
        </section>
      )}
      {list.length === 0 ? (
        <p className="py-10 text-center text-[12.5px] text-muted-foreground">未找到匹配的人员</p>
      ) : null}

    </PageShell>
  );
}
