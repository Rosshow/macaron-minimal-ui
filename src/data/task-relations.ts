import type { Ticket } from "@/data/mock";

/**
 * 系统任务关系列表示例数据。
 * 关系只来自结构化字段：parentId（父子）与 dependsOn（前置 → 当前）。
 */
type Seed = Pick<Ticket, "id" | "title" | "status" | "priority"> &
  Partial<Pick<Ticket, "parentId" | "dependsOn" | "owner" | "reporter" | "project" | "date">>;

const seeds: Seed[] = [
  // 1. 独立工单
  { id: "120", title: "导航地图更新后定位漂移", status: "待处理", priority: "中" },
  // 4 + 8. 父子组内简单链 #235 → #286 → #307，#307 另有跨组前置 #405
  { id: "100", title: "项目上线", status: "处理中", priority: "高" },
  { id: "235", title: "环境准备", status: "已解决", priority: "中", parentId: "100" },
  { id: "286", title: "部署服务", status: "处理中", priority: "高", parentId: "100", dependsOn: ["235"] },
  { id: "307", title: "上线验证", status: "待处理", priority: "中", parentId: "100", dependsOn: ["286", "405"] },
  // 2. 仅父子
  { id: "110", title: "现场设备巡检", status: "处理中", priority: "低" },
  { id: "111", title: "充电桩巡检", status: "已解决", priority: "低", parentId: "110" },
  { id: "112", title: "激光雷达清洁", status: "待处理", priority: "低", parentId: "110" },
  // 3. 多层父子
  { id: "130", title: "调度系统升级", status: "处理中", priority: "高" },
  { id: "131", title: "USP 版本适配", status: "处理中", priority: "高", parentId: "130" },
  { id: "132", title: "接口兼容性测试", status: "已解决", priority: "中", parentId: "131" },
  { id: "133", title: "回滚方案验证", status: "待处理", priority: "中", parentId: "131" },
  // 7. 跨组依赖的源头
  { id: "400", title: "数据迁移批次", status: "处理中", priority: "中" },
  { id: "405", title: "数据迁移", status: "处理中", priority: "高", parentId: "400" },
  { id: "406", title: "迁移数据核对", status: "待处理", priority: "中", parentId: "400" },
  // 5. 多前置 → 同一后置（#501、#502 并行）
  { id: "501", title: "代码审查", status: "已解决", priority: "中" },
  { id: "502", title: "测试验收", status: "处理中", priority: "中" },
  { id: "503", title: "发布正式版本", status: "待处理", priority: "高", dependsOn: ["501", "502"] },
  // 6. 一前置 → 多后置
  { id: "601", title: "需求评审", status: "已解决", priority: "中" },
  { id: "602", title: "前端开发", status: "处理中", priority: "中", dependsOn: ["601"] },
  { id: "603", title: "后端开发", status: "处理中", priority: "中", dependsOn: ["601"] },
  // 9. 两侧都有多个直接依赖，需要省略号
  { id: "700", title: "整体验收报告", status: "待处理", priority: "紧急", dependsOn: ["501", "601", "405"] },
  { id: "701", title: "客户签字确认", status: "待处理", priority: "高", dependsOn: ["700"] },
  { id: "702", title: "项目结项归档", status: "待处理", priority: "中", dependsOn: ["700"] },
];

export const relationTickets: Ticket[] = seeds.map((s, i) => ({
  kind: "需求",
  desc: `${s.title}（关系列表示例工单）`,
  owner: s.owner ?? ["张俊磊", "李明", "王芳", "陈晨"][i % 4]!,
  reporter: s.reporter ?? ["赵磊", "孙悦", "周杰"][i % 3]!,
  participants: ["李", "王"],
  project: s.project ?? "上线项目",
  date: s.date ?? `2026-10-${String(9 - (i % 8)).padStart(2, "0")}`,
  no: `#${s.id}`,
  ...s,
}));
