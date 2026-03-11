export interface RawArticle {
  title: string;
  url: string;
  source: string | null;
  published_at: Date;
}

interface YahooNewsItem {
  title?: string;
  link?: string;
  publisher?: string;
  providerPublishTime?: number;
}

export async function scrapeNewsForTicker(ticker: string, companyName: string): Promise<RawArticle[]> {
  // Use Yahoo Finance search API for news — reliable from server-side
  const query = encodeURIComponent(ticker);
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${query}&newsCount=50`;

  let newsItems: YahooNewsItem[] = [];
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[news] Yahoo Finance search failed for ${ticker}: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json() as { news?: YahooNewsItem[] };
    newsItems = data?.news ?? [];
  } catch (e) {
    console.warn(`[news] Yahoo Finance search error for ${ticker}:`, e instanceof Error ? e.message : e);
    return [];
  }

  const articles: RawArticle[] = [];
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

  for (const item of newsItems) {
    if (!item.title || !item.link) continue;

    let published_at: Date;
    if (item.providerPublishTime) {
      published_at = new Date(item.providerPublishTime * 1000);
    } else {
      continue;
    }

    if (published_at < cutoff) continue;

    articles.push({
      title: item.title,
      url: item.link,
      source: item.publisher ?? null,
      published_at,
    });
  }

  return articles;
}
