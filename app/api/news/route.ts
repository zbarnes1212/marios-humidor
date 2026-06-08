import { NextResponse } from 'next/server';

const FEEDS = [
  { source: 'Halfwheel',        accent: '#C49A28', url: 'https://halfwheel.com/feed/' },
  { source: 'Stogie Review',    accent: '#5a3c1e', url: 'https://www.stogiereview.com/feed/' },
  { source: "Blind Man's Puff", accent: '#1a2c50', url: 'https://blindmanspuff.com/feed/' },
  { source: 'Cigar Obsession',  accent: '#8B2020', url: 'https://www.cigarobsession.com/feed/' },
];

function extractImage(item: string): string {
  return (
    /<media:content[^>]+url="([^"]+)"/s.exec(item)?.[1] ||
    /<media:thumbnail[^>]+url="([^"]+)"/s.exec(item)?.[1] ||
    /<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/si.exec(item)?.[1] ||
    /<content:encoded><!\[CDATA\[[\s\S]*?<img[^>]+src=["']([^"']+)["']/i.exec(item)?.[1] ||
    /<description><!\[CDATA\[[\s\S]*?<img[^>]+src=["']([^"']+)["']/i.exec(item)?.[1] ||
    ''
  );
}

function parseRSS(xml: string, source: string, accent: string): any[] {
  const articles: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/s.exec(item) || /<title>([^<]+)<\/title>/s.exec(item))?.[1]
      ?.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(+c))
      ?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim() ?? '';
    const link = (/<link>(https?:\/\/[^<]+)<\/link>/s.exec(item) ||
                  /<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/s.exec(item))?.[1]?.trim() ?? '';
    const pubDate = (/<pubDate>(.*?)<\/pubDate>/s.exec(item))?.[1]?.trim() ?? '';
    const summary = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/s.exec(item) ||
                     /<description>([^<]*)<\/description>/s.exec(item))?.[1]
      ?.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim().slice(0, 180) ?? '';
    const image = extractImage(item);
    if (title && link) {
      articles.push({
        id: link, title,
        summary: summary || 'Read the full article →',
        source, accent, link, image,
        date: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        pubDate: pubDate ? new Date(pubDate).getTime() : 0,
      });
    }
  }
  return articles;
}

async function fetchFeed(feed: typeof FEEDS[0]): Promise<any[]> {
  try {
    const r = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (r.ok) {
      const xml = await r.text();
      if (xml.includes('<item>')) return parseRSS(xml, feed.source, feed.accent);
    }
  } catch {}
  return [];
}

export async function GET() {
  try {
    const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
    const articles = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, 40);
    return NextResponse.json({ ok: articles.length > 0, articles });
  } catch {
    return NextResponse.json({ ok: false, articles: [] });
  }
}
