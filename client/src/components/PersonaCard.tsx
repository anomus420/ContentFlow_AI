import React from 'react';
import { UserCheck, Shield, Sparkles, Clock, ExternalLink } from 'lucide-react';

interface PersonaCardProps {
  agent: {
    agentId: string;
    name: string;
    domain: string;
    voiceRules?: string;
    createdAt?: string;
  } | null;
  status?: { isRunning: boolean; nextRunTime?: string };
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ agent, status }) => {
  if (!agent) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center">
        <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="font-semibold text-base mb-1">No Active Persona</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Initialize a persona agent to begin autonomous topic discovery, editorial judgment, and feed generation.
        </p>
      </div>
    );
  }

  const nextRun = status?.nextRunTime
    ? new Date(status.nextRunTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Pending';

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {agent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{agent.name}</h2>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                {agent.domain}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              ID: {agent.agentId}
            </p>
          </div>
        </div>

        {/* Cadence Metrics */}
        <div className="flex items-center gap-4 bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-500" />
            <div>
              <div className="text-slate-400 text-[10px]">NEXT AUTO TICK</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{nextRun}</div>
            </div>
          </div>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-slate-400 text-[10px]">EDITORIAL MODE</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Strict Standard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Standards Summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/40">
          <span className="font-semibold block text-slate-700 dark:text-slate-300">Recency</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Live feeds under 5 days</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/40">
          <span className="font-semibold block text-slate-700 dark:text-slate-300">Relevance</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Strict domain alignment</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/40">
          <span className="font-semibold block text-slate-700 dark:text-slate-300">Substance</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">No hype or PR noise</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-700/40">
          <span className="font-semibold block text-slate-700 dark:text-slate-300">Memory Dedup</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">TF-IDF cosine similarity</span>
        </div>
      </div>
    </div>
  );
};
