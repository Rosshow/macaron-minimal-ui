import type { Ticket } from "@/data/mock";

/** 系统任务关系列表示例数据：父子边用 parentId，依赖边用 dependsOn（前置工单 id 列表）。 */
type Seed = Omit<Ticket, "kind" | "desc" | "participants" | "date" | "project"> &
  Partial<Pick<Ticket, "kind" | "date" | "project">>;

const seeds: Seed[] = [
  // 1. 独立工单
  { id: "r001", no: "#001", title: "客户现场网络波动排查", priority: "中", status: "待处理", owner: "王敏", reporter: "李雷" },
  // 2 + 5. 父子组内部存在依赖
  { id: "r100", no: "#100", title: "项目上线", priority: "高", status: "处理中", owner: "张俊磊", reporter: "陈晨" },
  { id: "r101", no: "#101", title: "环境准备", priority: "高", status: "已解决", owner: "王敏", reporter: "张俊磊", parentId: "r100" },
  { id: "r102", no: "#102", title: "部署服务", priority: "高", status: "处理中", owner: "张俊磊", reporter: "张俊磊", parentId: "r100", dependsOn: ["r101"] },
  { id: "r103", no: "#103", title: "上线验证", priority: "中", status: "待处理", owner: "李雷", reporter: "张俊磊", parentId: "r100", dependsOn: ["r102"] },
  // 3. 多层父子（仅父子，无依赖）
  { id: "r400", no: "#400", title: "仓库二期改造", priority: "中", status: "处理中", owner: "陈晨", reporter: "陈晨" },
  { id: "r401", no: "#401", title: "地图重绘", priority: "中", status: "处理中", owner: "王敏", reporter: "陈晨", parentId: "r400" },
  { id: "r402", no: "#402", title: "A 区地图采集", priority: "低", status: "已解决", owner: "王敏", reporter: "王敏", parentId: "r401" },
  { id: "r403", no: "#403", title: "B 区地图采集", priority: "低", status: "待处理", owner: "李雷", reporter: "王敏", parentId: "r401" },
  { id: "r405", no: "#405", title: "数据迁移", priority: "高", status: "处理中", owner: "张俊磊", reporter: "陈晨", parentId: "r400" },
  // 4. 三张同级依赖链
  { id: "r201", no: "#201", title: "调度参数确认", priority: "中", status: "已解决", owner: "李雷", reporter: "王敏" },
  { id: "r202", no: "#202", title: "调度参数下发", priority: "中", status: "处理中", owner: "王敏", reporter: "王敏", dependsOn: ["r201"] },
  { id: "r203", no: "#203", title: "调度效果复测", priority: "中", status: "待处理", owner: "李雷", reporter: "王敏", dependsOn: ["r202"] },
  // 6. 两个前置汇合到一个后置
  { id: "r301", no: "#301", title: "代码审查", priority: "高", status: "已解决", owner: "陈晨", reporter: "张俊磊" },
  { id: "r302", no: "#302", title: "测试验收", priority: "高", status: "处理中", owner: "李雷", reporter: "张俊磊" },
  { id: "r303", no: "#303", title: "发布正式版本", priority: "紧急", status: "待处理", owner: "张俊磊", reporter: "张俊磊", dependsOn: ["r301", "r302"] },
  // 7. 一个前置指向多个后置
  { id: "r501", no: "#501", title: "USP 版本升级", priority: "高", status: "处理中", owner: "王敏", reporter: "陈晨" },
  { id: "r502", no: "#502", title: "车载程序适配", priority: "中", status: "待处理", owner: "李雷", reporter: "陈晨", dependsOn: ["r501"] },
  { id: "r503", no: "#503", title: "监控面板适配", priority: "低", status: "待处理", owner: "陈晨", reporter: "陈晨", dependsOn: ["r501"] },
  // 8. 跨父子组依赖：依赖 #400 组内的 #405
  { id: "r601", no: "#601", title: "报表口径切换", priority: "中", status: "新建", owner: "张俊磊", reporter: "李雷", dependsOn: ["r405"] },
];

export const relationTickets: Ticket[] = seeds.map((s, i) => ({
  kind: "需求",
  project: "AGV 调度项目",
  date: `2026-10-${String(9 - (i % 8)).padStart(2, "0")}`,
  desc: "",
  participants: [],
  ...s,
}));
