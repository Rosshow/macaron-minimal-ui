import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Building2, ClipboardList, Check, Plus, X } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";


export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "用户管理 · 账号与派单画像" },
      { name: "description", content: "搜索用户、查看部门与技能标签、维护职责说明，支持新建、编辑与删除用户账号。" },
      { property: "og:title", content: "用户管理 · 账号与派单画像" },
      { property: "og:description", content: "搜索用户、查看部门与技能标签、维护职责说明，支持新建、编辑与删除用户账号。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersPage,
});

type User = {
  name: string;
  account: string;
  active: boolean;
  level: string;
  dept?: string;
  skills?: string[];
  duty?: string;
};

const users: User[] = [
  {
    name: "吴佳秀",
    account: "@wechat_oD5oY3a6ru",
    active: true,
    level: "一线",
    dept: "智能规划研究院",
    skills: ["调度USP", "产品设计", "需求管理", "需求评审", "版本发布管理"],
    duty:
      "[职责] USP产品经理，调度系统全模块产品设计、产品文档管理、需求全生命周期管理（编写/评审/优先级+进度）、发版管理 [优先] 调度USP新需求梳理、紧急问题定级、版本发布协调",
  },
  { name: "宋尚武", account: "@wechat_oD5oY3aLay", active: true, level: "一线", dept: "自动工业车辆事业部" },
  { name: "叶绍阳", account: "@wechat_oD5oY3aTU-", active: true, level: "一线", dept: "机器人事业部" },
  { name: "李耀华", account: "@wechat_oD5oY3b5_J", active: true, level: "一线" },
  { name: "wechat_oD5oY3bAYM", account: "", active: true, level: "一线" },
  {
    name: "陈连鑫",
    account: "@wechat_oD5oY3bb9z",
    active: true,
    level: "一线",
    dept: "智能规划研究院",
    skills: ["调度USP", "外设对接", "呼叫器通信", "库位管理", "载具管理", "车端对接"],
    duty:
      "[职责] 外设对接与呼叫器通信，库位/载具管理，车端对接（睿芯行+华睿）[优先] 外设通信故障、库位逻辑异常、新外设接入联调",
  },
  {
    name: "白永奇",
    account: "@wechat_oD5oY3bC57",
    active: true,
    level: "一线",
    dept: "智能规划研究院",
    skills: ["调度USP", "数据统计", "数据接口", "摇人吧服务号", "数据分析", "日报周报"],
    duty:
      "[职责] 调度数据统计后端服务，AI数据中心建设（软硬件资料+历史案例收集清洗、统一数据格式、数据访问接口），服务号数据分析 [优先] 经营指标统计异常、AI数据质量校验、数据接口性能优化",
  },
  { name: "微信用户", account: "@wechat_oD5oY3bsBS", active: true, level: "一线" },
  { name: "赵翰林", account: "@wechat_oD5oY3bYsJ", active: true, level: "一线", dept: "数字新仓事业部" },
  { name: "微信用户", account: "@wechat_oD5oY3clDv", active: true, level: "一线" },
];

const levels = ["一线", "管理/审核", "仅兜底"];

function UserCard({ u, onEdit }: { u: User; onEdit: () => void }) {
  return (
    <article className="surface-card p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{u.name}</h3>
            {u.account ? (
              <span className="truncate text-[11.5px] text-muted-foreground">{u.account}</span>
            ) : null}
            {u.active ? <Tag tone="blue-muted" size="sm">活跃</Tag> : <Tag tone="muted" size="sm">停用</Tag>}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-border/70 px-2 py-0.5 text-[11px] text-muted-foreground">
              {u.level}
            </span>
            {u.dept ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground/80">
                <Building2 className="size-3 text-blue-2" />
                {u.dept}
              </span>
            ) : null}
          </div>

          {u.skills?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {u.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {u.duty ? (
            <p className="mt-2 flex gap-1.5 text-[11.5px] leading-5 text-muted-foreground">
              <ClipboardList className="mt-0.5 size-3.5 shrink-0 text-blue-2" />
              <span>{u.duty}</span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => toast(`删除 ${u.name}（功能开发中）`)}
            className="rounded-md border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary"
          >
            删除
          </button>
        </div>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-border/70 py-3">
      <span className="w-16 shrink-0 pt-1 text-right text-[12.5px] text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function UserEditSheet({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User | null;
}) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [level, setLevel] = useState("一线");
  const [modules, setModules] = useState<string[]>([]);
  const [duty, setDuty] = useState("");
  const [moduleDraft, setModuleDraft] = useState("");
  const [adding, setAdding] = useState(false);

  // 同步当前编辑对象
  const key = user ? `${user.name}-${user.account}` : "new";
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  if (open && syncedKey !== key) {
    setSyncedKey(key);
    setName(user?.name ?? "");
    setDept(user?.dept ?? "");
    setLevel(user?.level ?? "一线");
    setModules(user?.skills ?? []);
    setDuty(user?.duty ?? "");
    setAdding(false);
    setModuleDraft("");
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setSyncedKey(null);
        onOpenChange(v);
      }}
    >
      <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl px-4 pb-6">
        <SheetHeader className="px-0">
          <SheetTitle className="text-[15px]">{user ? "编辑用户" : "新建用户"}</SheetTitle>
        </SheetHeader>

        <div className="mt-1">
          <Field label="姓名">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="真实姓名"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="部门">
            <input
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              placeholder="部门/团队"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field label="职级">
            <div className="space-y-1">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className="flex w-full items-center gap-2.5 py-2 text-left"
                >
                  <span
                    className={
                      "flex size-[18px] items-center justify-center rounded-full border transition-colors " +
                      (level === l ? "border-blue-2 bg-blue-2" : "border-border bg-card")
                    }
                  >
                    {level === l ? <Check className="size-3 text-white" strokeWidth={3} /> : null}
                  </span>
                  <span className="text-[13.5px]">{l}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="责任模块">
            {modules.length ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11.5px] text-muted-foreground"
                  >
                    {m}
                    <button type="button" onClick={() => setModules(modules.filter((x) => x !== m))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mb-2 text-[11.5px] text-muted-foreground">暂未设置，点击下方按钮添加</p>
            )}

            {adding ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={moduleDraft}
                  onChange={(e) => setModuleDraft(e.target.value)}
                  placeholder="模块名称"
                  className="flex-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = moduleDraft.trim();
                    if (v && !modules.includes(v)) setModules([...modules, v]);
                    setModuleDraft("");
                    setAdding(false);
                  }}
                  className="rounded-md bg-blue-2 px-3 py-1.5 text-[12.5px] font-medium text-white"
                >
                  添加
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Plus className="size-3.5" />
                添加模块
              </button>
            )}
          </Field>

          <Field label="职责画像">
            <textarea
              value={duty}
              onChange={(e) => setDuty(e.target.value)}
              rows={3}
              placeholder="供 AI 派单匹配参考的职责"
              className="w-full resize-none bg-transparent text-[13px] leading-6 outline-none placeholder:text-muted-foreground"
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-card px-5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success(user ? `已保存 ${name || user.name}` : "已创建用户");
              onOpenChange(false);
            }}
            className="rounded-md bg-blue-2 px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            保存
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UsersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return users;
    return users.filter((u) =>
      [u.name, u.account, u.dept ?? "", ...(u.skills ?? [])].join(" ").toLowerCase().includes(k),
    );
  }, [q]);

  return (
    <PageShell title="用户管理" back>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setEditOpen(true);
          }}
          className="flex-1 rounded-md bg-blue-2 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          新建用户
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/org-structure" })}
          className="rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          人员结构
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="surface-card flex flex-1 items-center gap-2 px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索用户名/姓名/部门…"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        <span className="rounded-md bg-muted px-3 py-2 text-[12px] text-muted-foreground">
          {list.length} 人
        </span>
      </div>

      <section className="mt-3 space-y-2.5">
        {list.map((u, i) => (
          <UserCard
            key={`${u.name}-${i}`}
            u={u}
            onEdit={() => {
              setEditing(u);
              setEditOpen(true);
            }}
          />
        ))}
        {list.length === 0 ? (
          <p className="py-10 text-center text-[12.5px] text-muted-foreground">未找到匹配的用户</p>
        ) : null}
      </section>

      <UserEditSheet open={editOpen} onOpenChange={setEditOpen} user={editing} />
    </PageShell>
  );
}

