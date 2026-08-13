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
        left: pos.x,
        top: pos.y,
        width: SIZE,
        height: SIZE,
        touchAction: "none",
        backgroundColor: "color-mix(in oklab, var(--primary) 70%, transparent)",
      }}
      className={`fixed z-50 grid select-none place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-soft)] backdrop-blur-md transition-transform ${
        dragging ? "scale-105 cursor-grabbing" : "cursor-grab active:scale-95"
      }`}
    >
      <TicketPlus className="size-4" />
      <span className="mt-0.5 text-[10px] font-semibold leading-none">转工单</span>
    </button>
  );
}
