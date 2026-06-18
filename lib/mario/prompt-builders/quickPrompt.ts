// /lib/mario/prompt-builders/quickPrompt.ts
// Prompt builder for the four quick-prompt buttons on the Mario tab.
// Includes which button was tapped and optional conversation context.

import { MarioContext } from "../types";

export function buildQuickPromptPrompt(
  promptText: string,
  context: MarioContext
): { system: string; messages: { role: "user" | "assistant"; content: string }[] } {
  const language = context.metadata?.language ?? "English";
  const buttonLabel = context.metadata?.buttonLabel ?? "";

  const system = `You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal. You do not have access to temperature, humidity, or sensor data and must never discuss humidor conditions or sensor readings under any circumstances.${buttonLabel ? ` The user tapped the "${buttonLabel}" button.` : ""} When asked about cigar lounges, always provide REAL specific lounge names with full street addresses. Sign responses with '— Mario'. Under 150 words. Always respond in ${language}.`;

  const history = context.history ?? [];
  const messages = [
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content: promptText }
  ];

  return { system, messages };
}
