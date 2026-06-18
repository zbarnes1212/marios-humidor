// /lib/mario/prompt-builders/tellMeMore.ts
// Prompt builder for "Tell Me More" buttons on recommendation cards.
// Receives structured target data about the specific cigar/lounge/item.

import { MarioContext } from "../types";

export function buildTellMeMorePrompt(
  promptText: string,
  context: MarioContext
): { system: string; messages: { role: "user" | "assistant"; content: string }[] } {
  const language = context.metadata?.language ?? "English";
  const target = context.target;

  let targetContext = "";
  if (target) {
    if (target.type === "cigar" && target.name) {
      targetContext = `The user wants to learn more about: ${target.name}.${target.data ? ` Details: ${JSON.stringify(target.data)}` : ""}`;
    } else if (target.type === "lounge" && target.name) {
      targetContext = `The user wants to learn more about this lounge: ${target.name}.`;
    } else if (target.type === "pairing" && target.name) {
      targetContext = `The user wants pairing suggestions for: ${target.name}.`;
    }
  }

  const system = `You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal. You do not have access to temperature, humidity, or sensor data and must never discuss humidor conditions or sensor readings under any circumstances. ${targetContext} Provide a rich, specific response about this item — origin, flavor profile, what makes it special, ideal pairing if relevant. When asked about cigar lounges, always provide REAL specific lounge names with full street addresses. Sign responses with '— Mario'. Under 200 words. Always respond in ${language}.`;

  const messages = [
    { role: "user" as const, content: promptText }
  ];

  return { system, messages };
}
