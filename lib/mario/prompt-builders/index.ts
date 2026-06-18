// /lib/mario/prompt-builders/index.ts
// Registry of all Mario prompt builders, keyed by source.
// To add a new Mario feature: create a new builder file and register it here.
// The route handler never needs to change.

import { MarioContext, MarioSource } from "../types";
import { buildMainChatPrompt } from "./mainChat";
import { buildQuickPromptPrompt } from "./quickPrompt";
import { buildTellMeMorePrompt } from "./tellMeMore";

type PromptBuilder = (
  promptText: string,
  context: MarioContext
) => {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

const promptBuilders: Record<MarioSource, PromptBuilder> = {
  main_chat: buildMainChatPrompt,
  quick_prompt: buildQuickPromptPrompt,
  tell_me_more: buildTellMeMorePrompt,
  recommendation_card: buildTellMeMorePrompt, // shares same builder for now
  voice_journal: buildMainChatPrompt,          // shares main chat for now
  pairing_request: buildQuickPromptPrompt,     // shares quick prompt for now
};

export function getPromptBuilder(source: MarioSource): PromptBuilder {
  return promptBuilders[source] ?? buildMainChatPrompt;
}
