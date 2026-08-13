import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleSection({
  title,
  icon,
  count,
  defaultOpen = false,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  count?: number | undefined;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
      >
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        <span className="text-[13.5px] font-semibold text-foreground">{title}</span>
        {typeof count === "number" ? (
          <span className="grid min-w-[18px] place-items-center rounded-full bg-muted-foreground px-1 text-[10px] font-semibold leading-4 text-white">
            {count}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={id}
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/60 px-4 py-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
