import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toneColor } from "@/components/Bits";

export type MonthDatum = { key: string; year: number; month: number; value: number };

/** 以当前月为中心，前后各 6 个月的可滑动窗口；默认视口显示前后 3 个月。 */
export function MonthBars({
  data,
  years,
  className,
}: {
  data: MonthDatum[];
  years: number[];
  className?: string;
}) {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, setYear] = useState<number | "recent">("recent");
  const [active, setActive] = useState<string>(currentKey);
  const scroller = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    if (year === "recent") {
      const base = new Date(now.getFullYear(), now.getMonth(), 1);
      const keys: string[] = [];
      for (let i = -6; i <= 6; i++) {
        const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
        keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      return keys.map(
        (k) =>
          data.find((d) => d.key === k) ?? {
            key: k,
            year: Number(k.slice(0, 4)),
            month: Number(k.slice(5)),
            value: 0,
          },
      );
    }
    return Array.from({ length: 12 }, (_, i) => {
      const k = `${year}-${String(i + 1).padStart(2, "0")}`;
      return (
        data.find((d) => d.key === k) ?? { key: k, year: year as number, month: i + 1, value: 0 }
      );
    });
  }, [data, year]);

  const max = Math.max(...items.map((i) => i.value), 4);
  const ticks = 4;
  const step = Math.ceil(max / ticks);
  const top = step * ticks;

  // 默认滚动到中间（最近月份）
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`[data-key="${active}"]`);
    if (target) {
      el.scrollLeft = Math.max(0, target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2);
    }
  }, [year]);

  return (
    <div className={cn("", className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground">按月统计</span>
        <select
          value={String(year)}
          onChange={(e) =>
            setYear(e.target.value === "recent" ? "recent" : Number(e.target.value))
          }
          className="ml-auto rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-medium text-foreground outline-none"
          aria-label="按年筛选"
        >
          <option value="recent">近半年前后</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y} 年
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex h-[168px] w-6 flex-col justify-between pb-6 text-right text-[10px] text-muted-foreground tabular-nums">
          {Array.from({ length: ticks + 1 }, (_, i) => (
            <span key={i}>{top - i * step}</span>
          ))}
        </div>
        <div
          ref={scroller}
          className="flex-1 overflow-x-auto overscroll-x-contain scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex h-[168px] min-w-full items-end gap-3 pr-1">
            {items.map((it) => {
              const isActive = it.key === active;
              const isFuture = it.key > currentKey;
              const h = Math.round((it.value / top) * 130);
              return (
                <button
                  key={it.key}
                  data-key={it.key}
                  type="button"
                  onClick={() => setActive(it.key)}
                  className="flex w-[42px] shrink-0 flex-col items-center justify-end gap-2"
                  style={{ height: "100%" }}
                >
                  <span className="relative flex w-full flex-1 items-end justify-center">
                    {isActive ? (
                      <span className="absolute -top-1 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-semibold text-background">
                        {it.value} 个项目
                      </span>
                    ) : null}
                    <span
                      className="w-[22px] rounded-t-lg rounded-b-lg transition-all duration-300"
                      style={{
                        height: Math.max(h, 4),
                        background: isActive
                          ? toneColor("blue-3")
                          : isFuture
                            ? "var(--gray-light)"
                            : toneColor("blue-5"),
                      }}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      isActive ? "font-bold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {it.month} 月
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
        左右滑动查看前后 6 个月，更多请按年筛选
      </p>
    </div>
  );
}
