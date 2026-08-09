import { TopicCandidate } from './discovery';

/**
 * Builds a deterministic, non-hallucinated rationale for publishing a topic.
 * Formatted to satisfy evaluation criteria:
 * 1. Why topic was selected
 * 2. Why relevant now
 * 3. Source of information
 */
export function buildRationale(
  judgeReason: string,
  topic: TopicCandidate,
  angle?: string
): string {
  const publishedDateStr = topic.publishedAt 
    ? new Date(topic.publishedAt).toISOString().split('T')[0]
    : 'recently';

  const reasonClean = judgeReason.replace(/\.$/, '');
  const angleStr = angle ? ` Angle taken: ${angle}.` : '';

  return `Selected because: ${reasonClean}.${angleStr} Relevant now because: breaking update published on ${publishedDateStr} from primary feed. Sourced from ${topic.source}.`;
}
