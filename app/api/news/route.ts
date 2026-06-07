import { NextResponse } from 'next/server';

// ── Publisher configs ──────────────────────────────────────────────────────
// Each entry defines how to scrape the publisher's homepage or listing page.
// We pull og:image + article links from their actual HTML — no RSS needed.
const PUBLISHERS = [
  {
    source: 'Halfwheel',
    accent: '#C49A28',
    url: 'https://halfwheel.com',
    // article link pattern on homepage
    articlePattern: /href="(https:\/\/halfwheel\.com\/[^"]*\/\d{4}\/\d{2}\/[^"]+)"/g,
  },
  {
    source: 'Cigar Aficionado',
    accent: '#7a1212',
    url: 'https://www.cigaraficionado.com/article',
    articlePattern: /href="(https:\/\/www\.cigaraficionado\.com\/article\/[^"]+)"/g,
  },
  {
    source: 'Cigar Advisor',
    accent: '#2a5c38',
    url: 'https://www.famous-smoke.com/cigaradvisor',
    articlePattern: /href="(https:\/\/www\.famous-smoke\.com\/cigaradvisor\/[^"]+)"/g,
  },
  {
    source: 'Cigar Journal',
    accent: '#1a2c50',
    url: 'https://www.cigarjournal.com/en/cigar-reviews',
    articlePattern: /href="(https:\/\/www\.cigarjournal\.com\/[^"]*review[^"]+)"/g,
  },
  {
    source: 'Cigars Daily',
    accent: '#8B2020',
    url: 'https://cigarsdaily.com',
    articlePattern: /href="(https:\/\/cigarsdaily\.com\/[^"]*\/\d{4}\/\d{2}\/[^"]+)"/g,
  },
  {
    source: 'Stogie Review',
    accent: '#5a3c1e',
    url: 'https://www.stogiereview.com',
    articlePattern: /href="(https:\/\/www\.stogiereview\.com\/[^"]*\/\d{4}\/\d{2}\/[^"]+)"/g,
  },
  {
    source: 'Stogie Press',
    accent: '#3a6a4a',
    url: 'https://stogiepress.com',
    articlePattern: /href="(https:\/\/stogiepress\.com\/[^"]+\/\d{4}\/[^"]+)"/g,
  },
  {
    source: 'Cigars & Spirits',
    accent: '#4a6a9a',
    url: 'https://www.cigarsandspirits.com',
    articlePattern: /href="(https:\/\/www\.cigarsandspirits\.com\/[^"]*article[^"]+)"/g,
  },
  {
    source: 'Developing Palates',
    accent: '#7a4a8a',
    url: 'https://developingpalates.com',
    articlePattern: /href="(https:\/\/developingpalates\.com\/[^"]*\/\d{4}\/[^"]+)"/g,
  },
];

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

const ARTICLE_TIMEOUT_MS = 5000;
const ARTICLES_PER_SOURCE = 2;

// Pull og:image, og:title, og:description, and published date from an article page
async function fetchArticleMeta(url: string): Promise<{
  title: string; summary: string; image: string; date: string;
} | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ARTICLE_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();

    const ogTitle =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1] ||
      html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';

    const ogDesc =
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1] ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';

    const ogImage =
      html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1] ||
      html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';

    const dateStr =
      html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<time[^>]*datetime=["']([^"']+)["']/i)?.[1] || '';

    const date = dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

    if (!ogTitle) return null;

    return {
      title: ogTitle.trim().replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
      summary: ogDesc.trim().substring(0, 140),
      image: ogImage && ogImage.startsWith('http') ? ogImage : '',
      date,
    };
  } catch {
    return null;
  }
}

// Fetch publisher homepage and extract unique article URLs
async function fetchArticleLinks(
  url: string,
  pattern: RegExp,
  max: number
): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS });
    clearTimeout(timer);
    if (!res.ok) return [];
    const html = await res.text();
    const links = new Set<string>();
    let match;
    const re = new RegExp(pattern.source, 'g');
    while ((match = re.exec(html)) !== null && links.size < max * 3) {
      links.add(match[1]);
    }
    return [...links].slice(0, max);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Step 1 — scrape each publisher homepage for article links
    const linkResults = await Promise.allSettled(
      PUBLISHERS.map(async (pub) => {
        const links = await fetchArticleLinks(pub.url, pub.articlePattern, ARTICLES_PER_SOURCE + 2);
        return { ...pub, links };
      })
    );

    // Step 2 — for each publisher, fetch article meta (og:image, title, desc) in parallel
    const allArticles = await Promise.all(
      linkResults
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.links.length > 0)
        .map(async ({ value: pub }) => {
          const metas = await Promise.all(
            pub.links.slice(0, ARTICLES_PER_SOURCE + 1).map((link: string) => fetchArticleMeta(link).then(m => m ? { ...m, link } : null))
          );
          return metas
            .filter(Boolean)
            .slice(0, ARTICLES_PER_SOURCE)
            .map((m: any) => ({
              ...m,
              source: pub.source,
              accent: pub.accent,
              image: m.image || pub.fallbackImage || '',
            }));
        })
    );

    // Step 3 — interleave round-robin so no source dominates
    const bySource = allArticles.filter(s => s.length > 0);
    const articles: any[] = [];
    const maxRounds = Math.max(...bySource.map(s => s.length));
    for (let round = 0; round < maxRounds; round++) {
      for (const source of bySource) {
        if (source[round]) articles.push(source[round]);
      }
    }

    const tagged = articles.map((a, i) => ({ ...a, id: i + 1 }));
    if (tagged.length === 0) throw new Error('No articles');

    return NextResponse.json({ ok: true, articles: tagged });
  } catch {
    return NextResponse.json({ ok: false, articles: [] });
  }
}
