// @ts-nocheck -- bun:test types are not installed in this project
import { describe, expect, test } from "bun:test";
import { relationTickets } from "@/data/task-relations";
import { buildFlatRefs, buildRelationRows } from "@/lib/task-graph";

const rows = buildRelationRows(relationTickets, relationTickets, new Set());
const row = (id: string) => rows.find((r) => r.ticket.id === id)!;

describe("关系列表", () => {
  test("子工单按父级逐级缩进", () => {
    expect(row("r100").depth).toBe(0);
    expect(row("r286").depth).toBe(1);
    expect(row("r411").depth).toBe(2);
  });

  test("简单链用相邻小箭头：#235 → #286 → #307", () => {
    expect(row("r286").arrowFromPrev).toBe(true);
    expect(row("r307").arrowFromPrev).toBe(true);
    expect(row("r235").arrowFromPrev).toBe(false);
  });

  test("跨组依赖改为顶部引用，链内依赖不重复", () => {
    expect(row("r286").ref?.prev?.id).toBe("r405");
    expect(row("r286").ref?.next).toBeUndefined();
  });

  test("多前置不被画成串行：代码审查与测试验收之间无箭头", () => {
    expect(row("r602").arrowFromPrev).toBe(false);
  });

  test("前后各只显示一个，多余用省略号", () => {
    const ref = buildFlatRefs(relationTickets, relationTickets).get("r603")!;
    expect(ref.prev?.id).toBe("r600");
    expect(ref.prevMore).toBe(true);
    expect(ref.next?.id).toBe("r604");
    expect(ref.nextMore).toBe(true);
  });

  test("折叠父工单隐藏全部后代，不留箭头", () => {
    const c = buildRelationRows(relationTickets, relationTickets, new Set(["r400"]));
    expect(c.some((r) => r.ticket.id === "r411" || r.ticket.id === "r405")).toBe(false);
  });

  test("被筛选掉的关联工单不生成链接", () => {
    const visible = relationTickets.filter((t) => t.id !== "r405");
    const r = buildRelationRows(relationTickets, visible, new Set()).find((x) => x.ticket.id === "r286")!;
    expect(r.ref?.prev).toBeUndefined();
    expect(r.ref?.prevMore).toBe(true);
  });
});
