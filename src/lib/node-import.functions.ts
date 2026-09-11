import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().min(1).max(120000),
  nodes: z
    .array(z.object({ id: z.string(), path: z.string(), contentType: z.string(), options: z.array(z.string()).optional() }))
    .max(2000),
});

export type ImportedItem = {
  title: string;
  value: string;
  matchedNodeId: string | null;
  suggestedParentPath: string | null;
};

/** 让 AI 从导入文件的文本中识别「节点 → 内容」，并尽量匹配已有节点。 */
export const analyzeImportText = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ImportedItem[]> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI 服务未配置");

    const catalog = data.nodes
      .map((node) => `${node.id}\t${node.path}\t${node.contentType}${node.options?.length ? `\t选项:${node.options.join("|")}` : ""}`)
      .join("\n");

    const prompt = `下面是一个项目的信息节点清单（每行：节点ID\\t标签路径\\t内容类型[\\t可选项]）：\n${catalog}\n\n下面是用户导入的文件内容：\n"""\n${data.text.slice(0, 100000)}\n"""\n\n请从文件内容中抽取「信息名称 → 信息内容」，并尽量匹配上面的已有节点。要求：\n- 只输出确实能从文件中读到的内容，不要编造。\n- 匹配到已有节点时 matchedNodeId 填该节点ID，否则填 null 并在 suggestedParentPath 里给出建议归属的一级/二级标签路径。\n- value 为纯文本内容，简洁准确。\n- 严格输出 JSON：{"items":[{"title":"","value":"","matchedNodeId":null,"suggestedParentPath":null}]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: "你是项目信息整理助手，只输出 JSON。" },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 429) throw new Error("AI 服务繁忙，请稍后再试");
      if (response.status === 402) throw new Error("AI 额度不足，请补充额度后再试");
      throw new Error(`AI 识别失败（${response.status}）：${body.slice(0, 200)}`);
    }

    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI 返回内容无法解析，请重试");
    }
    const items = (parsed as { items?: unknown }).items;
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        const row = item as Record<string, unknown>;
        const title = typeof row["title"] === "string" ? row["title"].trim() : "";
        const value = typeof row["value"] === "string" ? row["value"].trim() : "";
        const matchedNodeId = typeof row["matchedNodeId"] === "string" ? row["matchedNodeId"] : null;
        const suggestedParentPath = typeof row["suggestedParentPath"] === "string" ? row["suggestedParentPath"] : null;
        return { title, value, matchedNodeId, suggestedParentPath };
      })
      .filter((item) => item.title && item.value);
  });
