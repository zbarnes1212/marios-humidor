import { NextResponse } from "next/server";

const FEATURED_CHANNELS = [
  { id: "UCmsHB4Gx7rYOaAP25d76C3w", name: "Cigars Daily" },
  { id: "UC3Y7OkIW5Yu6-h2CcgtmPSQ", name: "Cigar Aficionado" },
];

function isShort(item: any): boolean {
  const title = item.snippet.title?.toLowerCase() ?? '';
  const desc = item.snippet.description?.toLowerCase() ?? '';
  // Filter shorts by hashtag or very short description
  return title.includes('#shorts') ||
         title.includes('#short') ||
         title.includes('#cigarsdaily') ||
         desc.includes('#shorts') ||
         // YouTube Shorts have square thumbnails (width === height)
         item.snippet.thumbnails?.default?.width === item.snippet.thumbnails?.default?.height;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "No YouTube API key" });

  try {
    const results = await Promise.allSettled(
      FEATURED_CHANNELS.map(async (channel) => {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video&maxResults=15&order=date&key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (!data.items?.length) return [];
        return data.items
          .filter((item: any) => !isShort(item))
          .slice(0, 4)
          .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: channel.name,
            description: item.snippet.description?.slice(0, 120) || "",
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            }),
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          }));
      })
    );

    const videos = results
      .filter(r => r.status === "fulfilled")
      .flatMap((r: any) => r.value)
      .slice(0, 8)
      .map((v, i) => ({ ...v, idx: i }));

    if (videos.length === 0) return NextResponse.json({ ok: false, error: "No videos found" });
    return NextResponse.json({ ok: true, videos });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
