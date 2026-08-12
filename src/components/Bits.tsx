import { cn } from "@/lib/utils";

const toneVar: Record<string, string> = {
  mint: "var(--mint)",
  sky: "var(--sky)",
  rose: "var(--rose)",
  butter: "var(--butter)",
  lilac: "var(--lilac)",
  apricot: "var(--apricot)",
  gray: "var(--gray)",
  "gray-light": "var(--gray-light)",
  "gray-dark": "var(--gray-dark)",
  "gray-40": "var(--gray-40)",
  "gray-25": "var(--gray-25)",
  "blue-1": "var(--blue-1)",
  "blue-2": "var(--blue-2)",
  "blue-3": "var(--blue-3)",
  "blue-4": "var(--blue-4)",
  "blue-5": "var(--blue-5)",
  "clay-1": "var(--clay-1)",
  "clay-2": "var(--clay-2)",
  "clay-3": "var(--clay-3)",
  "clay-4": "var(--clay-4)",
  "clay-5": "var(--clay-5)",
};

export function toneColor(tone: string) {
  return toneVar[tone] ?? toneVar["sky"]!;
}

export function Avatar({
  name,
  tone = "sky",
  size = "md",
  plain = false,
  className,
}: {
  name: string;
  tone?: keyof typeof toneVar | string;
  size?: "xs" | "sm" | "md";
  plain?: boolean;
  className?: string;
}) {
  const sizing =
    size === "xs"
      ? "size-6 text-[10px]"
      : size === "sm"
        ? "size-7 text-[11px]"
        : "size-8 text-[12px]";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        sizing,
        plain ? "bg-gray-40 text-white" : "text-card",
        className,
      )}
      style={plain ? undefined : { background: toneColor(String(tone)) }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 3,
  className,
}: {
  names: string[];
  max?: number;
  className?: string;
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {shown.map((n, i) => (
        <Avatar
          key={`${n}-${i}`}
          name={n}
          size="xs"
          plain
          className="bg-gray-25 ring-2 ring-card"
        />
      ))}
      {rest > 0 ? (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-[9.5px] font-semibold text-muted-foreground ring-2 ring-card">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}


export type DonutSegment = { value: number; tone: string; label?: string };

export function Donut({
  segments,
  size = 132,
  thickness = 18,
  gap = 0,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  gap?: number;
  centerValue?: string | number;
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={toneColor(s.tone)}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(len - gap, 0)} ${c}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerValue !== undefined ? (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[20px] font-bold tabular-nums text-foreground">{centerValue}</div>
            {centerLabel ? (
              <div className="text-[10.5px] text-muted-foreground">{centerLabel}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Legend({
  items,
  className,
}: {
  items: { label: string; value: number; tone: string; percent: number }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex-1 space-y-2", className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: toneColor(it.tone) }}
          />
          <span className="text-[12.5px] text-muted-foreground">{it.label}</span>
          <span className="ml-auto text-[12.5px] font-bold tabular-nums text-foreground">
            {it.percent}%
          </span>
          <span className="w-7 text-right text-[11.5px] tabular-nums text-muted-foreground">
            {it.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Stat({
  value,
  label,
  tone = "sky",
}: {
  value: string | number;
  label: string;
  tone?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[22px] font-bold tabular-nums" style={{ color: toneColor(tone) }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
