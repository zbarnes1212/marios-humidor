import { NextResponse } from 'next/server';

const RSS_FEEDS = [
  { 
    url: 'https://www.halfwheel.com/feed', 
    source: 'Halfwheel', 
    accent: '#C49A28',
    fallbackImage: 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=600&q=80'
  },
  { 
    url: 'https://www.cigaraficionado.com/rss', 
    source: 'Cigar Aficionado', 
    accent: '#7a1212',
    fallbackImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
  },
  { 
    url: 'https://www.famous-smoke.com/cigaradvisor/feed', 
    source: 'Cigar Advisor', 
    accent: '#2a5c38',
    fallbackImage: 'https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80'
  },
];

function parseRSS(xml: string, source: string, accent: string, fallbackImage: string) {
  const items: any[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  
  for (const item of itemMatches.slice(0, 4)) {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || 
                  item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[2] || '';
    const link = item.match(/<link>(.*?)<\/link>|<link\s[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ||
                 item.match(/<link>(.*?)<\/link>|<link\s[^>]*href="([^"]*)"[^>]*\/>/)?.[2] || '';
    const desc = item.match(//<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1] ||
                 item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[2] ||
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    
    // Try multiple image sources from RSS
    const image = 
      item.match(/<media:content[^>]*url="([^"]*)"[^>]*\/?>/)?.[1] ||
      item.match(/<enclosure[^>]*url="([^"]*)"[^>]*\/>/)?.[1] ||
      item.match(/<media:thumbnail[^>]*url="([^"]*)"[^>]*\/?>/)?.[1] ||
      desc.match(/<img[^>]*src="([^"]*)"[^>]*\/?>/)?.[1] ||
      fallbackImage; // Always guaranteed an image

    const cleanDesc = desc.replace(/<[^>]+>/g, '').substring(0, 120).trim();
    const date = pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    if (title && link) {
      items.push({ 
        title: title.trim(), 
        link: link.trim(), 
        summary: cleanDesc, 
        source, 
        accent, 
        date, 
        image 
      });
    }
  }
  return items;
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(async ({ url, source, accent, fallbackImage }) => {
        const res = await fetch(url, { 
          next: { revalidate: 3600 },
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const xml = await res.text();
        return parseRSS(xml, source, accent, fallbackImage);
      })
    );

    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap((r: any) => r.value)
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map((a, i) => ({ ...a, id: i + 1 }));

    if (articles.length === 0) throw new Error('No articles');

    return NextResponse.json({ ok: true, articles });
  } catch {
    return NextResponse.json({ ok: false, articles: [] });
  }
}
