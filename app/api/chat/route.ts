// /app/api/chat/route.ts — DEBUG VERSION
import { NextRequest } from "next/server";
import { validateMarioAccess } from "@/lib/mario/validateMarioAccess";
import { filterMarioResponse } from "@/lib/mario/filterMarioResponse";
import { getPromptBuilder } from "@/lib/mario/prompt-builders/index";
import { MarioRequest } from "@/lib/mario/types";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[mario] No API key");
    return new Response(JSON.stringify({ error: "No API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: MarioRequest;
  try {
    body = await req.json();
  } catch {
    console.error("[mario] Invalid request body");
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { promptText, context, userId } = body;
  console.log("[mario] userId:", userId);
  console.log("[mario] source:", context?.source);
  console.log("[mario] promptText:", promptText?.slice(0, 50));

  // Step 1 — Membership validation
  const access = await validateMarioAccess(userId);
  console.log("[mario] access:", JSON.stringify(access));

  if (!access.allowed) {
    return new Response(JSON.stringify({ error: "Pro subscription required", reason: access.reason }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 2 — Build prompt
  const builder = getPromptBuilder(context.source);
  const { system, messages } = builder(promptText, context);
  console.log("[mario] system prompt length:", system.length);
  console.log("[mario] messages count:", messages.length);

  // Step 3 — Call Claude API
  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages,
      stream: true,
    }),
  });

  console.log("[mario] upstream status:", upstream.status);

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    console.error("[mario] upstream error:", text);
    return new Response(JSON.stringify({ error: text || "Upstream error" }), {
      status: upstream.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 4 — Collect full response with SSE buffering
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta") {
          fullText += parsed.delta?.text ?? "";
        }
      } catch {
        // skip malformed
      }
    }
  }

  console.log("[mario] fullText length:", fullText.length);
  console.log("[mario] fullText preview:", fullText.slice(0, 100));

  // Step 5 — Filter
  const filtered = filterMarioResponse(fullText);
  console.log("[mario] filtered length:", filtered.length);

  // Step 6 — Return
  return new Response(JSON.stringify({
    content: [{ type: "text", text: filtered }]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
