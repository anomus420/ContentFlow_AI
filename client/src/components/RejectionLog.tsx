import React, { useState } from 'react';
import { AlertCircle, ExternalLink, ChevronDown, ChevronUp, ShieldAlert, CheckCircle } from 'lucide-react';

export interface RejectionItem {
  id: string;
  title: string;
  url: string;
  reason: string;
  createdAt: string;
}

interface RejectionLogProps {
  rejections: RejectionItem[];
  isLoading: boolean;
}

export const RejectionLog: React.FC<RejectionLogProps> = ({ rejections, isLoading }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (isLoading && rejections.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-sm">Editorial Rejection Audit Trail</h3>
            <p className="text-xs text-slate-500 font-mono">
              Proves active, intentional editorial judgment & standard enforcement ({rejections.length} candidates evaluated)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {rejections.length} Rejections
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 max-h-96 overflow-y-auto">
          {rejections.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 font-mono">
              No rejections recorded yet. Rejections will populate as the agent evaluates raw candidate topics.
            </p>
          ) : (
            rejections.map((rej) => (
              <div
                key={rej.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-xs hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {rej.title}
                  </h4>
                  <a
                    href={rej.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-cyan-500 transition-colors shrink-0"
                    title="View candidate source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-mono bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{rej.reason}</span>
                </div>
                <div className="mt-1.5 text-[10px] text-slate-400 font-mono text-right">
                  Evaluated at {new Date(rej.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
