export interface RawArticle {
  title: string;
  url: string;
  source: string | null;
  published_at: Date;
}

interface BraveNewsResult {
  title?: string;
  url?: string;
  meta_url?: { hostname?: string };
  age?: string;
  description?: string;
}

export async function scrapeNewsForTicker(ticker: string, companyName: string): Promise<RawArticle[]> {
  const apiKey = process.env.BRAVE_BROWSER_SEARCH;

  if (!apiKey) {
    console.warn('[news] BRAVE_BROWSER_SEARCH not set — skipping news scrape');
    return [];
  }

  // Search for today's news using Brave News Search API
  const query = encodeURIComponent(`${ticker} ${companyName} stock`);
  const url = `https://api.search.brave.com/res/v1/news/search?q=${query}&count=5&freshness=pd`;

  let results: BraveNewsResult[] = [];
  try {
    const res = await fetch(url, {
      headers: {
        'X-Subscription-Token': apiKey,
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[news] Brave search failed for ${ticker}: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json() as { results?: BraveNewsResult[] };
    results = data?.results ?? [];
  } catch (e) {
    console.warn(`[news] Brave search error for ${ticker}:`, e instanceof Error ? e.message : e);
    return [];
  }

  const articles: RawArticle[] = [];

  for (const item of results) {
    if (!item.title || !item.url) continue;

    // Parse the "age" field (e.g. "2 hours ago", "15 minutes ago")
    const published_at = parseAge(item.age);
    if (!published_at) continue;

    const source = item.meta_url?.hostname?.replace(/^www\./, '') ?? null;

    articles.push({
      title: item.title,
      url: item.url,
      source,
      published_at,
    });
  }

  return articles;
}

function parseAge(age: string | undefined): Date | null {
  if (!age) return null;

  const now = Date.now();
  const match = age.match(/(\d+)\s+(second|minute|hour|day|week|month)s?\s+ago/i);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };

  const ms = multipliers[unit];
  if (!ms) return null;

  return new Date(now - value * ms);
}
