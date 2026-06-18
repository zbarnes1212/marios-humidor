// /lib/mario/types.ts
// Shared type definitions for the Mario AI pipeline.
// Every frontend caller and every backend builder imports from here.

export type MarioSource =
  | "main_chat"
  | "quick_prompt"
  | "tell_me_more"
  | "recommendation_card"
  | "voice_journal"
  | "pairing_request";

export type MarioContext = {
  // Required: identifies which UI element triggered this request
  source: MarioSource;

  // Conversation history for multi-turn chat (main_chat, quick_prompt)
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];

  // Structured target for item-specific requests (tell_me_more, recommendation_card)
  target?: {
    type: "cigar" | "lounge" | "pairing" | "event" | "article";
    id?: string;
    name?: string;
    data?: Record<string, unknown>;
  };

  // Optional metadata for context and personalization
  metadata?: {
    language?: string;        // e.g. "en", "es", "pt", "fr", "de"
    userIntent?: string;      // e.g. "find a pairing", "learn about wrappers"
    buttonLabel?: string;     // e.g. "What's aging well?"
    screen?: string;          // e.g. "home", "cigars", "humidors"
  };
};

export type MarioRequest = {
  promptText: string;
  context: MarioContext;
  userId: string;
};

export type MarioResponse = {
  ok: boolean;
  text?: string;
  error?: string;
};
