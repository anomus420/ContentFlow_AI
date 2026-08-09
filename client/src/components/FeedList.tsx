import React, { useState } from 'react';
import { Newspaper, ExternalLink, Calendar, Info, CheckCircle2, ShieldAlert, AlertCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react';

export interface CycleRejection {
  id: string;
  title: string;
  url: string;
  reason: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
  cycleRejections?: CycleRejection[];
}

interface FeedListProps {
  posts: FeedPost[];
  isLoading: boolean;
}

export const FeedList: React.FC<FeedListProps> = ({ posts, isLoading }) => {
  // Map tracking open/close state of embedded cycle rejections per post card
  const [expandedRejections, setExpandedRejections] = useState<Record<string, boolean>>({});

  const toggleRejections = (postId: string) => {
    setExpandedRejections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass-panel p-10 rounded-3xl text-center border border-slate-200/80 dark:border-slate-800/80">
        <Newspaper className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold mb-1">No Posts Published Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          The autonomous persona agent evaluates live feeds on a 3–6 hour schedule. Click <b>"Run Cycle Now"</b> to trigger an immediate publishing tick.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyan-500" />
          <span>Published Feed & Cycle Evaluation Logs</span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold">
            {posts.length} Entry{posts.length === 1 ? '' : 's'}
          </span>
        </h3>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">Reverse Chronological Order</span>
      </div>

      <div className="space-y-6">
        {posts.map((post, postIdx) => {
          const rejections = post.cycleRejections || [];
          const isRejsExpanded = expandedRejections[post.id] ?? true; // Default open for first post

          return (
            <article
              key={post.id}
              className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition-all shadow-xl overflow-hidden group"
            >
              <div className="p-6">
                {/* Header / Timestamp / Memory Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                      {post.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-purple-500 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                      <Brain className="w-3.5 h-3.5" />
                      Memory Verified
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Published
                    </span>
                  </div>
                </div>

                {/* Main Technical Post Body */}
                <div className="text-base sm:text-lg leading-relaxed text-slate-900 dark:text-slate-100 mb-6 font-normal whitespace-pre-line">
                  {post.text}
                </div>

                {/* Publishing Rationale & Sources Callout Box */}
                <div className="p-4.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-700 dark:text-cyan-400 mb-2 font-mono">
                    <Info className="w-4 h-4" />
                    <span>Publishing Rationale & Selection Standards</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {post.rationale}
                  </p>

                  {/* Sources Array */}
                  {post.sources && post.sources.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">PRIMARY SOURCE:</span>
                      {post.sources.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-md border border-cyan-500/20 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* INTEGRATED CYCLE REJECTIONS SECTION (Embedded inside the exact same card at the bottom) */}
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/50">
                <button
                  onClick={() => toggleRejections(post.id)}
                  className="w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 font-mono">
                      Cycle Editorial Rejections ({rejections.length} Candidate{rejections.length === 1 ? '' : 's'} Evaluated & Standards Enforced)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {rejections.length} Rejected
                    </span>
                    {isRejsExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isRejsExpanded && (
                  <div className="px-6 pb-6 pt-1 space-y-3">
                    {rejections.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono py-2">
                        All alternative candidates in this evaluation cycle met secondary standards.
                      </p>
                    ) : (
                      rejections.map((rej) => (
                        <div
                          key={rej.id}
                          className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-xs hover:border-amber-500/30 transition-all shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
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
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-mono bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{rej.reason}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
