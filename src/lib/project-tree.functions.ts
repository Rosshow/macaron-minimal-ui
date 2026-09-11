import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";

export type ProjectNode = Database["public"]["Tables"]["project_nodes"]["Row"];

const nodeType = z.enum(["text", "select", "file", "image"]);

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
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const updates: Database["public"]["Tables"]["project_nodes"]["Update"] = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.contentType !== undefined) updates.content_type = data.contentType;
    if (data.value !== undefined) updates.value = data.value as Json;
    if (data.parentId !== undefined) updates.parent_id = data.parentId;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    const { data: row, error } = await publicClient()
      .from("project_nodes")
      .update(updates)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(`节点保存失败：${error.message}`);
    return row;
  });

export const deleteProjectNode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("project_nodes").delete().eq("id", data.id);
    if (error) throw new Error("节点删除失败");
    return { id: data.id };
  });