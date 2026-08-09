import React from 'react';
import { Bot, Sun, Moon, PlusCircle, RefreshCw, Zap, Square, Play, HelpCircle } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeAgent: { agentId: string; name: string; domain: string } | null;
  schedulerStatus: { isRunning: boolean; nextRunTime?: string };
  onOpenInitModal: () => void;
  onTriggerCycle: () => void;
  onToggleStopPersona: () => void;
  onOpenHelpModal: () => void;
  isTriggering: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeAgent,
  schedulerStatus,
  onOpenInitModal,
  onTriggerCycle,
  onToggleStopPersona,
  onOpenHelpModal,
  isTriggering
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-500/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight gradient-text">
                ContentFlow AI Creator
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              Unassisted Technology & AI Persona Agent Feed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Trigger Immediate Cycle Button */}
          {activeAgent && (
            <button
              onClick={onTriggerCycle}
              disabled={isTriggering}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 active:scale-95 text-white shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
              title="Force trigger immediate publishing cycle"
            >
              {isTriggering ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isTriggering ? 'Generating Post...' : 'Run Cycle Now'}</span>
            </button>
          )}

          {/* Stop / Start Autonomous Persona Button */}
          {activeAgent && (
            <button
              onClick={onToggleStopPersona}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all shadow-sm ${
                schedulerStatus.isRunning
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
              title={schedulerStatus.isRunning ? 'Stop background autonomous post generation' : 'Start background autonomous scheduler'}
            >
              {schedulerStatus.isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>Stop Persona</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                  <span>Start Persona</span>
                </>
              )}
            </button>
          )}

          {/* Initialize Agent Button */}
          <button
            onClick={onOpenInitModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Init Persona</span>
          </button>

          {/* API Help & User Guide Button */}
          <button
            onClick={onOpenHelpModal}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors shadow-sm"
            title="Open User Guide & API Reference"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60 transition-colors shadow-sm"
            aria-label="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
