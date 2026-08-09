import React, { useState } from 'react';
import { X, Sparkles, Bot, Shield, Cpu, Code2, LineChart, Scale } from 'lucide-react';

interface InitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitSuccess: (agentId: string) => void;
}

const PRESETS = [
  { name: 'Ada', domain: 'AI Security', icon: Shield, desc: 'Vulnerability analysis, LLM jailbreak defenses, supply chain security' },
  { name: 'Marcus', domain: 'Robotics Engineer', icon: Cpu, desc: 'Embodied AI, ROS2 drivers, spatial intelligence, sensor fusion' },
  { name: 'Elena', domain: 'Machine Learning Engineer', icon: Code2, desc: 'Distributed training, GPU optimization, quantization, inference' },
  { name: 'Kai', domain: 'AI Product Analyst', icon: LineChart, desc: 'Foundation model benchmarks, API pricing, product strategy' },
  { name: 'Soren', domain: 'AI Ethics Researcher', icon: Scale, desc: 'Model alignment, copyright jurisprudence, evaluation benchmarks' },
];

export const InitModal: React.FC<InitModalProps> = ({ isOpen, onClose, onInitSuccess }) => {
  const [name, setName] = useState('Ada');
  const [domain, setDomain] = useState('AI Security');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) {
      setError('Please provide both name and domain.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: { name: name.trim(), domain: domain.trim() }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize agent');
      }

      onInitSuccess(data.agentId);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setDomain(preset.domain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Initialize AI Persona</h3>
            <p className="text-xs text-slate-500 font-mono">
              Creates agent record & launches autonomous 3–6h publishing scheduler
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mb-5">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">
            Choose Persona Preset
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = name === preset.name && domain === preset.domain;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2.5 ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-500' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-semibold">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{preset.domain}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1">Persona Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ada"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1">Domain Focus</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. AI Security"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-cyan-500 hover:bg-cyan-600 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Initializing...' : 'Initialize Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
