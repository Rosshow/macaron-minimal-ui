import { useCallback, useEffect, useRef, useState } from "react";
import { TicketPlus } from "lucide-react";

const SIZE = 52;
const MARGIN = 12;

export function FloatingTicketButton({ onClick }: { onClick?: () => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const clamp = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - SIZE - MARGIN;
    const maxY = window.innerHeight - SIZE - MARGIN;
    return {
      x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, maxX)),
      y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, maxY)),
    };
  }, []);

  useEffect(() => {
    setPos(clamp(window.innerWidth - SIZE - 16, window.innerHeight - SIZE - 150));
    const onResize = () => setPos((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clamp]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pos) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    moved.current = false;
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    e.preventDefault();
    const next = clamp(e.clientX - offset.current.x, e.clientY - offset.current.y);
    if (pos && (Math.abs(next.x - pos.x) > 2 || Math.abs(next.y - pos.y) > 2)) moved.current = true;
    setPos(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  if (!pos) return null;

  return (
    <div
      style={{
        left: pos.x,
        top: pos.y,
        width: SIZE,
      }}
      className="fixed z-50 select-none"
    >
      <button
        type="button"
        aria-label="转工单"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={() => {
          if (moved.current) return;
          onClick?.();
        }}
        style={{
          width: SIZE,
          height: SIZE,
          touchAction: "none",
        }}
        className={`relative grid place-items-center rounded-full text-primary-foreground transition-transform ${
          dragging ? "scale-105 cursor-grabbing" : "cursor-grab active:scale-95"
        }`}
      >
        {/* 液态玻璃底层 */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: "color-mix(in oklab, var(--primary) 26%, transparent)",
            backdropFilter: "saturate(1.6) blur(28px)",
            border: "1px solid color-mix(in oklab, rgba(255,255,255,0.42), rgba(255,255,255,0.12))",
            boxShadow: `
              inset 0 1.5px 1px rgba(255,255,255,0.28),
              inset 0 -1px 1px rgba(0,0,0,0.04),
              0 2px 4px rgba(0,0,0,0.04),
              0 14px 34px color-mix(in oklab, var(--primary) 16%, rgba(0,0,0,0.08))
            `,
          }}
        />
        {/* 顶部高光，模拟液态玻璃折射 */}
        <span
          className="pointer-events-none absolute inset-x-1.5 top-1.5 h-[36%] rounded-t-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
        <TicketPlus
          className="relative z-10 size-5"
          style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))" }}
        />
      </button>

      {/* 标签独立显示在按钮正下方 */}
      <span
        className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      >
        转工单
      </span>
    </div>
  );
}
