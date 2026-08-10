import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Radio, LayoutGrid, Gauge, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "我要摇人", icon: Radio },
  { to: "/tasks", label: "系统任务", icon: LayoutGrid },
  { to: "/admin", label: "后台管理", icon: Gauge },
] as const;

export function TopBar({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean | undefined;
  right?: React.ReactNode | undefined;
}) {
  const router = useRouter();
  return (
    <header className="glass-bar sticky top-0 z-20 border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        {back ? (
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="返回"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <span className="size-9" />
        )}
        <h1 className="flex-1 text-center text-[15px] font-semibold tracking-wide">{title}</h1>
        <div className="flex min-w-9 items-center justify-end">{right}</div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-30 border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-3xl items-stretch">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-2xl transition-all duration-300",
                  active ? "bg-mint-soft text-mint" : "text-muted-foreground",
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageShell({
  title,
  back,
  right,
  children,
}: {
  title: string;
  back?: boolean | undefined;
  right?: React.ReactNode | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      <TopBar title={title} back={back} right={right} />
      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
