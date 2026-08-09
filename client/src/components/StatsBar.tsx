import React from 'react';
import { Newspaper, ShieldCheck, Brain, Rss } from 'lucide-react';

interface StatsBarProps {
  totalPosts: number;
  totalRejections: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalPosts, totalRejections }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Stat 1: Total Published Posts */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Posts Published</div>
          <div className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">{totalPosts}</div>
        </div>
      </div>

      {/* Stat 2: Rejections Evaluated */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Rejections Logged</div>
          <div className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">{totalRejections}</div>
        </div>
      </div>

      {/* Stat 3: Memory Matrix Score */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Memory Matrix Threshold</div>
          <div className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">0.70 TF-IDF</div>
        </div>
      </div>

      {/* Stat 4: Sources Monitored */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Rss className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Live Web Beats</div>
          <div className="text-lg font-extrabold font-mono text-slate-800 dark:text-slate-100">HN / arXiv / RSS</div>
        </div>
      </div>
    </div>
  );
};
