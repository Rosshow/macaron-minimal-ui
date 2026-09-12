import { cn } from "@/lib/utils";

export function TagWarningBadge({ className }: { className?: string }) {
  return (
    <span
      aria-label="信息不全"
      className={cn(
        "pointer-events-none absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full border border-background/40 bg-gray text-[9px] font-bold text-white shadow-sm",
        className,
      )}
    >
      !
    </span>
  );
}
