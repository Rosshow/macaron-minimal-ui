export type Tone = "blue" | "blue-deep" | "blue-3" | "gray" | "muted" | "sky";

export type Ticket = {
  id: string;
  no: string;
  title: string;
  kind: "需求" | "问题" | "功能" | "支持";
  priority: "低" | "中" | "高" | "紧急";
  status: "新建" | "待处理" | "处理中" | "进行中" | "已解决" | "已关闭" | "已取消";
  project: string;
  desc: string;
  owner: string;
  reporter: string;
  participants: string[];
  date: string;
  parentId?: string | undefined;
  dependsOn?: string[] | undefined;
};

/** 项目工单卡片统计与关系（示例数据） */
export const projectTicketStats = { total: 12, pending: 3, processing: 5, closed: 4 };

export const projectBlockingTicket = {
  no: "#789",
  title: "目标点不可达但车辆仍持续运动",
  reporter: "官伟文",
  owner: "贾爽",
  summary:
    "现场调度下发目标点后，路径规划判定该点不可达，但车辆未停止而是继续按旧路径运动，存在碰撞风险，需优先排查规划与执行的衔接逻辑。",
};

export const projectRiskCounts: { level: "高" | "中" | "低"; count: number }[] = [
  { level: "高", count: 2 },
  { level: "中", count: 4 },
  { level: "低", count: 6 },
];

export const projectTickets: Ticket[] = [
  {
    id: "789",
    no: "#789",
    title: "目标点不可达但车辆仍持续运动",
    kind: "问题",
    priority: "紧急",
    status: "处理中",
    project: "重庆赛美两江新动力混场项目",
    desc: "目标点判定为不可达，车辆仍持续运动，需要现场复现并确认路径规划模块行为。",
    owner: "贾爽",
    reporter: "官伟文",
    participants: ["杨", "朱", "秦"],
    date: "2026-09-06",
  },
  {
    id: "790",
    no: "#790",
    title: "复现不可达点车辆继续运动场景",
    kind: "支持",
    priority: "高",
    status: "待处理",
    project: "重庆赛美两江新动力混场项目",
    desc: "在测试场复现不可达目标点场景，记录规划模块输出与车辆轨迹。",
    owner: "杨帆",
    reporter: "官伟文",
    participants: ["朱"],
    date: "2026-09-07",
    parentId: "789",
  },
  {
    id: "791",
    no: "#791",
    title: "规划模块输出日志采集",
    kind: "功能",
    priority: "高",
    status: "处理中",
    project: "重庆赛美两江新动力混场项目",
    desc: "在规划模块增加不可达判定日志，便于定位 #789。",
    owner: "朱一鸣",
    reporter: "贾爽",
    participants: ["秦"],
    date: "2026-09-07",
    parentId: "789",
    dependsOn: ["790"],
  },
  {
    id: "785",
    no: "#785",
    title: "调度任务优先级配置不生效",
    kind: "问题",
    priority: "高",
    status: "处理中",
    project: "浙江湖州中力安吉北区调度升级项目",
    desc: "现场任务优先级配置整体不生效，怀疑后端分配优先逻辑改动导致。",
    owner: "中力-汪海波",
    reporter: "胡健楠",
    participants: ["陈"],
    date: "2026-09-03",
  },
  {
    id: "786",
    no: "#786",
    title: "优先级配置回读校验工具",
    kind: "功能",
    priority: "中",
    status: "待处理",
    project: "浙江湖州中力安吉北区调度升级项目",
    desc: "提供配置回读校验，确认前端配置与后端实际生效值一致。",
    owner: "陈杰",
    reporter: "中力-汪海波",
    participants: [],
    date: "2026-09-04",
    parentId: "785",
  },
  {
    id: "778",
    no: "#778",
    title: "现场充电桩通讯超时",
    kind: "问题",
    priority: "中",
    status: "处理中",
    project: "江苏常州多摩川混场项目",
    desc: "充电桩偶发通讯超时，需升级固件并复测。",
    owner: "毛梦晴",
    reporter: "白永奇",
    participants: ["董"],
    date: "2026-08-29",
  },
  {
    id: "779",
    no: "#779",
    title: "充电桩固件升级回归测试",
    kind: "支持",
    priority: "中",
    status: "已关闭",
    project: "江苏常州多摩川混场项目",
    desc: "固件升级后回归测试通过，超时未复现。",
    owner: "董华来",
    reporter: "毛梦晴",
    participants: [],
    date: "2026-09-02",
    dependsOn: ["778"],
  },
  {
    id: "770",
    no: "#770",
    title: "库位地图更新流程确认",
    kind: "需求",
    priority: "低",
    status: "已关闭",
    project: "安徽合肥赛美中储混场项目",
    desc: "与客户确认库位地图更新流程与责任人。",
    owner: "罗昊",
    reporter: "张俊磊",
    participants: [],
    date: "2026-08-25",
  },
  {
    id: "771",
    no: "#771",
    title: "库位地图首期导入",
    kind: "功能",
    priority: "低",
    status: "已关闭",
    project: "安徽合肥赛美中储混场项目",
    desc: "按确认后的流程导入首期库位地图。",
    owner: "张俊磊",
    reporter: "罗昊",
    participants: [],
    date: "2026-08-28",
    dependsOn: ["770"],
  },
  {
    id: "766",
    no: "#766",
    title: "现场网络波动排查",
    kind: "支持",
    priority: "中",
    status: "已关闭",
    project: "四川峨眉山乐飞光电混场项目",
    desc: "现场无线覆盖存在盲区，已协调客户调整 AP 点位。",
    owner: "白永奇",
    reporter: "官伟文",
    participants: [],
    date: "2026-08-22",
  },
  {
    id: "765",
    no: "#765",
    title: "服务器磁盘容量告警",
    kind: "问题",
    priority: "低",
    status: "待处理",
    project: "印尼雅加达 TNS-ATI 叉车项目",
    desc: "日志分区使用超过 80%，需清理或扩容。",
    owner: "汪海波",
    reporter: "系统",
    participants: [],
    date: "2026-08-20",
  },
  {
    id: "760",
    no: "#760",
    title: "出厂测试环境版本核对",
    kind: "支持",
    priority: "低",
    status: "已关闭",
    project: "国铁集团无人正面吊车西南交大合作申报项目",
    desc: "核对出厂测试环境与目标版本一致。",
    owner: "张文星",
    reporter: "罗昊",
    participants: [],
    date: "2026-08-15",
  },
];

/** 项目动态（示例数据） */
export const projectVersionChanges = [
  { version: "v2.7.1", time: "2026-09-08 20:12", note: "修复充电不打断问题，新增任务优先级兜底逻辑" },
  { version: "v2.7.0", time: "2026-09-01 16:40", note: "调度算法升级，支持混场多车型协同" },
  { version: "v2.6.4", time: "2026-08-22 10:05", note: "修复库位地图导入偶发失败" },
];

export const projectTicketMonthly: { key: string; year: number; month: number; value: number }[] = [
  ["2026-04", 3], ["2026-05", 5], ["2026-06", 2], ["2026-07", 6], ["2026-08", 4], ["2026-09", 5],
].map(([k, v]) => ({
  key: k as string,
  year: Number((k as string).slice(0, 4)),
  month: Number((k as string).slice(5)),
  value: v as number,
}));

export const projectStageChanges = [
  { from: "已签合同", to: "出厂测试", time: "2026-08-18" },
  { from: "出厂测试", to: "即将进场", time: "2026-09-02" },
  { from: "即将进场", to: "正在实施", time: "2026-09-09" },
];

/** 信息节点编辑历史（示例数据） */
export type NodeEditRecord = { who: string; when: string; what: string };

export const nodeEditHistory: NodeEditRecord[] = [
  { who: "罗昊", when: "2026-09-09 15:42", what: "把内容从「4 台叉车」改为「6 台叉车（含 2 台备用）」" },
  { who: "张俊磊", when: "2026-09-08 10:17", what: "新增了子节点「充电区位置」" },
  { who: "毛梦晴", when: "2026-09-05 18:03", what: "把标题从「车辆配置」改为「车辆」" },
];

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
  待处理: "sky",
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

/** 项目详情（模拟数据） */
export const projectLifecycleStages = [
  "售前方案",
  "签单洽谈",
  "已签合同",
  "出厂测试",
  "即将进场",
  "延期进场",
  "正在实施",
  "实施暂停",
  "实施运行",
  "试运行中",
  "验收运营",
  "项目结束",
];

export type ProjectField = { label: string; value: string; kind?: "edit" | "select" };

export const projectDetail = {
  name: "国铁集团无人正面吊车西南交大合作申报项目",
  code: "92",
  wecomId: "rNqFS6",
  client: "国铁集团",
  manager: "未指定",
  contact: "刘青源",
  progress: 27,
  deployAt: "2026-07-15",
  nearDelivery: "2026-08-07",
  finalDelivery: "-",
  tags: ["搬运效率分析"],
  urgent: "重要紧急",
  stage: "出厂测试",
  syncedAt: "00:05:52",
  agvCount: "6 台",
  uspVersion: "USP v2.7.1",
  aiSummary:
    "项目已进入实施阶段，AGV 部署 6 台，整体进度 27%。当前核心阻滞为工单 #789（目标点不可达但车辆仍持续运动），另有 2 项高风险问题待处理。近一个月工单新增 5 个，调度软件已升级至 v2.7.1，建议优先闭环核心阻滞问题并跟踪高风险项。",

  basics: [
    { label: "项目名称", value: "国铁集团无人正面吊车西南交大合作申报项目", kind: "edit" },
    { label: "项目编号", value: "92", kind: "edit" },
    { label: "内部编号", value: "未填写", kind: "edit" },
    { label: "项目描述", value: "缺前置承接", kind: "edit" },
    { label: "项目类型", value: "受关注项目", kind: "select" },
    { label: "项目区域/地点", value: "大陆（China Mainland）", kind: "select" },
    { label: "总车数", value: "1", kind: "edit" },
    { label: "车型&车数", value: "特种行业定制无人正面吊车", kind: "edit" },
    { label: "控制器选择", value: "未设置", kind: "select" },
    { label: "系统/外设对接", value: "未设置", kind: "select" },
    { label: "服务器部署", value: "未设置", kind: "select" },
    { label: "部署版本", value: "未填写", kind: "edit" },
  ] as ProjectField[],
  duty: [
    { label: "销售", value: "未指定", kind: "edit" },
    { label: "售前", value: "未指定", kind: "edit" },
    { label: "项目经理", value: "未指定", kind: "edit" },
    { label: "实施工程师", value: "未指定", kind: "edit" },
    { label: "人员计划", value: "无", kind: "edit" },
  ] as ProjectField[],
  risk: [
    { label: "风险承接", value: "未设置", kind: "select" },
    { label: "特别关注", value: "无", kind: "edit" },
    { label: "风险和任务描述", value: "无", kind: "edit" },
    { label: "项目管理策略", value: "无", kind: "edit" },
    { label: "预期走向", value: "未设置", kind: "edit" },
  ] as ProjectField[],
};

/** 项目授权（模拟数据） */
export type ProjectLicense = {
  code: string;
  machine: string;
  from: string;
  to: string;
  applicant: string;
  maxCars: string;
};

export const projectAuthProject = { name: "江苏常州多摩川混场项目", code: "13" };

export const projectLicenses: ProjectLicense[] = [
  {
    code: "HRYrVxaTzf...",
    machine: "tLRkFp58Aq...",
    from: "2026-08-07 15:05:13",
    to: "2026-12-31",
    applicant: "汪海波",
    maxCars: "不限制",
  },
  {
    code: "QF7YY4QFQM...",
    machine: "7X4On2P5C7...",
    from: "2026-08-01 14:45:31",
    to: "2026-08-01",
    applicant: "张文星",
    maxCars: "不限制",
  },
  {
    code: "gZnfGADDrw...",
    machine: "7X4On2P5C7...",
    from: "2026-08-01 14:44:02",
    to: "2026-08-01",
    applicant: "管理员",
    maxCars: "不限制",
  },
  {
    code: "xw+kZV+iRh...",
    machine: "vGFCFxbhcQ...",
    from: "2026-07-31 16:52:20",
    to: "2026-07-31",
    applicant: "张文星",
    maxCars: "不限制",
  },
  {
    code: "EqQ0Z7HsD2...",
    machine: "bN5JRWhOGG...",
    from: "2026-07-29 13:11:10",
    to: "2026-11-28",
    applicant: "—",
    maxCars: "不限制",
  },
];

export const projectMembers: { name: string; wechat: string; role: string }[] = [
  { name: "白永奇", wechat: "wechat_oD5oY3bC57", role: "实施" },
  { name: "毛梦晴", wechat: "wechat_oD5oY3e8Lp", role: "项目经理" },
  { name: "张俊磊", wechat: "wechat_oD5oY3ehhs", role: "调度研发" },
  { name: "罗昊", wechat: "wechat_oD5oY3RNsD", role: "项目经理" },
  { name: "董华来", wechat: "wechat_oD5oY3UFID", role: "项目经理" },
  { name: "汪海波", wechat: "wechat_oD5oY3YFm7", role: "调度研发" },
];

/** 历史工单详情：讨论区（模拟数据） */
export type DiscussionMessage = {
  id: string;
  side: "me" | "other";
  author: string;
  time?: string;
  text: string;
  quote?: { author: string; text: string };
  read?: boolean;
};

export type DiscussionGroup = { time: string; messages: DiscussionMessage[] };

export const ticketDiscussion: DiscussionGroup[] = [
  {
    time: "8月13日 20:48",
    messages: [
      { id: "m1", side: "me", author: "罗昊", text: "向外转发的时候可以转成图片", read: true },
      {
        id: "m2",
        side: "me",
        author: "罗昊",
        text: "那你转给爽，直接从数据库取，然后转成 md 格式文件在前端显示 @胡健楠",
        read: true,
      },
    ],
  },
  {
    time: "8月13日 20:54",
    messages: [
      {
        id: "m3",
        side: "other",
        author: "胡健楠",
        time: "20:48:23",
        text: "@罗昊 这是何意，向外转发的时候又要成图片，又要前端显示 md",
      },
      { id: "m4", side: "other", author: "胡健楠", text: "我这边工单附带还没做好，做不做了那" },
      {
        id: "m5",
        side: "me",
        author: "罗昊",
        quote: {
          author: "胡健楠",
          text: "@罗昊 这是何意，向外转发的时候又要成图片，又要前端显示 md",
        },
        text: "向外转发成图片就好，作为附件的时候转成 md 格式文档给对接单人",
        read: true,
      },
      { id: "m6", side: "me", author: "罗昊", text: "@胡健楠", read: true },
    ],
  },
  {
    time: "8月13日 21:03",
    messages: [
      {
        id: "m7",
        side: "other",
        author: "胡健楠",
        time: "21:03:49",
        text: "那现在是缺少向外转发的功能的吧",
      },
      {
        id: "m8",
        side: "other",
        author: "胡健楠",
        text: "@罗昊 附件这个我可以弄，向外转发这块要涉及前端选中之类的",
      },
      { id: "m9", side: "other", author: "胡健楠", text: "明天当面说" },
      { id: "m10", side: "me", author: "罗昊", text: "好", read: false },
    ],
  },
];

export const ticketSummary =
  "聊天记录已存入数据库，工单附件由胡健楠将数据库记录转成 MD 格式文档给对接人，向外转发则转成图片。新增讨论确认：向外转发功能尚缺，涉及前端选中逻辑，胡健楠负责附件部分，转发功能待与罗昊明天当面沟通解决。";
