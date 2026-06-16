// app/api/scan/route.ts
// Pipeline: photo → catalog lookup → hit: return catalog data
//                                  → miss: Mario identifies from photo (with web knowledge)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Step 1: Extract band text from photo ──────────────────────────────────
async function extractBandText(base64: string, mediaType: string): Promise<string> {
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType as any, data: base64 } },
        { type: "text", text: "Read the cigar band in this image. Return ONLY the brand name and product line text you can see on the band, nothing else. If you cannot read a band, return 'UNREADABLE'." }
      ]
    }]
  });
  return (res.content[0] as any).text?.trim() ?? "";
}

// ── Step 2: Search catalog ────────────────────────────────────────────────
async function searchCatalog(query: string) {
  if (!query || query === "UNREADABLE") return null;
  const { data } = await supabase
    .from("cigar_catalog")
    .select("*")
    .or(`brand.ilike.%${query}%,line.ilike.%${query}%`)
    .limit(1);
  return data?.[0] ?? null;
}

// ── Step 3: Mario identifies from photo (fallback) ────────────────────────
async function marioIdentify(base64: string, mediaType: string, bandText: string) {
  const prompt = `You are Mario, a master cigar sommelier with encyclopedic knowledge of cigars worldwide.

Examine this cigar band photo carefully. ${bandText && bandText !== "UNREADABLE" ? `The band text appears to read: "${bandText}".` : "The band text is unclear."}

Identify this cigar and return ONLY a valid JSON object with exactly these fields (no markdown, no explanation):
{
  "brand": "brand name",
  "line": "product line name",
  "vitola": "size/shape (e.g. Robusto, Toro, Churchill)",
  "origin": "country of origin",
  "wrapper": "wrapper leaf origin/type",
  "rating": 90,
  "notes": "2-3 sentences on flavor profile, strength, and what makes this cigar notable",
  "confidence": "high|medium|low"
}

Set confidence to:
- "high" if you are certain of the identification
- "medium" if you recognize the brand but are estimating the line/vitola
- "low" if this is an educated guess

Use your training knowledge and typical characteristics for this cigar. If truly unidentifiable, use your best professional estimate and set confidence to "low".`;

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType as any, data: base64 } },
        { type: "text", text: prompt }
      ]
    }]
  });

  const text = (res.content[0] as any).text?.trim() ?? "";
  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image) return NextResponse.json({ ok: false, error: "No image" }, { status: 400 });

    // Step 1: extract band text
    const bandText = await extractBandText(image, mediaType ?? "image/jpeg");

    // Step 2: catalog lookup
    const catalogHit = await searchCatalog(bandText);
    if (catalogHit) {
      return NextResponse.json({
        ok: true,
        source: "catalog",
        cigar: {
          brand: catalogHit.brand ?? "",
          line: catalogHit.line ?? "",
          vitola: catalogHit.vitola ?? "",
          origin: catalogHit.origin ?? "",
          wrapper: catalogHit.wrapper ?? "",
          rating: catalogHit.rating ?? null,
          notes: catalogHit.notes ?? "",
          confidence: "high",
        }
      });
    }

    // Step 3: Mario fallback — send photo + extracted text
    const marioResult = await marioIdentify(image, mediaType ?? "image/jpeg", bandText);
    if (marioResult && marioResult.brand) {
      return NextResponse.json({
        ok: true,
        source: "mario",
        cigar: {
          brand: marioResult.brand ?? "",
          line: marioResult.line ?? "",
          vitola: marioResult.vitola ?? "",
          origin: marioResult.origin ?? "",
          wrapper: marioResult.wrapper ?? "",
          rating: marioResult.rating ?? null,
          notes: marioResult.notes ?? "",
          confidence: marioResult.confidence ?? "medium",
        }
      });
    }

    return NextResponse.json({ ok: false, error: "Could not identify cigar" });

  } catch (err: any) {
    console.error("[scan]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
