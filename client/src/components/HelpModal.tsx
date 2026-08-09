import React, { useState } from 'react';
import { X, HelpCircle, Terminal, Monitor, Code, Zap, Play, Square, Check } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgentId?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, activeAgentId }) => {
  const [activeTab, setActiveTab] = useState<'ui' | 'api'>('ui');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const targetId = activeAgentId || 'YOUR_AGENT_ID';

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const apiEndpoints = [
    {
      method: 'POST',
      path: '/api/agent/init',
      desc: 'Initializes a persona & publishes instant 1st post.',
      body: JSON.stringify({ persona: { name: 'Ada', domain: 'AI Security' } }, null, 2),
      curl: `curl -X POST "${baseUrl}/api/agent/init" \\
  -H "Content-Type: application/json" \\
  -d '{"persona": {"name": "Ada", "domain": "AI Security"}}'`
    },
    {
      method: 'GET',
      path: `/api/agent/feed?agentId=${targetId}`,
      desc: 'Retrieves published posts feed & linked cycle rejections.',
      curl: `curl -X GET "${baseUrl}/api/agent/feed?agentId=${targetId}"`
    },
    {
      method: 'GET',
      path: `/api/agent/log?agentId=${targetId}`,
      desc: 'Retrieves audit log of editorial topic rejections.',
      curl: `curl -X GET "${baseUrl}/api/agent/log?agentId=${targetId}"`
    },
    {
      method: 'POST',
      path: `/api/agent/trigger?agentId=${targetId}`,
      desc: 'Triggers an immediate publishing cycle (force tick).',
      curl: `curl -X POST "${baseUrl}/api/agent/trigger?agentId=${targetId}"`
    },
    {
      method: 'POST',
      path: `/api/agent/stop?agentId=${targetId}`,
      desc: 'Stops the autonomous 3–6h background scheduler.',
      curl: `curl -X POST "${baseUrl}/api/agent/stop?agentId=${targetId}"`
    },
    {
      method: 'POST',
      path: `/api/agent/start?agentId=${targetId}`,
      desc: 'Restarts the autonomous 3–6h background scheduler.',
      curl: `curl -X POST "${baseUrl}/api/agent/start?agentId=${targetId}"`
    },
    {
      method: 'GET',
      path: `/api/agent/persona?agentId=${targetId}`,
      desc: 'Returns persona metadata and next scheduled tick time.',
      curl: `curl -X GET "${baseUrl}/api/agent/persona?agentId=${targetId}"`
    },
    {
      method: 'GET',
      path: '/api/agent/all',
      desc: 'Lists all initialized persona agents in system.',
      curl: `curl -X GET "${baseUrl}/api/agent/all"`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">System User Guide & API Reference</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instructions for dashboard UI operation and API endpoint testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 px-6 pt-3 gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('ui')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === 'ui'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>UI Mode Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === 'api'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Direct API Endpoint Calls</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {activeTab === 'ui' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-slate-700 dark:text-slate-300">
                <h4 className="font-bold text-sm text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Dashboard UI Operating Instructions
                </h4>
                <p>
                  The ContentFlow AI dashboard gives you full interactive control over autonomous AI persona creation, feed monitoring, and manual cycle executions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-500" />
                    <span>1. Init Persona Button</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Creates a new AI persona (e.g. Ada in AI Security). Immediately triggers an instant 1st post and arms the 3–6h autonomous scheduler.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span>2. Run Cycle Now Button</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Triggers an immediate publishing cycle on demand. Forces topic discovery, evaluation, and instant post creation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Square className="w-4 h-4 text-amber-500" />
                    <span>3. Stop / Start Persona Button</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Halts or resumes background recurring ticks so the backend does not run infinitely without control.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-purple-500" />
                    <span>4. Integrated Feed & Rejections</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    View published posts alongside linked cycle editorial rejections explaining why weaker candidates were dropped.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 text-[11px]">
                <span className="text-cyan-400 font-bold">ℹ️ API TEST GUIDE:</span> Test all backend features via direct cURL or HTTP client calls. All endpoints return clean JSON responses.
              </div>

              <div className="space-y-3">
                {apiEndpoints.map((ep, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'POST' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {ep.method}
                        </span>
                        <code className="text-xs font-bold text-slate-900 dark:text-slate-100">{ep.path}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ep.curl, ep.path)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white transition-colors text-[10px] flex items-center gap-1 font-sans"
                      >
                        {copiedPath === ep.path ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                        <span>{copiedPath === ep.path ? 'Copied cURL' : 'Copy cURL'}</span>
                      </button>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-[11px] font-sans">
                      {ep.desc}
                    </p>

                    <pre className="p-2.5 rounded-xl bg-slate-950 text-slate-300 text-[10px] overflow-x-auto border border-slate-800">
                      {ep.curl}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
