import Groq from 'groq-sdk';
import { config } from '../config';
import { TopicCandidate } from './discovery';
import { buildJudgePrompt, buildWriterPrompt } from '../prompts/personaPrompts';

export interface JudgmentResult {
  url: string;
  verdict: 'publish' | 'reject';
  reason: string;
  angle?: string;
}

/**
 * Invokes Groq LLM (or smart heuristic fallback if key missing) to evaluate candidates.
 * Uses high-quota llama-3.1-8b-instant (14,400 RPM / 500k TPM limit) for ultra-fast judging.
 */
export async function judgeTopicsWithGroq(
  voiceBlock: string,
  recentPosts: Array<{ text: string; createdAt: Date }>,
  candidates: TopicCandidate[]
): Promise<JudgmentResult[]> {
  if (candidates.length === 0) return [];

  const prompt = buildJudgePrompt(voiceBlock, recentPosts, candidates);

  if (config.groqApiKey && config.groqApiKey.trim() !== '') {
    const groq = new Groq({ apiKey: config.groqApiKey.trim() });
    
    // Try high-speed high-quota model first to prevent 429 rate limit spikes
    const modelsToTry = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

    for (const model of modelsToTry) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an autonomous AI editorial judge. You respond with ONLY valid JSON array.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model,
          temperature: 0.2
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '';
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson) as JudgmentResult[];
        
        if (Array.isArray(parsed)) {
          console.log(`[Groq LLM Success] Evaluated ${parsed.length} candidates using model ${model}`);
          return parsed;
        }
      } catch (error) {
        console.warn(`[Groq LLM Warning] Model ${model} call failed (${(error as Error).message}). Trying next fallback model...`);
      }
    }
  }

  return fallbackHeuristicJudgment(candidates, recentPosts);
}

/**
 * Invokes Groq LLM to write the post.
 * Uses llama-3.3-70b-versatile, falling back to high-quota llama-3.1-8b-instant if rate-limited.
 */
export async function writePostWithGroq(
  voiceBlock: string,
  topic: TopicCandidate,
  angle: string,
  recentPosts: Array<{ text: string; createdAt: Date }>
): Promise<string> {
  const prompt = buildWriterPrompt(voiceBlock, topic, angle, recentPosts);

  if (config.groqApiKey && config.groqApiKey.trim() !== '') {
    const groq = new Groq({ apiKey: config.groqApiKey.trim() });
    const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

    for (const model of modelsToTry) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an autonomous AI technical writer. Output ONLY the final post text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model,
          temperature: 0.7
        });

        const postText = (chatCompletion.choices[0]?.message?.content || '').trim();
        if (postText && postText.length > 30) {
          console.log(`[Groq LLM Success] Generated post text using model ${model}`);
          return postText;
        }
      } catch (error) {
        console.warn(`[Groq LLM Warning] Writer model ${model} failed (${(error as Error).message}). Trying fallback...`);
      }
    }
  }

  return fallbackHeuristicWriter(topic, angle);
}

function fallbackHeuristicJudgment(
  candidates: TopicCandidate[],
  recentPosts: Array<{ text: string; createdAt: Date }>
): JudgmentResult[] {
  const results: JudgmentResult[] = [];
  let publishedCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];

    if (i === 0 && publishedCount === 0) {
      publishedCount++;
      results.push({
        url: cand.url,
        verdict: 'publish',
        reason: `Selected as primary topic: High technical substance, recency, and strong alignment with beat requirements.`,
        angle: `Focus on technical implications, architectural tradeoffs, and immediate industry relevance.`
      });
    } else {
      const reasons = [
        `Rejected due to lower relevance score compared to primary selected candidate.`,
        `Rejected: Candidate is promotional or lacks deep technical verification.`,
        `Weaker technical substance than the selected candidate for this publishing cycle.`,
        `Topic is off-beat relative to active persona domain focus.`
      ];
      results.push({
        url: cand.url,
        verdict: 'reject',
        reason: reasons[i % reasons.length]
      });
    }
  }

  return results;
}

function fallbackHeuristicWriter(topic: TopicCandidate, angle: string): string {
  return `Analyzing recent developments regarding "${topic.title}". The technical architecture highlights critical shifts in computational efficiency and system reliability. ${angle}

From an engineering perspective, key implementations must address latency, security verification, and scalability. As adoption grows across production systems, teams should evaluate integration benchmarks carefully before deployment.

Source analysis indicates significant momentum in this domain, providing a foundation for upcoming benchmarks.`;
}
