import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, ChevronUp, Download, FileText, Image as ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getProjectNodes, type ProjectNode } from "@/lib/project-tree.functions";
import { cn } from "@/lib/utils";

function readStoredBool(key: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

type FileValue = { path: string; name: string; size: number };

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

/** 「项目详细信息」卡片：Markdown 文档式浏览态。 */
export function ProjectDetailCard({ projectCode }: { projectCode: string }) {
  const getNodes = useServerFn(getProjectNodes);
  const selectionKey = `project-tree:selected:${projectCode}`;
  const collapseKey = `project-tree:collapsed:${projectCode}`;
  const [selected, setSelected] = useState(() => readStoredSet(selectionKey));
  const [collapsed, setCollapsed] = useState(() => readStoredBool(collapseKey));

  const { data: nodes = [], isPending } = useQuery({
    queryKey: ["project-nodes", projectCode],
    queryFn: () => getNodes({ data: { projectCode } }),
  });

  useEffect(() => localStorage.setItem(selectionKey, JSON.stringify([...selected])), [selected, selectionKey]);
  useEffect(() => localStorage.setItem(collapseKey, collapsed ? "1" : "0"), [collapsed, collapseKey]);

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

  const roots = [...(byParent.get(null) ?? [])].sort((a, b) => {
    const ai = DEFAULT_TAGS.indexOf(a.title);
    const bi = DEFAULT_TAGS.indexOf(b.title);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  const visibleRoots = selected.size === 0 ? roots : roots.filter((node) => selected.has(node.id));

  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <section className="surface-card overflow-hidden p-4">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2.5">
        <h2 className="text-[14px] font-semibold">项目信息管理</h2>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" className="gap-1.5" asChild>
            <Link to="/projects/$id/edit" params={{ id: projectCode }}>
              <Pencil className="size-3.5" />编辑
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="size-8 px-0" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "展开" : "折叠"}>
            {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[12px] font-semibold">显示内容</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(roots.map((node) => node.id)))}>全选</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>清空</Button>
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {roots.map((node) => (
          <Button key={node.id} size="sm" variant={selected.has(node.id) ? "default" : "outline"} onClick={() => toggle(node.id)}>
            {node.title}
          </Button>
        ))}
      </div>

      {!collapsed && (
        <>
          <p className="mt-2 text-[10.5px] text-muted-foreground">不选择标签时显示全部内容</p>
          {isPending ? (
            <div className="py-10 text-center text-sm text-muted-foreground">正在加载项目信息…</div>
          ) : visibleRoots.length === 0 ? (
            <div className="py-10 text-center text-[12px] text-muted-foreground">暂无内容，点击右上角「编辑」添加信息节点</div>
          ) : (
            <article className="mt-4">
              {visibleRoots.map((root) => <DocSection key={root.id} node={root} depth={1} byParent={byParent} />)}
            </article>
          )}
        </>
      )}
    </section>
  );
}

const headingStyle = ["", "text-[16px] font-bold", "text-[14px] font-semibold", "text-[13px] font-semibold", "text-[12.5px] font-semibold"];
const headingColor = ["", "text-tree-depth-1", "text-tree-depth-2", "text-tree-depth-3", "text-tree-depth-4"];

function DocSection({ node, depth, byParent }: { node: ProjectNode; depth: number; byParent: Map<string | null, ProjectNode[]> }) {
  const children = byParent.get(node.id) ?? [];
  const isLeaf = children.length === 0;
  const level = Math.min(depth, 4);
  return (
    <section className={cn(depth > 1 && "mt-3 ml-3 border-l-2 border-blue-4/40 pl-3", depth === 1 && "mt-5 first:mt-0")}>
      <div className={cn("flex items-baseline gap-2", headingStyle[level], headingColor[level])}>
        <span className="text-[10px] font-medium text-muted-foreground/70" aria-hidden>{"#".repeat(level)}</span>
        <h3 className="min-w-0">{node.title}</h3>
      </div>
      {isLeaf ? <DocContent node={node} /> : null}
      {children.map((child) => <DocSection key={child.id} node={child} depth={depth + 1} byParent={byParent} />)}
    </section>
  );
}

function DocContent({ node }: { node: ProjectNode }) {
  if (node.content_type === "select") {
    const data = nodeValue<{ selected?: string }>(node.value, {});
    return (
      <p className="mt-1.5 text-[12.5px] leading-6">
        <span className="rounded-md bg-blue-soft/70 px-2 py-0.5 font-medium text-blue-2">{data.selected || "未选择"}</span>
      </p>
    );
  }
  if (node.content_type === "file" || node.content_type === "image") return <DocAttachment node={node} />;
  const text = typeof node.value === "string" ? node.value.trim() : "";
  if (!text) return <p className="mt-1.5 text-[12px] italic text-muted-foreground/70">（未填写）</p>;
  return (
    <div className="mt-1.5 space-y-1">
      {text.split("\n").map((line, index) =>
        line.trim() ? (
          <p key={index} className="text-[12.5px] leading-6 text-foreground/90">{line}</p>
        ) : null,
      )}
    </div>
  );
}

function DocAttachment({ node }: { node: ProjectNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const stored = nodeValue<Partial<FileValue>>(node.value, {});
  const file = stored.path ? (stored as FileValue) : null;

  useEffect(() => {
    if (!file?.path) { setUrl(null); return; }
    supabase.storage.from("project-files").createSignedUrl(file.path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [file?.path]);

  if (!file) return <p className="mt-1.5 text-[12px] italic text-muted-foreground/70">（未上传）</p>;
  return (
    <figure className="mt-2">
      {node.content_type === "image" && url ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img src={url} alt={file.name} className="max-h-44 rounded-lg object-cover" />
        </a>
      ) : null}
      <figcaption className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
        {node.content_type === "image" ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
        <span className="min-w-0 flex-1 truncate">{file.name}</span>
        <span>{formatSize(file.size)}</span>
        {url ? (
          <Button variant="ghost" size="icon" className="size-7" asChild>
            <a href={url} download={file.name} aria-label="下载"><Download /></a>
          </Button>
        ) : null}
      </figcaption>
    </figure>
  );
}
