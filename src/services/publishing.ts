import { v4 as uuidv4 } from 'uuid';
import { dbFindAgent, dbFindPosts, dbCreatePost, dbCreateRejection } from '../db/store';
import { discoverTopics } from './discovery';
import { filterSeen, filterAgainstMemory } from './memory';
import { judgeTopicsWithGroq, writePostWithGroq } from './groq';
import { buildRationale } from './rationale';
import { config } from '../config';

export async function runPublishingCycle(agentId: string, isForce: boolean = false): Promise<{
  publishedPostId?: string;
  topicTitle?: string;
  rejectionsCount: number;
  message: string;
}> {
  const isFastTestMode = config.cadenceMinHours < 0.1;
  console.log(`[Publishing Cycle] Starting autonomous cycle (isForce: ${isForce}, isFastTestMode: ${isFastTestMode}) for Agent ID: ${agentId}`);

  const agent = await dbFindAgent(agentId);
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  // 1. Discover candidates from live sources (HN, arXiv, RSS)
  const rawCandidates = await discoverTopics(agent.domain, isForce || isFastTestMode);
  console.log(`[Publishing Cycle] Discovered ${rawCandidates.length} raw candidates`);

  if (rawCandidates.length === 0) {
    return { rejectionsCount: 0, message: 'No raw candidates found during discovery phase.' };
  }

  // 2. Filter already seen URLs
  let unseenCandidates = await filterSeen(agentId, rawCandidates);
  console.log(`[Publishing Cycle] ${unseenCandidates.length} candidates after filtering seen URLs`);

  // If force trigger or fast test cadence mode (< 0.1h), bypass seen restriction
  if (unseenCandidates.length === 0 && (isForce || isFastTestMode)) {
    console.log(`[Publishing Cycle] Force/FastTest mode active: using raw candidates for post generation`);
    unseenCandidates = rawCandidates;
  } else if (unseenCandidates.length === 0) {
    return { rejectionsCount: 0, message: 'All discovered candidates were already seen in past cycles.' };
  }

  // 3. Filter memory deduplication
  let { passed: memoryPassedCandidates, redundant: memoryRedundant } = await filterAgainstMemory(agentId, unseenCandidates);
  
  for (const item of memoryRedundant) {
    await dbCreateRejection({
      rejectionId: uuidv4(),
      agentId,
      title: item.candidate.title,
      url: item.candidate.url,
      reason: item.reason
    });
  }

  console.log(`[Publishing Cycle] ${memoryPassedCandidates.length} candidates passed memory deduplication`);

  if (memoryPassedCandidates.length === 0 && (isForce || isFastTestMode)) {
    console.log(`[Publishing Cycle] Force/FastTest mode active: bypassing memory deduplication to publish post`);
    memoryPassedCandidates = unseenCandidates;
  } else if (memoryPassedCandidates.length === 0) {
    return {
      rejectionsCount: memoryRedundant.length,
      message: 'All unseen candidates were rejected by memory deduplication filter.'
    };
  }

  // 4. Fetch last 3 published posts for continuity context
  const recentPosts = await dbFindPosts(agentId, 3);
  const recentPostsFormatted = recentPosts.map((p: any) => ({
    text: p.text,
    createdAt: new Date(p.createdAt)
  }));

  // 5. LLM Editorial Judgment Call (using Groq LLM)
  const topCandidatesForJudge = memoryPassedCandidates.slice(0, 5);
  const judgments = await judgeTopicsWithGroq(
    agent.voiceRules,
    recentPostsFormatted,
    topCandidatesForJudge
  );

  let selectedCandidateTopic = topCandidatesForJudge.find(c => {
    const verdictObj = judgments.find(j => j.url === c.url);
    return verdictObj && verdictObj.verdict === 'publish';
  });

  let selectedJudgment = selectedCandidateTopic
    ? judgments.find(j => j.url === selectedCandidateTopic!.url)
    : undefined;

  // On force trigger or fast test mode, ensure at least 1 candidate is selected to guarantee a post is published!
  if (!selectedCandidateTopic && (isForce || isFastTestMode) && topCandidatesForJudge.length > 0) {
    selectedCandidateTopic = topCandidatesForJudge[0];
    selectedJudgment = {
      url: selectedCandidateTopic.url,
      verdict: 'publish',
      reason: `Automated test cadence active: Selected primary technical candidate for immediate publishing.`,
      angle: `Analyze immediate engineering implications, system design tradeoffs, and technical benchmarks.`
    };
  }

  let publishedPostId: string | undefined = undefined;
  let rejectionsCount = memoryRedundant.length;

  for (const cand of topCandidatesForJudge) {
    const judgeRes = judgments.find(j => j.url === cand.url);
    if (!selectedCandidateTopic || cand.url !== selectedCandidateTopic.url) {
      const reason = judgeRes ? judgeRes.reason : 'Weaker technical substance than selected candidate for this cycle.';
      await dbCreateRejection({
        rejectionId: uuidv4(),
        agentId,
        title: cand.title,
        url: cand.url,
        reason
      });
      rejectionsCount++;
    }
  }

  // 6. If a topic was selected to publish -> write post via Groq LLM and save
  if (selectedCandidateTopic && selectedJudgment) {
    const angle = selectedJudgment.angle || 'Focus on technical impact and engineering implications.';
    
    const postText = await writePostWithGroq(
      agent.voiceRules,
      selectedCandidateTopic,
      angle,
      recentPostsFormatted
    );

    const rationale = buildRationale(selectedJudgment.reason, selectedCandidateTopic, angle);

    const keywords = Array.from(new Set(selectedCandidateTopic.title.toLowerCase().split(/\s+/)))
      .filter(w => w.length > 3);

    const postDoc = await dbCreatePost({
      postId: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentId,
      text: postText,
      rationale,
      sources: [selectedCandidateTopic.url],
      keywords
    });

    publishedPostId = postDoc.postId;
    console.log(`[Publishing Cycle] Successfully published post ID ${publishedPostId} (isForce: ${isForce}, isFastTestMode: ${isFastTestMode})`);

    return {
      publishedPostId,
      topicTitle: selectedCandidateTopic.title,
      rejectionsCount,
      message: `Successfully published new post on "${selectedCandidateTopic.title}".`
    };
  } else {
    console.log(`[Publishing Cycle] Editorial judgment rejected all candidate topics for this cycle.`);
    return {
      rejectionsCount,
      message: 'Editorial judgment intentionally rejected all candidates for this cycle to maintain standards.'
    };
  }
}
