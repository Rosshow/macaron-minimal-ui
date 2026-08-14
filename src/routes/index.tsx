import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plus,
  ArrowUp,
  CalendarDays,
  MessageSquarePlus,
  FolderClosed,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Pencil,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageShell } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { HistorySessions } from "@/components/HistorySessions";
import { FloatingTicketButton } from "@/components/FloatingTicketButton";

import { cn } from "@/lib/utils";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "摇人吧 · 智能提单助手" },
      {
        name: "description",
        content: "对话式提单助手：描述需求即可生成工单草稿，自动派单、追踪进度与讨论。",
      },
      { property: "og:title", content: "摇人吧 · 智能提单助手" },
      {
        property: "og:description",
        content: "对话式提单助手：描述需求即可生成工单草稿，自动派单、追踪进度与讨论。",
      },
    ],
  }),
  component: Chat,
});

const messages = [
  { me: true, text: "给张俊磊提单 摇人吧服务号讨论区对其他用户的评论进行引用 项目名称：摇人吧服务号" },
  {
    me: false,
    text: "好的，已收到提单请求，项目：摇人吧服务号，指定给张俊磊。请补充一下：您希望这个「评论引用」功能主要在什么场景下使用，以及期望达到什么效果？",
  },
  { me: true, text: "主要场景：针对工单进行讨论的时候，需要对已发评论内容进行引用" },
  { me: false, text: "好的，已记录使用场景。那期望达到什么效果呢？比如是方便追溯讨论、避免重复说明，还是其他？" },
  { me: true, text: "效果：方便追溯讨论" },
  { me: false, text: "已为「摇人吧服务号」生成工单草稿，请核对信息后确认提交。" },
];

function Chat() {
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<Record<number, "like" | "dislike" | null>>({});

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const handleEdit = (text: string) => {
    setInputValue(text);
  };

  const toggleFeedback = (index: number, kind: "like" | "dislike") => {
    setFeedback((prev) => ({
      ...prev,
      [index]: prev[index] === kind ? null : kind,
    }));
  };

  return (
    <PageShell
      title="摇人吧服务号评论引用提单"
      left={<HistorySessions />}
      right={

        <Link
          to="/history"
          className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="历史工单"
        >
          <CalendarDays className="size-5" />
          <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-blue-2 text-[9px] font-bold text-card">
            8
          </span>
        </Link>
      }
    >
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.me ? "flex justify-end" : "flex justify-start"}>
            <div className={m.me ? "flex max-w-[85%] flex-col items-end gap-1" : "flex max-w-[85%] flex-col items-start gap-1"}>
              <div
                className={
                  m.me
                    ? "rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[13px] leading-6 text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "surface-card rounded-2xl rounded-bl-sm px-4 py-3 text-[13px] leading-6"
                }
              >
                {m.text}
              </div>
              <div className={m.me ? "flex items-center gap-0.5 pr-1" : "flex items-center gap-0.5 pl-1"}>
                {m.me ? (
                  <>
                    <button
                      onClick={() => handleCopy(m.text)}
                      className="grid size-[22px] place-items-center rounded-full text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="复制"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(m.text)}
                      className="grid size-[22px] place-items-center rounded-full text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="编辑"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleFeedback(i, "like")}
                      className={cn(
                        "grid size-[22px] place-items-center rounded-full transition-colors hover:bg-secondary",
                        feedback[i] === "like" ? "text-blue-2" : "text-muted-foreground/70 hover:text-foreground"
                      )}
                      aria-label="点赞"
                    >
                      <ThumbsUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFeedback(i, "dislike")}
                      className={cn(
                        "grid size-[22px] place-items-center rounded-full transition-colors hover:bg-secondary",
                        feedback[i] === "dislike" ? "text-blue-2" : "text-muted-foreground/70 hover:text-foreground"
                      )}
                      aria-label="点踩"
                    >
                      <ThumbsDown className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(m.text)}
                      className="grid size-[22px] place-items-center rounded-full text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="复制"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="surface-card overflow-hidden p-4">
          <div className="flex items-center gap-2">
            <FolderClosed className="size-4 text-muted-foreground" />
            <span className="text-[13px] font-semibold text-muted-foreground">
              工单 <span>#338</span>
            </span>
            <Tag tone="blue-muted">需求</Tag>
            <Tag tone="blue-muted">中</Tag>
          </div>
          <h3 className="mt-2 text-[15px] font-bold">讨论区评论引用功能</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <FolderClosed className="size-3.5" /> 摇人吧服务号
          </p>
          <p className="mt-3 text-[12.5px] leading-6 text-muted-foreground">
            [指定处理人：张俊磊]【摇人吧服务号】讨论区需支持对其他用户的评论进行引用，主要场景为针对工单进行讨论时引用已发评论内容，期望效果是方便追溯讨论。已收集需求场景及预期效果，待开发实现。
          </p>
          <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 text-[12px] text-blue-3">
            <CheckCircle2 className="size-4" />
            已派单 · 张俊磊
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[72px] z-20">
        <div className="glass-bar mx-auto max-w-3xl border-t border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
              aria-label="更多"
            >
              <Plus className="size-4" />
            </button>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="发消息…"
              className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-[13px] outline-none transition focus:border-primary"
            />
            <button
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
              aria-label="发送"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-soft text-blue-2"
              aria-label="新建会话"
            >
              <MessageSquarePlus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <FloatingTicketButton />
    </PageShell>

  );
}
