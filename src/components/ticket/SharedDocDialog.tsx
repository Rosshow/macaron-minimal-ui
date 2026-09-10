import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** 简易 Markdown 预览：标题、列表、引用、段落。 */
function MarkdownPreview({ source }: { source: string }) {
  const lines = source.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((raw, index) => {
        const line = raw.trimEnd();
        if (!line.trim() || line.startsWith("<!--")) return null;
        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
          const level = heading[1]!.length;
          const size = ["text-[17px]", "text-[15px]", "text-[14px]", "text-[13px]", "text-[12.5px]", "text-[12px]"][level - 1];
          return (
            <p key={index} className={cn("font-bold text-blue-2", size, level > 1 && "mt-2")}>
              {heading[2]}
            </p>
          );
        }
        if (line.startsWith(">")) {
          return (
            <p key={index} className="border-l-2 border-blue-4/60 pl-2 text-[12px] text-muted-foreground">
              {line.replace(/^>\s?/, "")}
            </p>
          );
        }
        if (/^[-*]\s+/.test(line)) {
          return (
            <p key={index} className="pl-4 text-[12.5px] leading-6">
              · {line.replace(/^[-*]\s+/, "")}
            </p>
          );
        }
        return (
          <p key={index} className="text-[12.5px] leading-6 text-foreground/90">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function SharedDocDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (next: string) => void;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-3xl flex-col gap-3 p-4 sm:h-[85vh]">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-[15px]">问题共享文档</DialogTitle>
          <p className="text-[11.5px] text-muted-foreground">
            Markdown 原格式。项目背景信息随勾选自动更新，分隔线以下的补充内容不会被覆盖。
          </p>
        </DialogHeader>

        <div className="flex items-center gap-1">
          <Button size="sm" variant={mode === "edit" ? "default" : "outline"} onClick={() => setMode("edit")}>
            编辑
          </Button>
          <Button size="sm" variant={mode === "preview" ? "default" : "outline"} onClick={() => setMode("preview")}>
            预览
          </Button>
        </div>

        {mode === "edit" ? (
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none font-mono text-[12px] leading-6"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-card p-3">
            <MarkdownPreview source={value} />
          </div>
        )}

        <Button className="w-full" onClick={() => onOpenChange(false)}>
          完成
        </Button>
      </DialogContent>
    </Dialog>
  );
}
