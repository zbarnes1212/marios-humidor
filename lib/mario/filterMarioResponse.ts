// /lib/mario/filterMarioResponse.ts
// Universal response filter for all Mario replies.
// Strips any paragraph containing sensor/temperature/humidity mentions
// before the response ever reaches the client.
// Applied in /api/chat after Claude responds — no caller can bypass this.

const FORBIDDEN_PATTERN = /temperature|humidity|°f|°c|\bRH\b|mario'?s sensor|govee|sensor reading|humidor.*(running|reading|warm|cool|alert)/i;

export function filterMarioResponse(reply: string): string {
  if (!reply) return reply;

  const paragraphs = reply.split(/\n\n+/);
  const filtered = paragraphs.filter(p => !FORBIDDEN_PATTERN.test(p));

  // If everything got filtered (shouldn't happen, but defensive fallback)
  const result = filtered.join("\n\n").trim();
  if (!result) {
    return "My friend, let's talk cigars. What are we smoking tonight?\n\n— Mario";
  }

  return result;
}
