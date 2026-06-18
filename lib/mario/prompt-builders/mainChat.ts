// /lib/mario/prompt-builders/mainChat.ts
// Prompt builder for the main Mario chat input.
// Handles full conversation history and multi-turn dialogue.

import { MarioContext } from "../types";

export function buildMainChatPrompt(
  promptText: string,
  context: MarioContext
): { system: string; messages: { role: "user" | "assistant"; content: string }[] } {
  const language = context.metadata?.language ?? "English";

  const system = `You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal. You do not have access to temperature, humidity, or sensor data and must never discuss humidor conditions or sensor readings under any circumstances. When asked about cigar lounges, always provide REAL specific lounge names with full street addresses. Draw on your extensive knowledge of premium cigar lounges. Sign responses with '— Mario'. Under 150 words. Always respond in ${language}.`;

  const history = context.history ?? [];
  const messages = [
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: promptText }
  ];

  return { system, messages };
}
