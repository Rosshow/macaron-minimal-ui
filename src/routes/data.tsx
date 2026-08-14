import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/Shell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { projectAuthProject } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "数据管理 · 摇人吧" },
      {
        name: "description",
        content: "选择项目后导入数据包文件（.bz2 / .json），或直接粘贴 JSON 数据完成校验导入。",
      },
      { property: "og:title", content: "数据管理 · 摇人吧" },
      {
        property: "og:description",
        content: "选择项目后导入数据包文件（.bz2 / .json），或直接粘贴 JSON 数据完成校验导入。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataManage,
});

type ProjectOption = { name: string; code: string };

const projectOptions: ProjectOption[] = [
  projectAuthProject,
  { name: "安徽芜湖奇瑞智造二期项目", code: "27" },
  { name: "广东佛山美的智慧工厂项目", code: "35" },
  { name: "上海临港特斯拉物流项目", code: "42" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DataManage() {
  const [project, setProject] = useState<ProjectOption | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tab, setTab] = useState<"file" | "json">("file");
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [json, setJson] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const disabled = !project;

  return (
    <PageShell title="数据管理" back>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="surface-card flex w-full items-center gap-2 px-4 py-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          {project ? (
            <span className="flex items-baseline gap-2">
              <span className="truncate text-[14px] font-semibold text-foreground">
                {project.name}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                #{project.code}
              </span>
            </span>
          ) : (
            <span className="text-[14px] text-muted-foreground">请选择项目</span>
          )}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <section className="surface-card mt-3 overflow-hidden">
        <div className="grid grid-cols-2 border-b border-border/60">
          {([
            { key: "file", label: "文件导入" },
            { key: "json", label: "JSON导入" },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="relative py-3 text-[13.5px] font-medium transition-colors"
            >
              <span className={cn(tab === t.key ? "text-blue-2" : "text-muted-foreground")}>
                {t.label}
              </span>
              {tab === t.key && (
                <span className="absolute bottom-0 left-1/2 h-[2.5px] w-6 -translate-x-1/2 rounded-full bg-blue-2" />
              )}
            </button>
          ))}
        </div>

        {tab === "file" ? (
          <div className="px-4 py-5">
            <input
              ref={inputRef}
              type="file"
              accept=".bz2,.json"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []).map((f) => ({
                  name: f.name,
                  size: f.size,
                }));
                if (picked.length) setFiles((prev) => [...prev, ...picked]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              aria-label="选择数据包文件"
              className={cn(
                "grid size-20 place-items-center rounded-xl border border-dashed border-border bg-secondary/60 text-muted-foreground transition-colors",
                disabled ? "cursor-not-allowed opacity-50" : "hover:bg-secondary",
              )}
            >
              <Plus className="size-6" />
            </button>

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground/85">
                      {f.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {formatSize(f.size)}
                    </span>
                    <button
                      type="button"
                      aria-label={`移除 ${f.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-5 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              上传 数据包文件（.bz2 或 .json，含 GroupEfficiency 等指标数据），选定项目后上传
            </p>

            {files.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  toast.success(`已提交 ${files.length} 个文件至「${project?.name}」`);
                  setFiles([]);
                }}
                className="mt-4 w-full rounded-md bg-blue-2 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                开始导入
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 py-5">
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              disabled={disabled}
              placeholder='粘贴 JSON 数据，例如 {"GroupEfficiency": []}'
              className="h-40 w-full resize-none rounded-md border border-border bg-card px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-blue-2/60 disabled:opacity-50"
            />
            <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
              粘贴含 GroupEfficiency 等指标数据的 JSON，选定项目后导入
            </p>
            <button
              type="button"
              disabled={disabled || !json.trim()}
              onClick={() => {
                try {
                  JSON.parse(json);
                } catch {
                  toast.error("JSON 格式有误，请检查后重试");
                  return;
                }
                toast.success(`已导入 JSON 数据至「${project?.name}」`);
                setJson("");
              }}
              className="mt-4 w-full rounded-md bg-blue-2 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              校验并导入
            </button>
          </div>
        )}
      </section>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-4 pb-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-[15px]">选择项目</SheetTitle>
          </SheetHeader>
          <ul className="mt-1 space-y-1.5">
            {projectOptions.map((p) => {
              const active = project?.code === p.code;
              return (
                <li key={p.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setProject(p);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-colors",
                      active ? "border-blue-2/50 bg-blue-soft" : "border-border bg-card",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {p.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      #{p.code}
                    </span>
                    {active && <Check className="size-4 shrink-0 text-blue-2" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
