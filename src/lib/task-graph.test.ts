import { describe, expect, it } from "vitest";
import { relationTickets } from "@/data/task-relations";
import { buildRows, dependencyEdges, edgeState } from "./task-graph";

const ids = (s: Set<string>) => buildRows(relationTickets, s).map((r) => r.ticket.no);

describe("task graph", () => {
  it("parallel predecessors are not chained", () => {
    const edges = dependencyEdges(relationTickets);
    expect(edges.some((e) => e.from === "r301" && e.to === "r302")).toBe(false);
    expect(edges.filter((e) => e.to === "r303").map((e) => e.from).sort()).toEqual(["r301", "r302"]);
  });

  it("children stay right under their parent, in dependency order", () => {
    const list = ids(new Set());
    const i = list.indexOf("#100");
    expect(list.slice(i, i + 4)).toEqual(["#100", "#101", "#102", "#103"]);
  });

  it("collapsed endpoint is not re-attached to the parent", () => {
    const visible = new Set(buildRows(relationTickets, new Set(["r400"])).map((r) => r.ticket.id));
    const all = new Set(relationTickets.map((t) => t.id));
    expect(edgeState({ from: "r405", to: "r601" }, visible, all)).toBe("collapsed");
    expect(dependencyEdges(relationTickets).some((e) => e.from === "r400")).toBe(false);
  });
});
