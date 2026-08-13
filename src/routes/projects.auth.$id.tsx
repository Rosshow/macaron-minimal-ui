import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, FolderClosed, KeyRound, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/Shell";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Tag } from "@/components/Tag";
import { projectAuthProject, projectLicenses, projectMembers } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/auth/$id")({
  head: () => ({
    meta: [
      { title: "项目授权管理 · 摇人吧" },
      {
        name: "description",
        content: "管理项目 licences 授权记录与项目人员授权，支持申请授权码、撤销与导出。",
      },
      { property: "og:title", content: "项目授权管理 · 摇人吧" },
      {
        property: "og:description",
        content: "管理项目 licences 授权记录与项目人员授权，支持申请授权码、撤销与导出。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectAuth,
});

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-[11.5px]">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate text-foreground/80 tabular-nums">{value}</span>
    </div>
  );
}

function GhostButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ProjectAuth() {
  const [tab, setTab] = useState<"usp" | "other">("usp");

  const copy = (text: string, label: string) => {
    void navigator.clipboard?.writeText(text);
    toast.success(`${label}已复制`);
  };

  return (
    <PageShell title="项目授权管理" back>
      <div className="space-y-3">
        {/* 项目导入 */}
        <CollapsibleSection title="项目导入" icon={<FolderClosed className="size-4" />}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "usp", label: "USP项目" },
                { key: "other", label: "其他项目" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-md py-2.5 text-[13px] font-semibold transition-colors",
                  tab === t.key
                    ? "bg-foreground text-background"
                    : "bg-secondary/70 text-muted-foreground hover:bg-secondary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* 项目授权 */}
        <CollapsibleSection title="项目授权" icon={<Wallet className="size-4" />}>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg bg-secondary/70 px-3 py-3 text-left transition-colors hover:bg-secondary"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-bold">{projectAuthProject.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                项目代码：{projectAuthProject.code}
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </CollapsibleSection>

        {/* licences 授权 */}
        <CollapsibleSection
          title="项目 licences 授权"
          icon={<KeyRound className="size-4" />}
          count={projectLicenses.length}
        >
          <div className="mb-3 text-[11.5px] text-muted-foreground">
            <span className="font-semibold text-foreground">{projectAuthProject.name}</span>
            <span> · 授权记录</span>
          </div>

          <ul className="space-y-2.5">
            {projectLicenses.map((l) => (
              <li key={l.code} className="rounded-lg bg-secondary/60 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold tabular-nums">{l.code}</div>
                    <div className="mt-1.5 space-y-1">
                      <LabelValue label="机器码" value={l.machine} />
                      <LabelValue label="有效期" value={`${l.from} ~ ${l.to}`} />
                      <LabelValue label="申请人" value={l.applicant} />
                      <LabelValue label="最大车数" value={l.maxCars} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <GhostButton onClick={() => copy(l.code, "授权码")}>复制授权码</GhostButton>
                    <GhostButton onClick={() => copy(l.machine, "机器码")}>复制机器码</GhostButton>
                    <GhostButton
                      onClick={() => toast("已提交撤销申请")}
                      className="text-foreground"
                    >
                      撤销
                    </GhostButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 申请授权码 */}
          <div className="mt-4 rounded-lg border border-border/70 p-3">
            <div className="text-[12.5px] font-semibold">申请授权码</div>
            <input
              placeholder="请输入机器码"
              className="mt-2.5 w-full rounded-md bg-secondary/70 px-3 py-2.5 text-[13px] outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-soft"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="date"
                defaultValue="2026-08-14"
                className="w-full rounded-md bg-secondary/70 px-3 py-2.5 text-[12.5px] tabular-nums outline-none focus:ring-2 focus:ring-blue-soft"
              />
              <input
                type="date"
                defaultValue="2026-08-14"
                className="w-full rounded-md bg-secondary/70 px-3 py-2.5 text-[12.5px] tabular-nums outline-none focus:ring-2 focus:ring-blue-soft"
              />
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              允许最大车数 <span className="text-muted-foreground">*</span>
            </div>
            <input
              placeholder="请输入大于 0 的整数"
              inputMode="numeric"
              className="mt-1 w-full rounded-md bg-secondary/70 px-3 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-soft"
            />
            <button
              type="button"
              onClick={() => toast.success("授权码申请已提交")}
              className="mt-3 w-full rounded-md bg-blue-2 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              申请授权码
            </button>
          </div>
        </CollapsibleSection>

        {/* 人员授权 */}
        <CollapsibleSection
          title="项目人员授权"
          icon={<Users className="size-4" />}
          count={projectMembers.length}
        >
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[12.5px] font-semibold">已关联人员</span>
            <span className="text-[11px] text-muted-foreground">长按卡片可移除</span>
            <GhostButton onClick={() => toast("请选择要关联的人员")} className="ml-auto">
              + 添加关联人员
            </GhostButton>
          </div>
          <ul className="space-y-1.5">
            {projectMembers.map((m) => (
              <li
                key={m.wechat}
                className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2.5"
              >
                <span className="text-[13.5px] font-bold">{m.name}</span>
                <span className="ml-auto truncate text-[11px] text-muted-foreground">
                  {m.wechat}
                </span>
                <Tag tone="muted" size="sm">
                  {m.role}
                </Tag>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* 导出 */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => toast.success("licence 授权导出中")}
            className="w-full rounded-md border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            导出 licence 授权
          </button>
          <button
            type="button"
            onClick={() => toast.success("人员授权导出中")}
            className="w-full rounded-md border border-border bg-card py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            导出人员授权
          </button>
          <button
            type="button"
            onClick={() => toast.success("完整授权导出中")}
            className="w-full rounded-md bg-blue-2 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            导出完整授权
          </button>
        </div>
      </div>
    </PageShell>
  );
}
