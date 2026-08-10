import { cn } from "@/lib/utils";

const toneVar: Record<string, string> = {
  mint: "var(--mint)",
  sky: "var(--sky)",
  rose: "var(--rose)",
  butter: "var(--butter)",
  lilac: "var(--lilac)",
  apricot: "var(--apricot)",
};

export function Avatar({
  name,
  tone = "sky",
  className,
}: {
  name: string;
  tone?: keyof typeof toneVar | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-card",
        className,
      )}
      style={{ background: toneVar[tone] ?? toneVar.sky }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function Donut({
  segments,
  size = 132,
}: {
  segments: { value: number; tone: keyof typeof toneVar }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle
            key={i}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={toneVar[s.tone]}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(len - 4, 0)} ${c}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

export function Stat({
  value,
  label,
  tone = "sky",
}: {
  value: string | number;
  label: string;
  tone?: keyof typeof toneVar;
}) {
  return (
    <div className="text-center">
      <div className="text-[22px] font-bold tabular-nums" style={{ color: toneVar[tone] }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
