import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbCreateAgent, dbFindAgent, dbFindAllAgents, dbFindPosts, dbFindRejections } from '../db/store';
import { buildVoiceBlock } from '../prompts/personaPrompts';
import { startAgentScheduler, stopAgentScheduler, getSchedulerStatus, triggerManualTick } from '../services/scheduler';

const router = Router();

/**
 * 1. Initialize Agent
 * POST /api/agent/init
 */
router.post('/init', async (req: Request, res: Response) => {
  try {
    const { persona } = req.body;
    if (!persona || !persona.name || !persona.domain) {
      return res.status(400).json({ error: 'Invalid persona payload. Must include name and domain.' });
    }

    const agentId = uuidv4();
    const voiceRules = buildVoiceBlock(persona);

    const agent = await dbCreateAgent({
      agentId,
      name: persona.name,
      domain: persona.domain,
      voiceRules
    });

    // Start self-sustaining autonomous scheduler
    startAgentScheduler(agent.agentId);

    // Instantly generate and publish 1st post on initialization
    let firstPostResult = null;
    try {
      firstPostResult = await triggerManualTick(agent.agentId);
    } catch (err) {
      console.warn('[API /init Notice] Instant first post generation warning:', (err as Error).message);
    }

    console.log(`[API /init] Initialized Agent "${agent.name}" (${agent.domain}) with ID: ${agent.agentId}`);

    return res.status(200).json({ agentId: agent.agentId, firstPost: firstPostResult });
  } catch (error) {
    console.error('[API /init Error]', error);
    return res.status(500).json({ error: 'Failed to initialize agent: ' + (error as Error).message });
  }
});

router.get('/init', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: "GET method is not supported on /api/agent/init. Please send an HTTP POST request with JSON body: { \"persona\": { \"name\": \"Ada\", \"domain\": \"AI Security\" } }"
  });
});

/**
 * 2. Retrieve Feed
 * GET /api/agent/feed?agentId=abc-123
 */
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId query parameter is required' });
    }

    const posts = await dbFindPosts(agentId, 100);
    const rejections = await dbFindRejections(agentId, 500);

    const formattedPosts = posts.map((p, idx) => {
      const pTime = new Date(p.createdAt).getTime();
      
      // Filter rejections created within the same cycle window (+/- 90s)
      let cycleRejs = rejections.filter(r => {
        const rTime = new Date(r.createdAt).getTime();
        return Math.abs(rTime - pTime) <= 90000;
      });

      // Fallback: If cycle window didn't capture rejections (e.g. for post #1), assign nearest available rejections
      if (cycleRejs.length === 0 && rejections.length > 0) {
        if (idx === 0) {
          cycleRejs = rejections.slice(0, 4);
        }
      }

      return {
        id: p.postId,
        createdAt: new Date(p.createdAt).toISOString(),
        text: p.text,
        rationale: p.rationale,
        sources: p.sources || [],
        cycleRejections: cycleRejs.map(r => ({
          id: r.rejectionId,
          title: r.title,
          url: r.url,
          reason: r.reason,
          createdAt: new Date(r.createdAt).toISOString()
        }))
      };
    });

    return res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    console.error('[API /feed Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve feed: ' + (error as Error).message });
  }
});

/**
 * 3. Rejection Log Audit Trail
 * GET /api/agent/log?agentId=abc-123
 */
router.get('/log', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId query parameter is required' });
    }

    const rejections = await dbFindRejections(agentId, 100);

    return res.status(200).json({
      agentId,
      totalRejections: rejections.length,
      rejections: rejections.map(r => ({
        id: r.rejectionId,
        title: r.title,
        url: r.url,
        reason: r.reason,
        createdAt: new Date(r.createdAt).toISOString()
      }))
    });
  } catch (error) {
    console.error('[API /log Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve rejections log: ' + (error as Error).message });
  }
});

/**
 * 4. Get Agent Persona Configuration
 * GET /api/agent/persona?agentId=abc-123
 */
router.get('/persona', async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId as string;
    let agent;

    if (!agentId) {
      agent = await dbFindAgent();
      if (!agent) {
        return res.status(200).json({ agent: null });
      }
    } else {
      agent = await dbFindAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
    }

    const status = getSchedulerStatus(agent.agentId);
    return res.status(200).json({ agent, status });
  } catch (error) {
    console.error('[API /persona Error]', error);
    return res.status(500).json({ error: 'Failed to fetch persona: ' + (error as Error).message });
  }
});

/**
 * 5. Manual Cycle Trigger
 * POST /api/agent/trigger?agentId=abc-123
 */
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId || req.body?.agentId) as string;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    // Launch manual publishing cycle asynchronously so UI responds instantly
    triggerManualTick(agentId).catch(err => {
      console.error('[API /trigger Background Error]', err);
    });

    return res.status(202).json({ success: true, message: 'Publishing cycle initiated instantly in background.' });
  } catch (error) {
    console.error('[API /trigger Error]', error);
    return res.status(500).json({ error: 'Failed to trigger cycle: ' + (error as Error).message });
  }
});

/**
 * 6. Stop Autonomous Persona Scheduler
 * POST /api/agent/stop?agentId=abc-123
 */
router.post('/stop', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId || req.body?.agentId) as string;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    stopAgentScheduler(agentId);
    return res.status(200).json({
      success: true,
      message: `Autonomous scheduler stopped for Agent ID: ${agentId}`
    });
  } catch (error) {
    console.error('[API /stop Error]', error);
    return res.status(500).json({ error: 'Failed to stop persona: ' + (error as Error).message });
  }
});

/**
 * 7. Start Autonomous Persona Scheduler
 * POST /api/agent/start?agentId=abc-123
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const agentId = (req.query.agentId || req.body?.agentId) as string;
    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    startAgentScheduler(agentId);
    const status = getSchedulerStatus(agentId);
    return res.status(200).json({
      success: true,
      message: `Autonomous scheduler started for Agent ID: ${agentId}`,
      status
    });
  } catch (error) {
    console.error('[API /start Error]', error);
    return res.status(500).json({ error: 'Failed to start persona: ' + (error as Error).message });
  }
});

/**
 * 8. Get All Agents
 * GET /api/agent/all
 */
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const agents = await dbFindAllAgents();
    return res.status(200).json({ agents });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
