// /app/api/chat/route.ts
// The single backend entry point for all Mario AI requests.
// Every Mario interaction flows through here — no exceptions.
// Pipeline: validate membership → build prompt → call Claude → filter response → stream to client

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

  // Step 1 — Membership validation (server-side, cannot be bypassed by frontend)
  const access = await validateMarioAccess(userId);
  if (!access.allowed) {
    return new Response(JSON.stringify({ error: "Pro subscription required", reason: access.reason }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 2 — Build prompt using the correct builder for this source
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

  // Step 4 — Stream response through universal filter
  // We collect the full response first so we can filter it before sending
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // Extract text from SSE chunks
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.delta?.text || parsed?.content?.[0]?.text || "";
          fullText += delta;
        } catch { /* skip malformed chunks */ }
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
