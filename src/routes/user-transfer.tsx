import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ChevronRight, Check } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { projectMembers } from "@/data/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/user-transfer")({
  head: () => ({
    meta: [
      { title: "设置用户 · 迁移用户数据与合并账号" },
      { name: "description", content: "将源用户的任务与派单字段迁移到目标用户，并删除源用户，操作不可逆请谨慎执行。" },
      { property: "og:title", content: "设置用户 · 迁移用户数据与合并账号" },
      { property: "og:description", content: "将源用户的任务与派单字段迁移到目标用户，并删除源用户，操作不可逆请谨慎执行。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UserTransferPage,
});

function PickerField({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <section className="surface-card p-4">
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-3 text-left transition-colors hover:bg-secondary"
      >
        <span className={cn("text-[13.5px]", value ? "font-semibold" : "text-muted-foreground")}>
          {value ?? placeholder}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </section>
  );
}

function UserTransferPage() {
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [picking, setPicking] = useState<"source" | "target" | null>(null);

  const ready = !!source && !!target && source !== target;

  const choose = (name: string) => {
    if (picking === "source") setSource(name);
    if (picking === "target") setTarget(name);
    setPicking(null);
  };

  return (
    <PageShell title="设置用户" back>
      <div className="rounded-xl border border-border bg-secondary/50 p-3.5">
        <p className="text-[12.5px] font-semibold">操作说明</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          将源用户(A)的任务、派单字段迁移到目标用户(B)，并删除源用户。
          <span className="font-semibold text-foreground">此操作不可逆，请谨慎执行。</span>
        </p>
      </div>

      <div className="mt-3">
        <PickerField
          label="源用户（将被删除）"
          value={source}
          placeholder="点击选择源用户"
          onClick={() => setPicking("source")}
        />
      </div>

      <div className="flex justify-center py-3 text-muted-foreground">
        <ArrowDown className="size-4" />
      </div>

      <PickerField
        label="目标用户（保留账号）"
        value={target}
        placeholder="点击选择目标用户"
        onClick={() => setPicking("target")}
      />

      <button
        type="button"
        disabled={!ready}
        onClick={() => toast.success(`已将「${source}」的数据迁移至「${target}」`)}
        className="mt-4 w-full rounded-lg bg-blue-2 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        执行迁移
      </button>
      {source && target && source === target ? (
        <p className="mt-2 text-center text-[11.5px] text-muted-foreground">源用户与目标用户不能相同</p>
      ) : null}

      <Sheet open={picking !== null} onOpenChange={(o) => !o && setPicking(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle className="text-[15px]">
              {picking === "source" ? "选择源用户" : "选择目标用户"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-3 grid max-h-[50vh] gap-1.5 overflow-y-auto pb-4">
            {projectMembers.map((m) => {
              const active = (picking === "source" ? source : target) === m.name;
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => choose(m.name)}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-secondary/60"
                >
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold">{m.name}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">{m.role}</span>
                  </span>
                  {active ? <Check className="size-4 shrink-0 text-blue-2" /> : null}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
