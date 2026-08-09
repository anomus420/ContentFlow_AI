import React, { useState } from 'react';
import { Globe, Database, Scale, Cpu, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const PIPELINE_STEPS = [
  {
    id: 1,
    title: '1. Live Discovery Ingestion',
    icon: Globe,
    color: 'from-cyan-500 to-blue-500',
    shortDesc: 'Hits HackerNews, arXiv & Tech RSS feeds in parallel.',
    detail: 'Fetches raw breaking stories from live public APIs every cycle, extracting title, summary, URL, and published timestamps without requiring OAuth keys.'
  },
  {
    id: 2,
    title: '2. TF-IDF Memory Deduplication',
    icon: Database,
    color: 'from-blue-500 to-indigo-500',
    shortDesc: 'Calculates cosine similarity against past posts.',
    detail: 'Checks database SeenTopic collection and runs TF-IDF vector matrix matching using natural NLP to filter out duplicate or near-identical historical topics.'
  },
  {
    id: 3,
    title: '3. Groq LLM Editorial Judgment',
    icon: Scale,
    color: 'from-indigo-500 to-violet-500',
    shortDesc: 'Evaluates candidates against 5 strict standards.',
    detail: 'Evaluates up to 5 candidates against Recency, Relevance, Substance, Non-redundancy, and Credibility. Intentionally rejects candidates and records standards reasons.'
  },
  {
    id: 4,
    title: '4. Autonomous Post & Rationale',
    icon: Cpu,
    color: 'from-violet-500 to-emerald-500',
    shortDesc: 'Publishes 80-220 word technical post with rationale.',
    detail: 'Generates post text in consistent persona voice and assembles non-hallucinated rationale explaining why selected, why relevant now, and source attribution.'
  }
];

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const selectedStep = PIPELINE_STEPS.find(s => s.id === activeStep) || PIPELINE_STEPS[0];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-base tracking-tight">System Architecture & Pipeline</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            How the persona agent operates autonomously without waiting for human prompts
          </p>
        </div>

        {/* Hero Mini Banner Preview */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-100/60 dark:bg-slate-900/60 p-2 pr-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <img src="/images/ai_persona_hero.png" alt="Neural Network" className="w-10 h-10 rounded-xl object-cover" />
          <div className="text-[11px] font-mono">
            <div className="font-semibold text-cyan-600 dark:text-cyan-400">UNASSISTED ENGINE</div>
            <div className="text-slate-500 dark:text-slate-400">Self-Sustaining Loop</div>
          </div>
        </div>
      </div>

      {/* Step Tabs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {PIPELINE_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                isActive
                  ? 'border-cyan-500 bg-slate-100/80 dark:bg-slate-800/80 shadow-md ring-1 ring-cyan-500/30'
                  : 'border-slate-200/70 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && <CheckCircle2 className="w-4 h-4 text-cyan-500" />}
              </div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{step.title}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{step.shortDesc}</div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-100/80 to-slate-50/80 dark:from-slate-900/80 dark:to-slate-950/80 border border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400 mb-1 font-mono">
          <ChevronRight className="w-4 h-4" />
          <span>Detailed Architecture: {selectedStep.title}</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans pl-6">
          {selectedStep.detail}
        </p>
      </div>
    </div>
  );
};
