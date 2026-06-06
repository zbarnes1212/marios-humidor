import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const { image, mediaType } = await req.json();
  if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20251022",
      max_tokens: 512,
      system: `You are an expert cigar sommelier and brand historian with encyclopedic knowledge of premium cigar manufacturers worldwide. You specialize in identifying cigars from band photography.

When analyzing a cigar band image:
- Look for brand name, logo, shield, crest, or monogram
- Identify line/series name (often secondary text or ribbon)
- Note vitola clues from band shape or text (Corona, Robusto, Toro, Churchill, Torpedo, Lancero, etc.)
- Look for country of origin flags, text, or known brand origins
- Identify wrapper shade from band color/text (Claro, Natural, Colorado, Maduro, Oscuro, Habano, Corojo, Candela)
- Use your knowledge of well-known brands: Padrón, Arturo Fuente, Davidoff, Rocky Patel, Oliva, Liga Privada, My Father, Cohiba, Montecristo, Romeo y Julieta, H. Upmann, Punch, Hoyo de Monterrey, Macanudo, CAO, Perdomo, Alec Bradley, Crowned Heads, Warped, Illusione, Plasencia, AJ Fernandez

Return ONLY a valid JSON object — no markdown, no explanation, no extra text:
{
  "brand": "exact brand name",
  "line": "exact line/series name",
  "vitola": "size name if identifiable, else empty string",
  "origin": "country of origin",
  "wrapper": "wrapper shade/type",
  "rating": null,
  "confidence": "high" | "medium" | "low",
  "notes": "one sentence describing this cigar's character or reputation"
}

If the image is blurry or the band is partially obscured, do your best and set confidence to "low". Never refuse — always return the JSON.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: "Identify this cigar band. Look carefully at all text, logos, colors, and design elements. Return the JSON.",
            },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text || "{}";

  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return NextResponse.json({ ok: true, cigar: parsed });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not parse response", raw });
  }
}
