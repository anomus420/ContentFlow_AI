import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersonaCard } from './components/PersonaCard';
import { HowItWorks } from './components/HowItWorks';
import { StatsBar } from './components/StatsBar';
import { FeedList, FeedPost } from './components/FeedList';
import { InitModal } from './components/InitModal';
import { HelpModal } from './components/HelpModal';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeAgent, setActiveAgent] = useState<{
    agentId: string;
    name: string;
    domain: string;
    voiceRules?: string;
  } | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<{ isRunning: boolean; nextRunTime?: string }>({ isRunning: false });
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [totalRejectionsCount, setTotalRejectionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [isInitModalOpen, setIsInitModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [allAgents, setAllAgents] = useState<Array<{ agentId: string; name: string; domain: string }>>([]);

  // Sync Dark/Light theme class on root HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load existing agent or initialize default on mount
  useEffect(() => {
    fetchActivePersona();
    fetchAllAgents();
  }, []);

  // Poll feed every 8 seconds
  useEffect(() => {
    if (!activeAgent?.agentId) return;

    fetchFeed(activeAgent.agentId);
    fetchRejectionsLog(activeAgent.agentId);

    const interval = setInterval(() => {
      fetchFeed(activeAgent.agentId);
      fetchRejectionsLog(activeAgent.agentId);
      fetchStatus(activeAgent.agentId);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeAgent?.agentId]);

  const fetchActivePersona = async (agentId?: string) => {
    try {
      setIsLoading(true);
      const url = agentId ? `/api/agent/persona?agentId=${agentId}` : '/api/agent/persona';
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.agent) {
        setActiveAgent(data.agent);
        if (data.status) setSchedulerStatus(data.status);
        fetchFeed(data.agent.agentId);
        fetchRejectionsLog(data.agent.agentId);
      }
    } catch (err) {
      console.error('Error fetching persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAgents = async () => {
    try {
      const res = await fetch('/api/agent/all');
      const data = await res.json();
      if (res.ok && data.agents) {
        setAllAgents(data.agents);
      }
    } catch (err) {
      console.error('Error fetching agents list:', err);
    }
  };

  const fetchFeed = async (agentId: string): Promise<FeedPost[]> => {
    try {
      const res = await fetch(`/api/agent/feed?agentId=${agentId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
        return data.posts;
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    }
    return [];
  };

  const fetchRejectionsLog = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agent/log?agentId=${agentId}`);
      const data = await res.json();
      if (res.ok && typeof data.totalRejections === 'number') {
        setTotalRejectionsCount(data.totalRejections);
      }
    } catch (err) {
      console.error('Error fetching rejections log:', err);
    }
  };

  const fetchStatus = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agent/persona?agentId=${agentId}`);
      const data = await res.json();
      if (res.ok && data.status) {
        setSchedulerStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const handleTriggerCycle = async () => {
    if (!activeAgent?.agentId || isTriggering) return;
    setIsTriggering(true);
    const initialPostCount = posts.length;

    try {
      // 1. Instant HTTP 202 Accepted response from server (20ms)
      await fetch(`/api/agent/trigger?agentId=${activeAgent.agentId}`, { method: 'POST' });
      
      // 2. Fast 1.2s poller to detect new post as soon as background generation completes
      let pollAttempts = 0;
      const fastPoller = setInterval(async () => {
        pollAttempts++;
        const currentPosts = await fetchFeed(activeAgent.agentId);
        await fetchRejectionsLog(activeAgent.agentId);
        await fetchStatus(activeAgent.agentId);

        if (currentPosts.length > initialPostCount || pollAttempts >= 6) {
          clearInterval(fastPoller);
          setIsTriggering(false);
        }
      }, 1200);
    } catch (err) {
      console.error('Trigger cycle failed:', err);
      setIsTriggering(false);
    }
  };

  const handleToggleStopPersona = async () => {
    if (!activeAgent?.agentId) return;

    try {
      const endpoint = schedulerStatus.isRunning ? '/api/agent/stop' : '/api/agent/start';
      await fetch(`${endpoint}?agentId=${activeAgent.agentId}`, { method: 'POST' });
      await fetchStatus(activeAgent.agentId);
    } catch (err) {
      console.error('Error toggling persona state:', err);
    }
  };

  const handleInitSuccess = async (agentId: string) => {
    setIsTriggering(true);
    await fetchActivePersona(agentId);
    await fetchAllAgents();

    // Fast poll to catch instant 1st post generated on initialization
    let attempts = 0;
    const poller = setInterval(async () => {
      attempts++;
      const currentPosts = await fetchFeed(agentId);
      await fetchRejectionsLog(agentId);
      await fetchStatus(agentId);

      if (currentPosts.length > 0 || attempts >= 5) {
        clearInterval(poller);
        setIsTriggering(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20 selection:bg-cyan-500 selection:text-white">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeAgent={activeAgent}
        schedulerStatus={schedulerStatus}
        onOpenInitModal={() => setIsInitModalOpen(true)}
        onTriggerCycle={handleTriggerCycle}
        onToggleStopPersona={handleToggleStopPersona}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        isTriggering={isTriggering}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-0 space-y-8">
        {/* Dynamic Light/Dark Banner Image */}
        <div className="w-[100%] mx-auto mb-4 mt-3 flex justify-center items-center">
          <img
            src="/images/contentflow_banner.png"
            alt="ContentFlow AI Light Banner"
            className="w-full h-auto dark:hidden"
          />
          <img
            src="/images/contentflow_banner_dark.png"
            alt="ContentFlow AI Dark Banner"
            className="w-full h-auto hidden dark:block"
          />
        </div>

        {/* Agent Switcher Bar (if multiple agents exist) */}
        {allAgents.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 font-mono text-xs">
            <span className="text-slate-400 font-semibold shrink-0">SELECT PERSONA:</span>
            {allAgents.map((ag) => (
              <button
                key={ag.agentId}
                onClick={() => fetchActivePersona(ag.agentId)}
                className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 font-medium ${
                  activeAgent?.agentId === ag.agentId
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {ag.name} ({ag.domain})
              </button>
            ))}
          </div>
        )}

        {/* Persona Identity Card */}
        <PersonaCard agent={activeAgent} status={schedulerStatus} />

        {/* Live Metrics Dashboard Bar */}
        <StatsBar totalPosts={posts.length} totalRejections={totalRejectionsCount} />

        {/* Interactive How It Works Pipeline Widget */}
        <HowItWorks />

        {/* Unified Published Feed (with Embedded Cycle Rejections inside each post card) */}
        <FeedList posts={posts} isLoading={isLoading} />
      </main>

      {/* Init Persona Modal */}
      <InitModal
        isOpen={isInitModalOpen}
        onClose={() => setIsInitModalOpen(false)}
        onInitSuccess={handleInitSuccess}
      />

      {/* Help & API Reference Guide Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        activeAgentId={activeAgent?.agentId}
      />
    </div>
  );
}

export default App;
