import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { analyzeImportText, type ImportedItem } from "@/lib/node-import.functions";
import { createProjectNode, updateProjectNode, type ProjectNode } from "@/lib/project-tree.functions";

type Row = ImportedItem & {
  key: string;
  group: "fill" | "overwrite" | "new";
  node?: ProjectNode;
  current?: string;
  nextValue: unknown;
};

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value;
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return book.SheetNames.map(
      (sheet) => `# ${sheet}\n${XLSX.utils.sheet_to_csv(book.Sheets[sheet]!)}`,
    ).join("\n\n");
  }
  return file.text();
}

function currentText(node: ProjectNode) {
  if (node.content_type === "select") {
    const value = (node.value ?? {}) as { selected?: string };
    return typeof value.selected === "string" ? value.selected : "";
  }
  return typeof node.value === "string" ? node.value : "";
}

function pathOf(node: ProjectNode, all: ProjectNode[]) {
  const parts = [node.title];
  let parent = all.find((item) => item.id === node.parent_id);
  let guard = 0;
  while (parent && guard < 6) {
    parts.unshift(parent.title);
    parent = all.find((item) => item.id === parent?.parent_id);
    guard += 1;
  }
  return parts.join(" / ");
}

/** 通过文件（Word / Excel / Markdown）+ AI 识别，一键填写节点内容。 */
export function NodeImportDialog({
  open,
  onOpenChange,
  projectCode,
  nodes,
  onApplied,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectCode: string;
  nodes: ProjectNode[];
  onApplied: () => void;
}) {
  const analyze = useServerFn(analyzeImportText);
  const createNode = useServerFn(createProjectNode);
  const updateNode = useServerFn(updateProjectNode);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const leaves = useMemo(() => {
    const parents = new Set(nodes.map((node) => node.parent_id));
    return nodes.filter((node) => !parents.has(node.id));
  }, [nodes]);

  const reset = () => {
    setRows([]);
    setChecked(new Set());
    setFileName("");
  };

  async function handleFile(file: File) {
    setLoading(true);
    reset();
    setFileName(file.name);
    try {
      const text = (await extractText(file)).trim();
      if (!text) throw new Error("没有从文件里读到文字内容");
      const items = await analyze({
        data: {
          text,
          nodes: leaves.map((node) => ({
            id: node.id,
            path: pathOf(node, nodes),
            contentType: node.content_type,
            options: ((node.value ?? {}) as { options?: string[] }).options ?? [],
          })),
        },
      });

      const next: Row[] = items.map((item, index) => {
        const node = item.matchedNodeId ? leaves.find((leaf) => leaf.id === item.matchedNodeId) : undefined;
        if (!node || (node.content_type !== "text" && node.content_type !== "select")) {
          return { ...item, key: `n-${index}`, group: "new", nextValue: item.value };
        }
        if (node.content_type === "select") {
          const options = ((node.value ?? {}) as { options?: string[] }).options ?? [];
          if (!options.includes(item.value)) {
            return { ...item, key: `n-${index}`, group: "new", nextValue: item.value };
          }
          const current = currentText(node);
          return {
            ...item,
            key: `m-${index}`,
            node,
            current,
            nextValue: { selected: item.value, options },
            group: current ? "overwrite" : "fill",
          };
        }
        const current = currentText(node);
        return {
          ...item,
          key: `m-${index}`,
          node,
          current,
          nextValue: item.value,
          group: current ? "overwrite" : "fill",
        };
      });

      if (next.length === 0) toast.info("没有识别到可导入的信息");
      setRows(next);
      setChecked(new Set(next.filter((row) => row.group === "fill").map((row) => row.key)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "文件识别失败");
      reset();
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    const picked = rows.filter((row) => checked.has(row.key));
    if (picked.length === 0) {
      toast.info("请先勾选要导入的信息");
      return;
    }
    setSaving(true);
    let filled = 0;
    let overwritten = 0;
    let created = 0;
    try {
      const roots = nodes.filter((node) => node.parent_id === null);
      let fallbackParentId: string | null = null;

      for (const row of picked) {
        if (row.node) {
          await updateNode({ data: { id: row.node.id, value: row.nextValue } });
          if (row.group === "overwrite") overwritten += 1;
          else filled += 1;
          continue;
        }
        const wanted = (row.suggestedParentPath ?? "").split("/").map((part) => part.trim()).filter(Boolean);
        const parent = wanted.length
          ? nodes.find((node) => node.title === wanted[wanted.length - 1]) ?? roots.find((node) => wanted.includes(node.title))
          : undefined;
        let parentId = parent?.id ?? fallbackParentId;
        if (!parentId) {
          const existing = roots.find((node) => node.title === "导入信息");
          if (existing) parentId = existing.id;
          else {
            const holder = await createNode({
              data: { projectCode, parentId: null, title: "导入信息", sortOrder: roots.length },
            });
            parentId = holder.id;
          }
          fallbackParentId = parentId;
        }
        const created_ = await createNode({
          data: { projectCode, parentId, title: row.title.slice(0, 80), sortOrder: 999 },
        });
        await updateNode({ data: { id: created_.id, contentType: "text", value: row.value } });
        created += 1;
      }
      toast.success(`已填写 ${filled} 项，新增 ${created} 项，覆盖 ${overwritten} 项`);
      onApplied();
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "导入保存失败");
    } finally {
      setSaving(false);
    }
  }

  const groups: { key: Row["group"]; label: string; hint: string }[] = [
    { key: "fill", label: "将填写", hint: "节点当前为空，勾选后直接填入" },
    { key: "overwrite", label: "将覆盖", hint: "节点已有内容，勾选后才会覆盖" },
    { key: "new", label: "未匹配到节点", hint: "勾选后作为新节点创建" },
  ];

  const toggle = (key: string) =>
    setChecked((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) reset();
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-[15px]">文件导入</DialogTitle>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept=".docx,.md,.txt,.csv,.xlsx,.xls"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
        />

        <div className="space-y-3">
          <p className="text-[11.5px] text-muted-foreground">
            支持 Word（.docx）、Markdown/文本（.md/.txt）、Excel（.xlsx/.csv），由 AI 识别后先预览再确认。
          </p>
          <Button variant="secondary" className="w-full gap-1.5" disabled={loading} onClick={() => fileRef.current?.click()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {loading ? "正在识别…" : fileName || "选择文件"}
          </Button>

          {rows.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => {
                const items = rows.filter((row) => row.group === group.key);
                if (items.length === 0) return null;
                return (
                  <div key={group.key} className="space-y-1.5">
                    <div>
                      <span className="text-[12px] font-semibold">
                        {group.label}（{items.length}）
                      </span>
                      <p className="text-[10.5px] text-muted-foreground">{group.hint}</p>
                    </div>
                    {items.map((row) => (
                      <label
                        key={row.key}
                        className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5 text-[12px]"
                      >
                        <Checkbox
                          className="mt-0.5"
                          checked={checked.has(row.key)}
                          onCheckedChange={() => toggle(row.key)}
                        />
                        <span className="min-w-0 flex-1 space-y-0.5">
                          <span className="block font-semibold text-blue-2">
                            {row.node ? pathOf(row.node, nodes) : row.title}
                          </span>
                          {row.group === "overwrite" ? (
                            <span className="block text-[11.5px] leading-5 text-muted-foreground">
                              原内容：{row.current} → <span className="text-foreground">{row.value}</span>
                            </span>
                          ) : (
                            <span className="block text-[11.5px] leading-5">{row.value}</span>
                          )}
                          {row.group === "new" && row.suggestedParentPath ? (
                            <span className="block text-[10.5px] text-muted-foreground">
                              建议归属：{row.suggestedParentPath}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                );
              })}

              <div className="flex gap-2 border-t border-border/70 pt-3">
                <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button className="flex-1" disabled={saving} onClick={() => void apply()}>
                  {saving ? "正在保存…" : `确认导入（${checked.size}）`}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
