import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/Tag";
import { toast } from "sonner";
import { projects } from "@/data/mock";
import { getProjectNodes } from "@/lib/project-tree.functions";
import { buildAutoSection, DEFAULT_MANUAL_SECTION, mergeDoc } from "@/lib/shared-doc";
import { SharedDocDialog } from "./SharedDocDialog";
import { cn } from "@/lib/utils";

const KINDS = ["缺陷", "需求", "咨询", "事故"];
const PRIORITIES = ["高", "中", "低"];
const STAGES = ["问题确认", "方案设计", "开发实现", "测试验证", "上线交付"];
const DEADLINES = [1, 3, 5, 7, 14];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3 text-[13px] outline-none transition focus:border-primary";

export function TicketCreateSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const getNodes = useServerFn(getProjectNodes);
  const [kind, setKind] = useState(KINDS[0]!);
  const [title, setTitle] = useState("预处理警告是否可忽略咨询");
  const [description, setDescription] = useState(
    "预处理告警分两类：致命告警必须处理，否则预处理直接失败；非致命的要看具体内容。处理建议：优先处理点位少的孤立点集与明显断开区域，检查线路可通行车型配置、关键点车辆可旋转属性，修复后重新执行发布生效。",
  );
  const [priority, setPriority] = useState("高");
  const [stage, setStage] = useState(STAGES[0]!);
  const [deadlineDays, setDeadlineDays] = useState(3);
  const [projectCode, setProjectCode] = useState("");
  const [outsideProject, setOutsideProject] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [doc, setDoc] = useState(DEFAULT_MANUAL_SECTION);
  const [docOpen, setDocOpen] = useState(false);

  const projectName = projects.find((item) => item.code === projectCode)?.name ?? "";

  const { data: nodes = [], isPending } = useQuery({
    queryKey: ["project-nodes", projectCode],
    queryFn: () => getNodes({ data: { projectCode } }),
    enabled: Boolean(projectCode),
  });

  const roots = useMemo(() => nodes.filter((node) => node.parent_id === null), [nodes]);

  useEffect(() => setSelectedTags([]), [projectCode]);

  // 勾选变化时只重算自动段，保留用户补充内容
  useEffect(() => {
    setDoc((current) =>
      mergeDoc(buildAutoSection(nodes, selectedTags, projectName || "未选择项目"), current),
    );
  }, [nodes, selectedTags, projectName]);

  const toggleTag = (id: string) =>
    setSelectedTags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const deadlineText = useMemo(() => {
    const date = new Date(Date.now() + deadlineDays * 86400000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, [deadlineDays]);

  const submit = () => {
    if (!projectCode && !outsideProject) {
      toast.error("请先选择绑定项目");
      return;
    }
    toast.success("工单已提交");
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-2xl p-4">
          <SheetHeader className="space-y-2 p-0 text-left">
            <SheetTitle className="text-[16px]">确认工单信息</SheetTitle>
            <div><Tag tone="blue-muted">{priority}</Tag></div>
          </SheetHeader>

          <div className="mt-3 space-y-3.5">
            <Field label="工单类型">
              <select className={selectClass} value={kind} onChange={(e) => setKind(e.target.value)}>
                {KINDS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="标题">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            <Field label="描述">
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="text-[12.5px] leading-6" />
            </Field>

            <Field label="优先级">
              <select className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="处理阶段">
              <select className={selectClass} value={stage} onChange={(e) => setStage(e.target.value)}>
                {STAGES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>

            <Field label="当前阶段截止时间">
              <div className="flex flex-wrap gap-1.5">
                {DEADLINES.map((day) => (
                  <Button
                    key={day}
                    size="sm"
                    variant={deadlineDays === day ? "default" : "outline"}
                    onClick={() => setDeadlineDays(day)}
                  >
                    {day}天
                  </Button>
                ))}
              </div>
              <Input readOnly value={deadlineText} className="mt-1.5 text-muted-foreground" />
            </Field>

            <Field label="绑定项目 *">
              <select
                className={cn(selectClass, !projectCode && "text-muted-foreground")}
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
              >
                <option value="">请选择绑定项目</option>
                {projects.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
              <p className="text-[10.5px] text-muted-foreground">项目为必选项，未绑定项目无法提交</p>
            </Field>

            <label className="flex items-center gap-2 text-[12px]">
              <Checkbox checked={outsideProject} onCheckedChange={(v) => setOutsideProject(v === true)} />
              我的项目不在所属项目集中，向项目负责人发送申请工单
            </label>

            {/* 问题共享文档设置 */}
            <div className="space-y-2 rounded-xl border border-border bg-card p-3">
              <span className="text-[12px] font-semibold">问题共享文档设置</span>
              <p className="text-[11px] text-muted-foreground">
                勾选要带入文档的项目背景信息（来自所绑定项目的信息标签）。
              </p>
              {!projectCode ? (
                <p className="text-[11.5px] text-muted-foreground">请先在上方选择绑定项目</p>
              ) : isPending ? (
                <p className="text-[11.5px] text-muted-foreground">正在加载项目信息…</p>
              ) : roots.length === 0 ? (
                <p className="text-[11.5px] text-muted-foreground">该项目暂无信息标签</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {roots.map((node) => (
                    <Button
                      key={node.id}
                      size="sm"
                      variant={selectedTags.includes(node.id) ? "default" : "outline"}
                      onClick={() => toggleTag(node.id)}
                    >
                      {node.title}
                    </Button>
                  ))}
                </div>
              )}

              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 border-t border-border/70 pt-2">
                  {selectedTags.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full bg-blue-soft px-2 py-0.5 text-[11px] text-blue-2">
                      {roots.find((node) => node.id === id)?.title ?? "标签"}
                      <button type="button" aria-label="移除" onClick={() => toggleTag(id)}>
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <Button variant="secondary" className="w-full gap-1.5" onClick={() => setDocOpen(true)}>
                <FileText className="size-4" />
                打开共享文档（已引入 {selectedTags.length} 项背景信息）
              </Button>
            </div>
          </div>

          <div className="mt-4 flex gap-2 border-t border-border/70 pt-3">
            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
            <Button className="flex-1" onClick={submit}>确认提交</Button>
          </div>
        </SheetContent>
      </Sheet>

      <SharedDocDialog open={docOpen} onOpenChange={setDocOpen} value={doc} onChange={setDoc} />
    </>
  );
}
