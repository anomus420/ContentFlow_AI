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
 * Fires an initial fast tick after ~5 seconds, then sets up a jittered 3-6 hour recurring cycle.
 */
export function startAgentScheduler(agentId: string): void {
  // If already running, cancel previous timer before restarting
  stopAgentScheduler(agentId);

  console.log(`[Scheduler] Initializing autonomous scheduler for Agent ID: ${agentId}`);

  // Schedule fast initial tick (5 seconds)
  const initialDelayMs = 5000;
  const nextRunTime = new Date(Date.now() + initialDelayMs);

  const timerId = setTimeout(async () => {
    try {
      console.log(`[Scheduler] Executing initial fast tick for Agent ID: ${agentId}`);
      await runPublishingCycle(agentId);
    } catch (err) {
      console.error(`[Scheduler Error] Error in initial tick for ${agentId}:`, (err as Error).message);
    } finally {
      // Re-arm with 3-6 hour jittered interval
      scheduleNextJitteredTick(agentId);
    }
  }, initialDelayMs);

  activeSchedulers.set(agentId, { agentId, nextRunTime, timerId });
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
