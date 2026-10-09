import type { Ticket } from "@/data/mock";

/**
 * 系统任务页「关系列表」示例工单。
 * 父子关系存于 parentId，前后置依赖存于 dependsOn（当前工单依赖的前置工单 id）。
 */
function t(
  id: string,
  title: string,
  status: Ticket["status"],
  extra: Partial<Ticket> = {},
): Ticket {
  return {
    id,
    no: `#${id.slice(1)}`,
    title,
    kind: "需求",
    priority: "中",
    status,
    project: "上线项目A",
    desc: `${title}（示例工单）`,
    owner: "张俊磊",
    reporter: "罗昊",
    participants: ["李", "王"],
    date: "2026-08-06",
    ...extra,
  };
}

export const relationTickets: Ticket[] = [
  // 父子组内含简单依赖链 + 一条跨组依赖（#286 依赖 #405）
  t("r100", "项目上线", "处理中", { priority: "高" }),
  t("r235", "环境准备", "已解决", { parentId: "r100" }),
  t("r286", "部署服务", "处理中", { parentId: "r100", dependsOn: ["r235", "r405"], owner: "贾爽" }),
  t("r307", "上线验证", "待处理", { parentId: "r100", dependsOn: ["r286"] }),

  // 多层父子关系
  t("r400", "数据平台迁移", "处理中", { project: "数据中台", reporter: "官伟文" }),
  t("r405", "数据迁移", "处理中", { parentId: "r400", project: "数据中台" }),
  t("r410", "历史数据清洗", "待处理", { parentId: "r400", project: "数据中台" }),
  t("r411", "订单表清洗", "已解决", { parentId: "r410", project: "数据中台" }),
  t("r412", "库存表清洗", "待处理", { parentId: "r410", project: "数据中台" }),

  // 仅父子关系
  t("r500", "季度设备巡检", "待处理", { kind: "支持", project: "运维中心", priority: "低" }),
  t("r501", "一号仓巡检", "已解决", { parentId: "r500", kind: "支持", project: "运维中心", priority: "低" }),
  t("r502", "二号仓巡检", "待处理", { parentId: "r500", kind: "支持", project: "运维中心", priority: "低" }),

  // 多前置汇合 + 多后置分叉（#603 前后都有多条依赖）
  t("r600", "合规审批", "已解决", { kind: "功能", project: "发布中心" }),
  t("r601", "代码审查", "已解决", { kind: "功能", project: "发布中心" }),
  t("r602", "测试验收", "处理中", { kind: "功能", project: "发布中心" }),
  t("r603", "发布正式版本", "待处理", {
    kind: "功能",
    project: "发布中心",
    priority: "紧急",
    dependsOn: ["r600", "r601", "r602"],
  }),
  t("r604", "通知客户", "待处理", { kind: "功能", project: "发布中心", dependsOn: ["r603"] }),
  t("r605", "更新帮助文档", "待处理", { kind: "功能", project: "发布中心", dependsOn: ["r603"] }),
];
