import { describe, expect, test } from "bun:test";
import { relationTickets as all } from "@/data/task-relations";
import { arrowsBetween, buildRows, coveredEdges, summaryFor } from "./task-graph";

const ids = new Set(all.map((t) => t.id));
const rowsOf = (collapsed = new Set<string>()) => buildRows(all, collapsed);

describe("关系列表", () => {
  test("简单链在父工单内连续排列并画小箭头", () => {
    const rows = rowsOf();
    const order = rows.map((r) => r.t.id);
    const i = order.indexOf("235");
    expect(order.slice(i, i + 3)).toEqual(["235", "286", "307"]);
    const arrows = arrowsBetween(rows, all);
    expect(arrows[i]).toBe(true);
    expect(arrows[i + 1]).toBe(true);
  });

  test("多前置不画成串行", () => {
    const rows = rowsOf();
    const arrows = arrowsBetween(rows, all);
    const i = rows.findIndex((r) => r.t.id === "501");
    expect(rows[i + 1]?.t.id).toBe("502");
    expect(arrows[i]).toBe(false);
  });

  test("子工单不移出父工单，折叠后隐藏全部后代", () => {
    const rows = rowsOf(new Set(["130"]));
    expect(rows.find((r) => r.t.id === "131")).toBeUndefined();
    expect(rows.find((r) => r.t.id === "132")).toBeUndefined();
    expect(rowsOf().find((r) => r.t.id === "132")?.depth).toBe(2);
  });

  test("小箭头已表达的依赖不在摘要中重复，跨组依赖仍显示", () => {
    const rows = rowsOf();
    const covered = coveredEdges(rows, arrowsBetween(rows, all));
    const s = summaryFor(all.find((t) => t.id === "307")!, all, ids, covered)!;
    expect(s.pred?.id).toBe("405");
    expect(s.moreBefore).toBe(false);
    expect(summaryFor(all.find((t) => t.id === "286")!, all, ids, covered)).toBeNull();
  });

  test("两侧多依赖显示一个工单号加省略号", () => {
    const s = summaryFor(all.find((t) => t.id === "700")!, all, ids, new Set())!;
    expect(s.pred?.id).toBe("405");
    expect(s.moreBefore).toBe(true);
    expect(s.succ?.id).toBe("701");
    expect(s.moreAfter).toBe(true);
  });

  test("不在当前结果中的工单不生成链接", () => {
    const s = summaryFor(all.find((t) => t.id === "503")!, all, new Set(["503"]), new Set())!;
    expect(s.pred).toBeNull();
    expect(s.moreBefore).toBe(true);
  });
});
