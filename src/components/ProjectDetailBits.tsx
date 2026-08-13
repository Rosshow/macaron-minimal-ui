import { ChevronRight, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-4", className)}>
      {title ? (
        <h2 className="mb-3 border-b border-border/70 pb-2.5 text-[13px] font-semibold text-foreground">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function FieldRow({
  label,
  value,
  kind = "edit",
}: {
  label: string;
  value: string;
  kind?: "edit" | "select";
}) {
  const empty = value === "未设置" || value === "未填写" || value === "未指定" || value === "无";
  return (
    <div className="mt-2.5 first:mt-0">
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg bg-secondary/70 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            empty ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
        {kind === "select" ? (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Pencil className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

export function MetaRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0">
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn("text-[13px]", strong ? "font-semibold" : "text-muted-foreground")}>
          {value}
        </span>
        <Pencil className="size-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}
