import { NextResponse } from "next/server";

const PODCAST_CHANNELS = [
  {
    id: "UC1Zsfk4oNUId8Sx3Va0rfgg",
    name: "The Cigar Authority",
    accent: "#7a1212",
  },
  {
    id: "UCqzjAgSNDxc5UpbjvId0yNA",
    name: "Cigar Talk Podcast",
    accent: "#8B6914",
  },
  {
    id: "UCNbl-MAlxA-n_HL74GfT61g",
    name: "Cigar Hustlers Podcast",
    accent: "#2a5c38",
  },
];

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "No YouTube API key" });

  try {
    const results = await Promise.allSettled(
      PODCAST_CHANNELS.map(async (channel) => {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video&maxResults=2&order=date&key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (!data.items?.length) return [];
        return data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channel: channel.name,
          accent: channel.accent,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          }),
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
      })
    );

    const grouped = PODCAST_CHANNELS.map((channel, i) => ({
      channel: channel.name,
      accent: channel.accent,
      videos: results[i].status === "fulfilled" ? (results[i] as any).value : [],
    }));

    return NextResponse.json({ ok: true, grouped });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
