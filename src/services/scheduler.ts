import { config } from '../config';
import { runPublishingCycle } from './publishing';

interface ActiveTimer {
  agentId: string;
  nextRunTime: Date;
  timerId: NodeJS.Timeout;
}

const activeSchedulers = new Map<string, ActiveTimer>();

/**
 * Starts the autonomous scheduler for a given agentId.
 * Schedules the recurring jittered 3-6 hour cycle without auto-generating an immediate post.
 */
export function startAgentScheduler(agentId: string): void {
  // If already running, cancel previous timer before restarting
  stopAgentScheduler(agentId);

  console.log(`[Scheduler] Initializing autonomous scheduler for Agent ID: ${agentId}`);

  // Directly schedule the next jittered 3-6 hour tick (no immediate post on init/startup)
  scheduleNextJitteredTick(agentId);
}

export function stopAgentScheduler(agentId: string): void {
  const existing = activeSchedulers.get(agentId);
  if (existing) {
    clearTimeout(existing.timerId);
    activeSchedulers.delete(agentId);
    console.log(`[Scheduler] Stopped scheduler for Agent ID: ${agentId}`);
  }
}

export function getSchedulerStatus(agentId: string): { isRunning: boolean; nextRunTime?: string } {
  const active = activeSchedulers.get(agentId);
  if (!active) return { isRunning: false };
  return {
    isRunning: true,
    nextRunTime: active.nextRunTime.toISOString()
  };
}

export async function triggerManualTick(agentId: string) {
  console.log(`[Scheduler] Manual trigger requested for Agent ID: ${agentId}`);
  const result = await runPublishingCycle(agentId, true);
  // Re-arm next jittered cycle after manual trigger
  scheduleNextJitteredTick(agentId);
  return result;
}

function scheduleNextJitteredTick(agentId: string): void {
  const minMs = config.cadenceMinHours * 60 * 60 * 1000;
  const maxMs = config.cadenceMaxHours * 60 * 60 * 1000;
  
  // Calculate random jitter delay between 3 and 6 hours
  const delayMs = Math.floor(minMs + Math.random() * (maxMs - minMs));
  const nextRunTime = new Date(Date.now() + delayMs);

  console.log(`[Scheduler] Next tick scheduled for Agent ${agentId} at ${nextRunTime.toISOString()} (in ${(delayMs / 3600000).toFixed(2)} hours)`);

  const timerId = setTimeout(async () => {
    try {
      console.log(`[Scheduler] Executing recurring tick for Agent ID: ${agentId}`);
      await runPublishingCycle(agentId);
    } catch (err) {
      console.error(`[Scheduler Error] Error in recurring tick for ${agentId}:`, (err as Error).message);
    } finally {
      scheduleNextJitteredTick(agentId);
    }
  }, delayMs);

  activeSchedulers.set(agentId, { agentId, nextRunTime, timerId });
}
