import { useState } from "react";
import { Menu, Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const sessions = [
  { id: "s1", title: "手动模式切换操作指南", date: "2026/08/13" },
  { id: "s2", title: "新会话", date: "2026/08/13" },
  { id: "s3", title: "潜伏车与叉车任务配置区别咨询", date: "2026/08/13" },
  { id: "s4", title: "AI诊断助手知识库覆盖范围", date: "2026/08/13" },
  { id: "s5", title: "流程实例进度查看指引", date: "2026/08/13" },
  { id: "s6", title: "批量编辑点位或线路操作指南", date: "2026/08/13" },
  { id: "s7", title: "对话界面新增新建会话按钮", date: "2026/08/13" },
  { id: "s8", title: "AI拒单工单信息缺失分析", date: "2026/08/13" },
  { id: "s9", title: "AGV工单信息不足异常提单", date: "2026/08/12" },
];

export function HistorySessions() {
  const [active, setActive] = useState("s1");

  return (
    <Sheet>
      <SheetTrigger
        aria-label="历史会话"
        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[340px] p-0">
        <SheetHeader className="border-b border-border/60 px-4 py-4">
          <SheetTitle className="text-[15px] font-semibold">历史会话</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
                active === s.id ? "bg-blue-soft" : "hover:bg-secondary",
              )}
            >
              <button
                type="button"
                onClick={() => setActive(s.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-[13px] font-medium text-foreground">{s.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.date}</p>
              </button>
              <button
                type="button"
                aria-label="重命名"
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="删除"
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-blue-soft"
          >
            <MessageSquarePlus className="size-4" />
            新建会话
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
