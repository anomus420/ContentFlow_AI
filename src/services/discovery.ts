import Parser from 'rss-parser';

export interface TopicCandidate {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: Date;
}

const parser = new Parser({
  timeout: 3000,
});

/**
 * Discovers AI & Technology topics from 3 live public information sources:
 * 1. HackerNews Algolia API
 * 2. arXiv Computer Science / AI Research Papers API
 * 3. Selected RSS feeds (TechCrunch AI, Ars Technica, Hugging Face)
 */
export async function discoverTopics(domain: string, isForce: boolean = false): Promise<TopicCandidate[]> {
  const candidates: TopicCandidate[] = [];

  const page = isForce ? Math.floor(Math.random() * 4) : 0;

  const [hnTopics, arxivTopics, rssTopics] = await Promise.all([
    fetchHackerNewsTopics(domain, page),
    fetchArxivTopics(domain, page * 5),
    fetchRssTopics()
  ]);

  candidates.push(...hnTopics, ...arxivTopics, ...rssTopics);

  // Shuffle & deduplicate by URL in memory before returning capped candidates
  const uniqueMap = new Map<string, TopicCandidate>();
  
  // Randomize candidate array order
  const shuffled = candidates.sort(() => Math.random() - 0.5);

  for (const item of shuffled) {
    if (item.url && !uniqueMap.has(item.url)) {
      uniqueMap.set(item.url, item);
    }
  }

  return Array.from(uniqueMap.values()).slice(0, 20);
}

async function fetchHackerNewsTopics(domain: string, page: number = 0): Promise<TopicCandidate[]> {
  try {
    const query = encodeURIComponent(domain || 'AI');
    const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${query}&page=${page}&hitsPerPage=10`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const data = await res.json() as { hits: Array<{ title: string; url: string; story_url: string; created_at: string; objectID: string }> };
    if (!data.hits) return [];

    return data.hits
      .filter(hit => hit.title && (hit.url || hit.story_url))
      .map(hit => ({
        title: hit.title,
        url: hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        summary: `Hacker News submission on ${hit.title}`,
        source: 'Hacker News',
        publishedAt: hit.created_at ? new Date(hit.created_at) : new Date()
      }));
  } catch (error) {
    console.warn('[Discovery] HackerNews fetch failed:', (error as Error).message);
    return [];
  }
}

async function fetchArxivTopics(domain: string, start: number = 0): Promise<TopicCandidate[]> {
  try {
    const searchQuery = encodeURIComponent('cat:cs.AI OR cat:cs.CR OR cat:cs.SE OR cat:cs.LG');
    const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=${start}&sortBy=submittedDate&sortOrder=descending&max_results=8`;
    const res = await fetch(url);
    if (!res.ok) return [];
    
    const xmlText = await res.text();
    const entries = xmlText.split('<entry>');
    const results: TopicCandidate[] = [];

    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i];
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);

      if (titleMatch && idMatch) {
        const title = titleMatch[1].replace(/\s+/g, ' ').trim();
        const url = idMatch[1].trim();
        const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim().slice(0, 300) : title;
        const publishedAt = publishedMatch ? new Date(publishedMatch[1]) : new Date();

        results.push({
          title,
          url,
          summary,
          source: 'arXiv CS/AI',
          publishedAt
        });
      }
    }

    return results;
  } catch (error) {
    console.warn('[Discovery] arXiv fetch failed:', (error as Error).message);
    return [];
  }
}

async function fetchRssTopics(): Promise<TopicCandidate[]> {
  const rssFeeds = [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'Ars Technica', url: 'https://feeds.feedburner.com/ArsTechnica' },
    { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml' }
  ];

  const results: TopicCandidate[] = [];

  for (const feed of rssFeeds) {
    try {
      const feedData = await parser.parseURL(feed.url);
      if (feedData.items) {
        for (const item of feedData.items.slice(0, 8)) {
          if (item.title && item.link) {
            results.push({
              title: item.title.trim(),
              url: item.link.trim(),
              summary: (item.contentSnippet || item.content || item.title).slice(0, 300).trim(),
              source: feed.name,
              publishedAt: item.isoDate ? new Date(item.isoDate) : new Date()
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[Discovery] RSS feed fetch failed for ${feed.name}:`, (err as Error).message);
    }
  }

  return results;
}
