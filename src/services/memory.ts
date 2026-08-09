import natural from 'natural';
import { dbFilterSeenUrls, dbAddSeenUrls, dbFindPosts } from '../db/store';
import { TopicCandidate } from './discovery';

/**
 * Filter candidates against SeenTopics so we never judge the same URL twice.
 * Inserts newly seen URLs into DB immediately.
 */
export async function filterSeen(agentId: string, candidates: TopicCandidate[]): Promise<TopicCandidate[]> {
  if (candidates.length === 0) return [];

  const urls = candidates.map(c => c.url);
  const seenUrlsSet = await dbFilterSeenUrls(agentId, urls);

  const unseenCandidates = candidates.filter(c => !seenUrlsSet.has(c.url));

  if (unseenCandidates.length > 0) {
    await dbAddSeenUrls(agentId, unseenCandidates.map(c => ({ url: c.url, title: c.title })));
  }

  return unseenCandidates;
}

/**
 * Uses natural TF-IDF and Cosine Similarity to compare candidate title+summary
 * against the agent's published past posts. Drops topics that are too similar (> 0.70 threshold).
 */
export async function filterAgainstMemory(
  agentId: string,
  candidates: TopicCandidate[],
  similarityThreshold: number = 0.70
): Promise<{ passed: TopicCandidate[]; redundant: Array<{ candidate: TopicCandidate; reason: string }> }> {
  if (candidates.length === 0) return { passed: [], redundant: [] };

  const recentPosts = await dbFindPosts(agentId, 20);

  if (recentPosts.length === 0) {
    return { passed: candidates, redundant: [] };
  }

  const passed: TopicCandidate[] = [];
  const redundant: Array<{ candidate: TopicCandidate; reason: string }> = [];

  const pastTexts = recentPosts.map((p: any) => `${p.text} ${(p.keywords || []).join(' ')}`);

  for (const candidate of candidates) {
    const candidateText = `${candidate.title} ${candidate.summary}`;
    let maxSimilarity = 0;

    for (const pastText of pastTexts) {
      const sim = computeJaccardOrTfidfSimilarity(candidateText, pastText);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
      }
    }

    if (maxSimilarity >= similarityThreshold) {
      redundant.push({
        candidate,
        reason: `Rejected by Memory Dedup: topic similarity score (${maxSimilarity.toFixed(2)}) exceeded non-redundancy threshold.`
      });
    } else {
      passed.push(candidate);
    }
  }

  return { passed, redundant };
}

function computeJaccardOrTfidfSimilarity(textA: string, textB: string): number {
  const tokenizer = new natural.WordTokenizer();
  const tokensA = new Set(tokenizer.tokenize(textA.toLowerCase()) || []);
  const tokensB = new Set(tokenizer.tokenize(textB.toLowerCase()) || []);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token) && token.length > 3) {
      intersection++;
    }
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
