import { NextResponse } from "next/server";

const CIGAR_CHANNELS = [
  "UCnxOJ6ElPOtMEMaj-f8M9xA", // Cigar Obsession
  "UCbIzPWuFnMPWN9ZC8JGiMoQ", // Halfwheel
  "UC_TVQqJn2_Q1jU1dE6e8qSg", // Famous Smoke Shop
  "UCDWqMqI2TIwHpsgw8cG8-mg", // Cigar Advisor
];

const SEARCH_QUERIES = [
  "cigar review 2025",
  "premium cigar pairing",
  "humidor tips cigars",
  "new cigar release 2025",
];

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "No YouTube API key" });

  try {
    // Search for recent cigar videos
    const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=8&order=date&videoCategoryId=26&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) {
      return NextResponse.json({ ok: false, error: "No videos found" });
    }

    const videos = data.items.map((item: any, i: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: item.snippet.description?.slice(0, 120) || "",
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
      }),
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json({ ok: true, videos });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
