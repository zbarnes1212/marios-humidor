// /app/api/chat/route.ts
// The single backend entry point for all Mario AI requests.
// Pipeline: validate membership → build prompt → call Claude → filter response → return

import { NextRequest } from "next/server";
import { validateMarioAccess } from "@/lib/mario/validateMarioAccess";
import { filterMarioResponse } from "@/lib/mario/filterMarioResponse";
import { getPromptBuilder } from "@/lib/mario/prompt-builders/index";
import { MarioRequest } from "@/lib/mario/types";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: MarioRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { promptText, context, userId } = body;

  // Step 1 — Membership validation
  const access = await validateMarioAccess(userId);
  if (!access.allowed) {
    return new Response(JSON.stringify({ error: "Pro subscription required", reason: access.reason }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 2 — Build prompt
  const builder = getPromptBuilder(context.source);
  const { system, messages } = builder(promptText, context);

  // Step 3 — Call Claude API with streaming
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

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return new Response(JSON.stringify({ error: text || "Upstream error" }), {
      status: upstream.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 4 — Collect full response with proper SSE buffering
  // Anthropic SSE events can be split across network chunks so we buffer
  // incomplete lines and only parse complete events
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        // Only extract text from content_block_delta events
        if (parsed.type === "content_block_delta") {
          fullText += parsed.delta?.text ?? "";
        }
      } catch {
        // Silently skip malformed lines
      }
    }
  }

  // Step 5 — Apply universal content filter
  const filtered = filterMarioResponse(fullText);

  // Step 6 — Return filtered response
  return new Response(JSON.stringify({
    content: [{ type: "text", text: filtered }]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
