import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You extract structured tasting-note data from a spoken cigar journal transcript.

The user has already selected the cigar (provided separately) — do not try to re-identify it. Your only job is to pull out:
- rating: integer 1-5 based on overall sentiment (5 = loved it, 1 = hated it). If sentiment is unclear or neutral, use 3.
- pairing: any drink mentioned (e.g. "bourbon", "espresso", "Blanton's"). Empty string if none mentioned.
- notes: a cleaned-up version of their tasting description — fix filler words ("um", "like", "you know"), fix obvious transcription errors, but preserve their actual opinions and phrasing as much as possible. Do not invent details they didn't say.

Respond with ONLY a JSON object, no markdown formatting, no backticks, no preamble. Exact shape:
{"rating":3,"pairing":"","notes":""}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, cigarName, apiKey } = body;

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const key = apiKey || process.env.ANTHROPIC_API_KEY || "";

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Cigar: ${cigarName || "Unknown"}\n\nTranscript: "${transcript}"`,
          },
        ],
      }),
    });

    const data = await res.json();

    const rawText = data?.content?.[0]?.text || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: if Haiku didn't return clean JSON, give the user something usable
      // rather than failing the whole request — the raw transcript still has value.
      parsed = { rating: 3, pairing: "", notes: transcript };
    }

    return NextResponse.json({
      rating: typeof parsed.rating === "number" ? Math.min(5, Math.max(1, Math.round(parsed.rating))) : 3,
      pairing: typeof parsed.pairing === "string" ? parsed.pairing : "",
      notes: typeof parsed.notes === "string" ? parsed.notes : transcript,
    });
  } catch (e) {
    console.error("[journal-extract] failed:", e);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
