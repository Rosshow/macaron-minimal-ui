import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";

export type ProjectNode = Database["public"]["Tables"]["project_nodes"]["Row"];
export type ProjectNodeChange = Database["public"]["Tables"]["project_node_changes"]["Row"];

const nodeType = z.enum(["text", "select", "file", "image"]);

const MAX_CHANGE_TEXT = 200;

function truncate(text: string) {
  return text.length > MAX_CHANGE_TEXT ? `${text.slice(0, MAX_CHANGE_TEXT)}…` : text;
}

/** 将节点值转成用于展示的纯文本（文件/图片取文件名）。 */
export function valueToText(value: unknown, contentType: string): string {
  if (value === null || value === undefined) return "";
  if (contentType === "select") {
    const selected = (value as { selected?: unknown })?.selected;
    return typeof selected === "string" ? selected : "";
  }
  if (contentType === "file" || contentType === "image") {
    const name = (value as { name?: unknown })?.name;
    return typeof name === "string" && name ? `文件「${name}」` : "";
  }
  return typeof value === "string" ? value : "";
}

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getProjectNodes = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ projectCode: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient()
      .from("project_nodes")
      .select("*")
      .eq("project_code", data.projectCode)
      .order("sort_order");
    if (error) throw new Error("项目信息加载失败");
    return rows;
  });

/** 标注集合：某项目下所有被标注（重点关注）的节点 id。 */
export const getNodeMarks = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ projectCode: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient()
      .from("project_node_marks")
      .select("node_id")
      .eq("project_code", data.projectCode);
    if (error) throw new Error("标注加载失败");
    return (rows ?? []).map((row) => row.node_id);
  });

/** 切换某节点的重点关注标注（所有人共享）。 */
export const toggleNodeMark = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      nodeId: z.string().uuid(),
      projectCode: z.string().min(1),
      operator: z.string().max(40).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const client = publicClient();
    const { data: existing } = await client
      .from("project_node_marks")
      .select("id")
      .eq("node_id", data.nodeId)
      .maybeSingle();
    if (existing) {
      const { error } = await client.from("project_node_marks").delete().eq("id", existing.id);
      if (error) throw new Error("取消标注失败");
      return { marked: false };
    }
    const { error } = await client.from("project_node_marks").insert({
      project_code: data.projectCode,
      node_id: data.nodeId,
      created_by: data.operator ?? "",
    });
    if (error) throw new Error("标注失败");
    return { marked: true };
  });

/** 关注节点变动：某项目下被标注节点的最近内容变动。 */
export const getMarkedNodeChanges = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ projectCode: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient()
      .from("project_node_changes")
      .select("*")
      .eq("project_code", data.projectCode)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw new Error("变动记录加载失败");
    return rows;
  });

export const createProjectNode = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      projectCode: z.string().min(1),
      parentId: z.string().uuid().nullable(),
      title: z.string().min(1).max(80),
      sortOrder: z.number().int(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("project_nodes")
      .insert({
        project_code: data.projectCode,
        parent_id: data.parentId,
        title: data.title,
        sort_order: data.sortOrder,
      })
      .select()
      .single();
    if (error) throw new Error("节点新增失败");
    return row;
  });

export const updateProjectNode = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(80).optional(),
      contentType: nodeType.optional(),
      value: z.unknown().optional(),
      parentId: z.string().uuid().nullable().optional(),
      sortOrder: z.number().int().optional(),
      operator: z.string().max(40).optional(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const client = publicClient();
    const { data: before } = await client
      .from("project_nodes")
      .select("id, project_code, title, value, content_type, parent_id")
      .eq("id", data.id)
      .maybeSingle();

    const updates: Database["public"]["Tables"]["project_nodes"]["Update"] = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.contentType !== undefined) updates.content_type = data.contentType;
    if (data.value !== undefined) updates.value = data.value as Json;
    if (data.parentId !== undefined) updates.parent_id = data.parentId;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    const { data: row, error } = await client
      .from("project_nodes")
      .update(updates)
      .eq("id", data.id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`节点保存失败：${error.message}`);
    if (!row) throw new Error("该节点已不存在，请刷新页面后重试");

    if (before && data.value !== undefined) {
      await recordMarkedChange(client, {
        node: before,
        newValue: data.value,
        newContentType: data.contentType ?? before.content_type,
        newTitle: data.title ?? row.title,
        operator: data.operator ?? "",
      });
    }
    return row;
  });

type BeforeNode = {
  id: string;
  project_code: string;
  title: string;
  value: Json;
  content_type: string;
  parent_id: string | null;
};

/** 若节点被标注且内容文本有变化，记录一条变动（供项目动态展示）。 */
async function recordMarkedChange(
  client: ReturnType<typeof publicClient>,
  input: {
    node: BeforeNode;
    newValue: unknown;
    newContentType: string;
    newTitle: string;
    operator: string;
  },
) {
  const oldText = truncate(valueToText(input.node.value, input.node.content_type));
  const newText = truncate(valueToText(input.newValue, input.newContentType));
  if (oldText === newText) return;

  const { data: mark } = await client
    .from("project_node_marks")
    .select("id")
    .eq("node_id", input.node.id)
    .maybeSingle();
  if (!mark) return;

  const { data: allNodes } = await client
    .from("project_nodes")
    .select("id, parent_id, title")
    .eq("project_code", input.node.project_code);
  let rootTitle = input.newTitle;
  let parent = input.node.parent_id;
  let guard = 0;
  while (parent && guard < 10) {
    const found = (allNodes ?? []).find((item) => item.id === parent);
    if (!found) break;
    rootTitle = found.title;
    parent = found.parent_id;
    guard += 1;
  }

  const { error } = await client.from("project_node_changes").insert({
    project_code: input.node.project_code,
    node_id: input.node.id,
    node_title: input.newTitle,
    root_title: rootTitle,
    old_text: oldText,
    new_text: newText,
    changed_by: input.operator,
  });
  if (error) console.error("记录节点变动失败", error.message);
}

export const deleteProjectNode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("project_nodes").delete().eq("id", data.id);
    if (error) throw new Error("节点删除失败");
    return { id: data.id };
  });
