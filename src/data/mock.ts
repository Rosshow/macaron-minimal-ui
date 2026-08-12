export type Tone = "blue" | "blue-deep" | "blue-3" | "gray" | "muted" | "sky";

export type Ticket = {
  id: string;
  no: string;
  title: string;
  kind: "需求" | "问题" | "功能" | "支持";
  priority: "低" | "中" | "高" | "紧急";
  status: "新建" | "处理中" | "进行中" | "已解决" | "已关闭" | "已取消";
  project: string;
  desc: string;
  owner: string;
  reporter: string;
  participants: string[];
  date: string;
};

export const tickets: Ticket[] = [
  {
    id: "338",
    no: "#338",
    title: "讨论区评论引用功能",
    kind: "需求",
    priority: "中",
    status: "处理中",
    project: "摇人吧服务号",
    desc: "讨论区需支持对其他用户的评论进行引用，主要场景为针对工单进行讨论时引用已发评论内容，方便追溯讨论。",
    owner: "张俊磊",
    reporter: "罗昊",
    participants: ["李", "王", "陈"],
    date: "2026-08-07",
  },
  {
    id: "337",
    no: "#337",
    title: "聊天记录分条转发生成链接",
    kind: "需求",
    priority: "高",
    status: "处理中",
    project: "摇人吧服务号",
    desc: "聊天记录可分条转发，生成一条链接，可转发到微信群。使用场景为提供工单相关的细节补充。",
    owner: "张俊磊",
    reporter: "罗昊",
    participants: ["王", "赵"],
    date: "2026-08-07",
  },
  {
    id: "336",
    no: "#336",
    title: "讨论区消息传递方式更新",
    kind: "需求",
    priority: "中",
    status: "处理中",
    project: "摇人吧服务号",
    desc: "工单详情页讨论区消息传递方式更新，取消定时刷新，改为主流触发式。",
    owner: "张俊磊",
    reporter: "罗昊",
    participants: ["孙"],
    date: "2026-08-07",
  },
  {
    id: "333",
    no: "#333",
    title: "工单评论区时间显示方式调整",
    kind: "功能",
    priority: "高",
    status: "进行中",
    project: "摇人吧服务号提单",
    desc: "用户希望调整服务号工单评论区的时间显示方式，具体调整内容待进一步明确。已指定处理人为张文星。",
    owner: "张文星",
    reporter: "罗昊",
    participants: ["周", "吴", "郑", "冯"],
    date: "2026-08-07",
  },
  {
    id: "332",
    no: "#332",
    title: "充电不打断且优先级配置失效",
    kind: "问题",
    priority: "紧急",
    status: "进行中",
    project: "浙江湖州中力安吉北区调度升级项目",
    desc: "车辆电量充足但不打断充电执行任务，2.6.3 版本两次修改未修复，且现场任务优先级配置整体不生效，怀疑后端分配优先逻辑改动导致。",
    owner: "中力-汪海波",
    reporter: "胡健楠",
    participants: ["陈", "褚", "卫"],
    date: "2026-08-06",
  },
  {
    id: "330",
    no: "#330",
    title: "新用户注册方式修改",
    kind: "功能",
    priority: "高",
    status: "进行中",
    project: "摇人吧服务号提单",
    desc: "新用户注册方式修改，增加注册链接，优化注册内容。已确认项目归属及处理人，待实施。",
    owner: "张文星",
    reporter: "罗昊",
    participants: ["蒋", "沈"],
    date: "2026-08-06",
  },
  {
    id: "329",
    no: "#329",
    title: "提单时间截止时间框架设计",
    kind: "功能",
    priority: "高",
    status: "进行中",
    project: "摇人吧服务号提单",
    desc: "需增加提单时间截止时间框架设计功能点，项目落在摇人吧服务号，已确认需求内容，待张俊磊处理。",
    owner: "张俊磊",
    reporter: "罗昊",
    participants: ["韩"],
    date: "2026-08-06",
  },
  {
    id: "339",
    no: "#339",
    title: "目标点不可达但仍在运动",
    kind: "支持",
    priority: "高",
    status: "进行中",
    project: "重庆赛美两江新动力混场项目",
    desc: "目标点判定为不可达，车辆仍持续运动，需要现场复现并确认路径规划模块行为。",
    owner: "贾爽",
    reporter: "官伟文",
    participants: ["杨", "朱", "秦"],
    date: "2026-08-08",
  },
];

export const kindTone: Record<Ticket["kind"], Tone> = {
  需求: "blue",
  问题: "gray",
  功能: "blue-deep",
  支持: "muted",
};

export const priorityTone: Record<Ticket["priority"], Tone> = {
  低: "sky",
  中: "blue",
  高: "blue-deep",
  紧急: "blue-deep",
};

export const statusTone: Record<Ticket["status"], Tone> = {
  新建: "sky",
  处理中: "blue",
  进行中: "blue",
  已解决: "blue-deep",
  已关闭: "gray",
  已取消: "gray",
};

export const projects = [
  { name: "安吉北区出厂测试", code: "AJBQCS", stage: "正在实施", progress: 55 },
  { name: "国铁集团无人正面吊车西南交大合作申报项目", code: "100", stage: "出厂测试", progress: 38 },
  { name: "江苏常州多摩川混场项目", code: "13", stage: "正在实施", progress: 62 },
  { name: "印尼雅加达 TNS-ATI 叉车项目", code: "16", stage: "验收运营", progress: 88 },
  { name: "安徽合肥赛美中储混场项目", code: "17", stage: "正在实施", progress: 47 },
  { name: "重庆赛美两江新动力混场项目", code: "18", stage: "正在实施", progress: 51 },
  { name: "四川峨眉山乐飞光电混场项目", code: "19", stage: "正在实施", progress: 33 },
];

export const stageChips: { label: string; count: number; tone: Tone }[] = [
  { label: "售前方案", count: 1, tone: "blue" },
  { label: "投标阶段", count: 0, tone: "sky" },
  { label: "签单洽谈", count: 0, tone: "blue-3" },
  { label: "已签合同", count: 8, tone: "sky" },
  { label: "出厂测试", count: 10, tone: "gray" },
  { label: "即将进场", count: 13, tone: "blue-3" },
  { label: "延期进场", count: 4, tone: "blue-deep" },
  { label: "正在实施", count: 21, tone: "blue" },
  { label: "实施暂停", count: 2, tone: "gray" },
  { label: "试运行中", count: 8, tone: "sky" },
  { label: "验收运营", count: 16, tone: "blue" },
  { label: "项目暂停", count: 2, tone: "blue-3" },
  { label: "项目终止", count: 0, tone: "blue-deep" },
  { label: "项目变更", count: 3, tone: "blue" },
  { label: "项目结束", count: 18, tone: "sky" },
];

/** 工单状态分布（后台管理·工单状态监测） */
export const ticketStatusSegments: { label: string; value: number; tone: string }[] = [
  { label: "处理中", value: 24, tone: "blue-1" },
  { label: "已关闭", value: 8, tone: "blue-2" },
  { label: "已解决", value: 2, tone: "blue-3" },
  { label: "已取消", value: 1, tone: "blue-4" },
  { label: "新建", value: 0, tone: "blue-5" },
];

/** 跨项目看板：按月项目数 */
export const projectMonthly: { key: string; year: number; month: number; value: number }[] = [
  ["2025-09", 6], ["2025-10", 9], ["2025-11", 4], ["2025-12", 11],
  ["2026-01", 7], ["2026-02", 5], ["2026-03", 10], ["2026-04", 8],
  ["2026-05", 12], ["2026-06", 9], ["2026-07", 13], ["2026-08", 12],
  ["2026-09", 6], ["2026-10", 4], ["2026-11", 3], ["2026-12", 2],
].map(([k, v]) => ({
  key: k as string,
  year: Number((k as string).slice(0, 4)),
  month: Number((k as string).slice(5)),
  value: v as number,
}));

export const projectYears = [2024, 2025, 2026];
