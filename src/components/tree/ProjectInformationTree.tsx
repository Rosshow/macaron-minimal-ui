import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  GripVertical,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import {
  createProjectNode,
  deleteProjectNode,
  getProjectNodes,
  updateProjectNode,
  type ProjectNode,
} from "@/lib/project-tree.functions";
import { cn } from "@/lib/utils";

type ContentType = "text" | "select" | "file" | "image";
type FileValue = { path: string; name: string; size: number };
type SelectValue = { selected: string; options: string[] };
type ProjectOverview = {
  wecomId: string;
  manager: string;
  contact: string;
  progress: number;
  deployAt: string;
  nearDelivery: string;
  finalDelivery: string;
  tags: string[];
  urgent: string;
};

const DEFAULT_TAGS = [
  "车辆", "车端软件", "调度软件", "服务器信息", "环境", "业务系统",
  "业务流程", "人员", "特性", "项目配置", "项目定制", "基础信息",
];

function readStoredSet(key: string) {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function nodeValue<T>(value: unknown, fallback: T): T {
  return value && typeof value === "object" ? (value as T) : fallback;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function ProjectInformationTree({
  projectCode,
  projectName,
  overview,
}: {
  projectCode: string;
  projectName: string;
  overview: ProjectOverview;
}) {
  const queryClient = useQueryClient();
  const getNodes = useServerFn(getProjectNodes);
  const createNode = useServerFn(createProjectNode);
  const updateNode = useServerFn(updateProjectNode);
  const removeNode = useServerFn(deleteProjectNode);
  const selectionKey = `project-tree:selected:${projectCode}`;
  const collapsedKey = `project-tree:collapsed:${projectCode}`;
  const [selected, setSelected] = useState(() => readStoredSet(selectionKey));
  const [collapsed, setCollapsed] = useState(() => readStoredSet(collapsedKey));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; mode: "child" | "before" } | null>(null);
  const [summary, setSummary] = useState({ name: projectName, ...overview });
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryKey = ["project-nodes", projectCode];
  const { data: nodes = [], isPending } = useQuery({
    queryKey,
    queryFn: () => getNodes({ data: { projectCode } }),
  });

  useEffect(() => localStorage.setItem(selectionKey, JSON.stringify([...selected])), [selected, selectionKey]);
  useEffect(() => localStorage.setItem(collapsedKey, JSON.stringify([...collapsed])), [collapsed, collapsedKey]);

  const byParent = useMemo(() => {
    const map = new Map<string | null, ProjectNode[]>();
    nodes.forEach((node) => {
      const siblings = map.get(node.parent_id) ?? [];
      siblings.push(node);
      map.set(node.parent_id, siblings);
    });
    map.forEach((items) => items.sort((a, b) => a.sort_order - b.sort_order));
    return map;
  }, [nodes]);
  const roots = byParent.get(null) ?? [];
  const visibleRoots = selected.size === 0 ? roots : roots.filter((node) => selected.has(node.id));

  const mutation = useMutation({
    mutationFn: async (work: () => Promise<unknown>) => work(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "保存失败"),
  });

  function descendants(id: string) {
    const result = new Set<string>();
    const walk = (parentId: string) => (byParent.get(parentId) ?? []).forEach((child) => {
      result.add(child.id);
      walk(child.id);
    });
    walk(id);
    return result;
  }

  function depthOf(node: ProjectNode) {
    let depth = 1;
    let parent = nodes.find((item) => item.id === node.parent_id);
    while (parent && depth < 5) {
      depth += 1;
      parent = nodes.find((item) => item.id === parent?.parent_id);
    }
    return depth;
  }

  function addNode(parent: ProjectNode | null) {
    if (parent && depthOf(parent) >= 4) {
      toast.info("信息维度过深，建议拆分或合并");
      return;
    }
    const siblings = byParent.get(parent?.id ?? null) ?? [];
    mutation.mutate(async () => {
      const node = await createNode({
        data: { projectCode, parentId: parent?.id ?? null, title: "未命名节点", sortOrder: siblings.length },
      });
      setEditingId(node.id);
      if (parent) setCollapsed((current) => { const next = new Set(current); next.delete(parent.id); return next; });
    });
  }

  function saveNode(id: string, updates: { title?: string; contentType?: ContentType; value?: unknown; parentId?: string | null; sortOrder?: number }) {
    mutation.mutate(() => updateNode({ data: { id, ...updates } }));
  }

  function moveNode(target: ProjectNode, mode: "child" | "before") {
    if (!draggingId || draggingId === target.id || descendants(draggingId).has(target.id)) return;
    const dragged = nodes.find((node) => node.id === draggingId);
    if (!dragged) return;
    const parentId = mode === "child" ? target.id : target.parent_id;
    const targetDepth = mode === "child" ? depthOf(target) + 1 : depthOf(target);
    const subtreeDepth = Math.max(0, ...[...descendants(dragged.id)].map((id) => {
      const item = nodes.find((node) => node.id === id);
      return item ? depthOf(item) - depthOf(dragged) : 0;
    }));
    if (targetDepth + subtreeDepth > 4) {
      toast.info("信息维度过深，建议拆分或合并");
      return;
    }
    const targetSiblings = byParent.get(parentId) ?? [];
    const sortOrder = mode === "child" ? targetSiblings.length : target.sort_order;
    saveNode(dragged.id, { parentId, sortOrder });
  }

  const toggleSelection = (id: string) => setSelected((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  function editSummary(key: "name" | "manager" | "contact", label: string) {
    const value = window.prompt(`修改${label}`, summary[key]);
    if (value?.trim()) setSummary((current) => ({ ...current, [key]: value.trim() }));
  }

  if (isPending) return <div className="py-16 text-center text-sm text-muted-foreground">正在加载项目信息…</div>;

  return (
    <div className="space-y-3">
      <section className="surface-card overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] text-muted-foreground">项目名称</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <h1 className="min-w-0 text-[17px] font-bold leading-6">{summary.name}</h1>
              <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => editSummary("name", "项目名称")} aria-label="修改项目名称"><Pencil className="size-3.5" /></Button>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>项目编号</span><span>{projectCode}</span><Pencil className="size-3" aria-hidden />
            </div>
            <div className="text-[10.5px] text-muted-foreground">· 企业微信记录ID: {summary.wecomId}</div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {summary.tags.map((tag) => <span key={tag} className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">{tag} ›</span>)}
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background">{summary.urgent} ›</span>
          </div>
        </div>

        <div className="mt-3 divide-y divide-border/70">
          {([['manager', '项目经理'], ['contact', '对接人']] as const).map(([key, label]) => (
            <div key={key} className="flex min-h-10 items-center justify-between gap-3 py-2">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <Button type="button" variant="ghost" size="sm" className="gap-2 px-1 text-[12.5px] text-foreground" onClick={() => editSummary(key, label)}>
                <span>{summary[key]}</span><Pencil className="size-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">项目时间进度</span>
            <span className="font-semibold text-primary">{summary.progress}%</span>
          </div>
          <progress className="project-progress mt-1.5 block h-1.5 w-full overflow-hidden rounded-full" max={100} value={Math.min(100, Math.max(0, summary.progress))} aria-label="项目时间进度" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/70 pt-3">
          {([['部署时间', summary.deployAt], ['近期交付', summary.nearDelivery], ['最终交付', summary.finalDelivery]] as const).map(([label, value]) => (
            <div key={label} className="min-w-0">
              <div className="text-[10px] text-muted-foreground">{label}</div>
              <div className="mt-0.5 truncate text-[11.5px] font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card overflow-hidden p-4">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
          <h2 className="text-[14px] font-semibold">项目详细信息</h2>
          <Button size="sm" variant="secondary" onClick={() => addNode(null)}><Plus />新标签</Button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] font-semibold">显示内容</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(roots.map((node) => node.id)))}>全选</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>清空</Button>
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {roots.sort((a, b) => {
            const ai = DEFAULT_TAGS.indexOf(a.title); const bi = DEFAULT_TAGS.indexOf(b.title);
            return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
          }).map((node) => {
            const active = selected.has(node.id);
            return (
              <Button key={node.id} size="sm" variant={active ? "default" : "outline"} className="shrink-0" onClick={() => toggleSelection(node.id)}>
                {node.title}
              </Button>
            );
          })}
        </div>
        <p className="mt-2 text-[10.5px] text-muted-foreground">不选择标签时显示全部内容</p>
        <div className="mt-4 space-y-3">
        {visibleRoots.map((root) => (
          <div key={root.id}>
            <TreeRow
              node={root} depth={1} byParent={byParent} collapsed={collapsed} editingId={editingId}
              draggingId={draggingId} dropTarget={dropTarget} onEdit={setEditingId}
              onToggle={(id) => setCollapsed((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; })}
              onAdd={addNode} onSave={saveNode}
              onDelete={(id) => mutation.mutate(() => removeNode({ data: { id } }))}
              onHoldStart={(id) => { holdTimer.current = setTimeout(() => { setDraggingId(id); navigator.vibrate?.(35); }, 400); }}
              onHoldEnd={() => { if (holdTimer.current) clearTimeout(holdTimer.current); }}
              onDragMove={(target, mode) => draggingId && setDropTarget({ id: target.id, mode })}
              onDrop={(target, mode) => { moveNode(target, mode); setDraggingId(null); setDropTarget(null); }}
            />
          </div>
        ))}
        </div>
      </section>
    </div>
  );
}

type TreeRowProps = {
  node: ProjectNode; depth: number; byParent: Map<string | null, ProjectNode[]>; collapsed: Set<string>;
  editingId: string | null; draggingId: string | null; dropTarget: { id: string; mode: "child" | "before" } | null;
  onEdit: (id: string | null) => void; onToggle: (id: string) => void; onAdd: (node: ProjectNode) => void;
  onSave: (id: string, updates: { title?: string; contentType?: ContentType; value?: unknown; parentId?: string | null; sortOrder?: number }) => void;
  onDelete: (id: string) => void; onHoldStart: (id: string) => void; onHoldEnd: () => void;
  onDragMove: (node: ProjectNode, mode: "child" | "before") => void; onDrop: (node: ProjectNode, mode: "child" | "before") => void;
};

function TreeRow(props: TreeRowProps) {
  const { node, depth, byParent, collapsed, editingId, draggingId, dropTarget } = props;
  const children = byParent.get(node.id) ?? [];
  const isLeaf = children.length === 0;
  const isCollapsed = collapsed.has(node.id);
  const activeDrop = dropTarget?.id === node.id;
  const depthBorder = ["", "border-tree-depth-1", "border-tree-depth-2", "border-tree-depth-3", "border-tree-depth-4"][depth] ?? "border-tree-depth-4";
  const depthText = ["", "text-primary-foreground", "text-tree-depth-2", "text-tree-depth-3", "text-tree-depth-4"][depth] ?? "text-tree-depth-4";
  const depthSurface = depth === 1 ? "bg-tree-depth-1" : "bg-card";
  const depthAction = depth === 1 ? "hover:bg-card/15 hover:text-primary-foreground" : "";

  const titleOptions = nodeValue<{ titleOptions?: string[] }>(node.value, {}).titleOptions ?? [];
  const nodeLookup = (id: string) => [...byParent.values()].flat().find((item) => item.id === id);
  const pointerTarget = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-tree-node]");
    if (!element) return null;
    const target = nodeLookup(element.dataset["treeNode"] ?? "");
    if (!target) return null;
    const rect = element.getBoundingClientRect();
    return { target, mode: clientY < rect.top + rect.height * 0.27 ? "before" as const : "child" as const };
  };

  return (
    <div className={cn(depth > 1 && "ml-4 border-l border-blue-4/50 pl-2")}>
      <div
        data-tree-node={node.id}
        className={cn(
          "relative mb-1.5 touch-pan-y rounded-lg border-2 px-2 py-2 shadow-sm transition-all",
          depthBorder, depthSurface,
          draggingId === node.id && "scale-[1.015] opacity-70 shadow-lg",
          activeDrop && dropTarget.mode === "child" && "ring-2 ring-blue-2",
          activeDrop && dropTarget.mode === "before" && "before:absolute before:inset-x-1 before:-top-1 before:h-0.5 before:bg-blue-2",
        )}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); props.onHoldStart(node.id); }}
        onPointerMove={(event) => {
          if (!draggingId) return;
          const hit = pointerTarget(event.clientX, event.clientY);
          if (hit) props.onDragMove(hit.target, hit.mode);
        }}
        onPointerUp={(event) => {
          props.onHoldEnd();
          if (!draggingId) return;
          const hit = pointerTarget(event.clientX, event.clientY);
          if (hit) props.onDrop(hit.target, hit.mode);
        }}
        onPointerCancel={props.onHoldEnd}
      >
        <div className="flex min-h-9 items-center gap-1.5">
          <GripVertical className={cn("size-3.5 shrink-0", depth === 1 ? "text-primary-foreground/60" : "text-muted-foreground/50")} aria-hidden />
          <Button variant="ghost" size="icon" className={cn("size-8 shrink-0", depthText, depthAction)} disabled={isLeaf} onPointerDown={(event) => event.stopPropagation()} onClick={() => props.onToggle(node.id)} aria-label={isCollapsed ? "展开" : "收起"}>
            {children.length ? (isCollapsed ? <ChevronRight /> : <ChevronDown />) : <span className="size-4" />}
          </Button>
          {editingId === node.id ? (
            <input autoFocus defaultValue={node.title} className="min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-[13px] text-foreground outline-none ring-1 ring-blue-2" onPointerDown={(event) => event.stopPropagation()} onBlur={(event) => { const title = event.target.value.trim(); if (title && title !== node.title) props.onSave(node.id, { title }); props.onEdit(null); }} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
          ) : !isLeaf && titleOptions.length ? (
            <select
              aria-label={`${node.title}标题`}
              value={titleOptions.includes(node.title) ? node.title : ""}
              onPointerDown={(event) => event.stopPropagation()}
              onChange={(event) => props.onSave(node.id, { title: event.target.value })}
              className={cn("min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-1.5 text-[12.5px] font-semibold outline-none", depthText)}
            >
              <option value="" disabled>{node.title}</option>
              {titleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : (
            <span className={cn("min-w-0 font-semibold", depthText, depth === 1 ? "text-[14px]" : "text-[12.5px]")}>{node.title}</span>
          )}
          <div className="ml-auto flex items-center gap-0.5" onPointerDown={(event) => event.stopPropagation()}>
            <Button variant="ghost" size="icon" className={cn("size-8", depthText, depthAction)} onClick={() => props.onAdd(node)} aria-label={`在${node.title}下新增`}><Plus /></Button>
            <NodeMenu node={node} isLeaf={isLeaf} titleOptions={titleOptions} depthText={cn(depthText, depthAction)} onEdit={() => props.onEdit(node.id)} onSave={props.onSave} onDelete={props.onDelete} />
          </div>
        </div>
        {isLeaf ? <NodeContent node={node} onSave={props.onSave} /> : null}
      </div>
      {!isCollapsed && children.map((child) => <TreeRow key={child.id} {...props} node={child} depth={depth + 1} />)}
    </div>
  );
}

function NodeMenu({ node, isLeaf, titleOptions, depthText, onEdit, onSave, onDelete }: { node: ProjectNode; isLeaf: boolean; titleOptions: string[]; depthText: string; onEdit: () => void; onSave: TreeRowProps["onSave"]; onDelete: (id: string) => void }) {
  const typeNames: Record<ContentType, string> = { text: "文字输入", select: "下拉选择", file: "上传文件", image: "上传图片" };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className={cn("size-8", depthText)} aria-label="更多操作"><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>修改名称</DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLeaf ? (
          (Object.keys(typeNames) as ContentType[]).map((type) => (
            <DropdownMenuItem key={type} onSelect={() => onSave(node.id, { contentType: type, value: type === "select" ? { selected: "", options: [] } : type === "text" ? "" : {} })}>
              {typeNames[type]}{node.content_type === type ? " · 当前" : ""}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem
            onSelect={() => {
              const input = window.prompt("标题备选项（用逗号分隔，留空则改回手动输入）", titleOptions.join("，"));
              if (input === null) return;
              const options = input.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
              onSave(node.id, { value: options.length ? { titleOptions: options } : {} });
            }}
          >
            标题改为下拉选择
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onSelect={() => { if (window.confirm(`删除“${node.title}”及其所有子节点？`)) onDelete(node.id); }}><Trash2 />删除节点</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NodeContent({ node, onSave }: { node: ProjectNode; onSave: TreeRowProps["onSave"] }) {
  if (node.content_type === "select") {
    const data = nodeValue<SelectValue>(node.value, { selected: "", options: [] });
    return (
      <div className="mt-2 flex gap-1.5 pl-10" onPointerDown={(event) => event.stopPropagation()}>
        <select value={data.selected} onChange={(event) => onSave(node.id, { value: { ...data, selected: event.target.value } })} className="min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-2 text-[12px] text-foreground outline-none">
          <option value="">请选择</option>{data.options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={() => { const option = window.prompt("输入新选项"); if (option?.trim()) onSave(node.id, { value: { selected: data.selected, options: [...data.options, option.trim()] } }); }}>管理</Button>
      </div>
    );
  }
  if (node.content_type === "file" || node.content_type === "image") return <FileContent node={node} onSave={onSave} />;
  return (
    <textarea
      aria-label={`${node.title}内容`}
      defaultValue={typeof node.value === "string" ? node.value : ""}
      placeholder="填写内容"
      rows={1}
      className="mt-2 ml-10 block w-[calc(100%-2.5rem)] resize-none rounded-md border border-border bg-card px-2.5 py-2 text-[12px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-blue-2"
      onPointerDown={(event) => event.stopPropagation()}
      onBlur={(event) => { if (event.target.value !== node.value) onSave(node.id, { value: event.target.value }); }}
    />
  );
}


function FileContent({ node, onSave }: { node: ProjectNode; onSave: TreeRowProps["onSave"] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const stored = nodeValue<Partial<FileValue>>(node.value, {});
  const file = stored.path ? (stored as FileValue) : null;

  useEffect(() => {
    if (!file?.path) { setPreview(null); return; }
    supabase.storage.from("project-files").createSignedUrl(file.path, 3600).then(({ data }) => setPreview(data?.signedUrl ?? null));
  }, [file?.path]);
  async function upload(selectedFile: File) {
    const path = `${node.project_code}/${node.id}/${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("project-files").upload(path, selectedFile);
    if (error) { toast.error("上传失败"); return; }
    onSave(node.id, { value: { path, name: selectedFile.name, size: selectedFile.size } });
  }
  return (
    <div className="mt-2 pl-10" onPointerDown={(event) => event.stopPropagation()}>
      <input ref={inputRef} type="file" className="hidden" accept={node.content_type === "image" ? "image/*" : undefined} onChange={(event) => { const selectedFile = event.target.files?.[0]; if (selectedFile) void upload(selectedFile); }} />
      {file ? (
        <div className="rounded-md bg-card/75 p-2 text-foreground">
          {node.content_type === "image" && preview ? <button type="button" className="block" onClick={() => window.open(preview, "_blank")}><img src={preview} alt={file.name} className="max-h-36 rounded-md object-cover" /></button> : null}
          <div className="mt-1 flex items-center gap-2 text-[11.5px]">
            {node.content_type === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
            <span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-muted-foreground">{formatSize(file.size)}</span>
            {preview ? <Button variant="ghost" size="icon" className="size-8" asChild><a href={preview} download={file.name} aria-label="下载"><Download /></a></Button> : null}
          </div>
        </div>
      ) : <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>{node.content_type === "image" ? <ImageIcon /> : <FileText />}选择{node.content_type === "image" ? "图片" : "文件"}</Button>}
    </div>
  );
}