export type Tone = "mint" | "sky" | "rose" | "butter" | "lilac" | "apricot";

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
    date: "2026-08-08",
  },
];

export const kindTone: Record<Ticket["kind"], Tone> = {
  需求: "sky",
  问题: "rose",
  功能: "lilac",
  支持: "mint",
};

export const priorityTone: Record<Ticket["priority"], Tone> = {
  低: "mint",
  中: "sky",
  高: "apricot",
  紧急: "rose",
};

export const statusTone: Record<Ticket["status"], Tone> = {
  新建: "sky",
  处理中: "mint",
  进行中: "mint",
  已解决: "lilac",
  已关闭: "butter",
  已取消: "rose",
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
  { label: "售前方案", count: 1, tone: "lilac" },
  { label: "投标阶段", count: 0, tone: "sky" },
  { label: "签单洽谈", count: 0, tone: "mint" },
  { label: "已签合同", count: 8, tone: "sky" },
  { label: "出厂测试", count: 10, tone: "butter" },
  { label: "即将进场", count: 13, tone: "apricot" },
  { label: "延期进场", count: 4, tone: "rose" },
  { label: "正在实施", count: 21, tone: "mint" },
  { label: "实施暂停", count: 2, tone: "butter" },
  { label: "试运行中", count: 8, tone: "sky" },
  { label: "验收运营", count: 16, tone: "mint" },
  { label: "项目暂停", count: 2, tone: "apricot" },
  { label: "项目终止", count: 0, tone: "rose" },
  { label: "项目变更", count: 3, tone: "lilac" },
  { label: "项目结束", count: 18, tone: "sky" },
];
