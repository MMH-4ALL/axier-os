import React, { useState } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

interface Page {
  url: string;
  title: string;
  content: React.ReactNode;
}

function getPage(url: string, theme: { colors: Record<string, string>; isDark: boolean }): Page {
  const t = theme;

  switch (url) {
    case 'axier://welcome':
    case 'axier://':
      return {
        url: 'axier://welcome',
        title: 'Welcome to Axier OS',
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})` }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: t.colors.text }}>Welcome to Axier OS</h1>
            <p className="text-sm max-w-md mb-8 leading-relaxed" style={{ color: t.colors.textSecondary }}>
              A minimal, futuristic web-based operating system. Experience the power of a terminal-centric 
              interface combined with modern desktop capabilities.
            </p>
            <div className="flex gap-3">
              <button onClick={() => {}} className="px-5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all hover:scale-105"
                style={{ borderColor: t.colors.text, color: t.colors.text }}>
                System Manual
              </button>
              <button onClick={() => {}} className="px-5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all hover:scale-105"
                style={{ borderColor: t.colors.primary, color: t.colors.primary }}>
                Explore Terminal
              </button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: t.colors.primary }}>8</div>
                <div className="text-[10px] mt-1" style={{ color: t.colors.textSecondary }}>Built-in Apps</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: t.colors.primary }}>5</div>
                <div className="text-[10px] mt-1" style={{ color: t.colors.textSecondary }}>Themes</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: t.colors.primary }}>20+</div>
                <div className="text-[10px] mt-1" style={{ color: t.colors.textSecondary }}>Terminal Commands</div>
              </div>
            </div>
          </div>
        ),
      };

    case 'axier://about':
      return {
        url: 'axier://about',
        title: 'About Axier OS',
        content: (
          <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4" style={{ color: t.colors.text }}>About Axier OS</h1>
            <div className="space-y-3 text-xs leading-relaxed" style={{ color: t.colors.textSecondary }}>
              <p>Axier OS is a fully functional, Linux-inspired web operating system built entirely with HTML, CSS, and JavaScript.</p>
              <p>It features a complete desktop environment with draggable windows, a virtual filesystem, a terminal emulator with 20+ commands, multiple themes, and 8 built-in applications.</p>
              <div className="rounded-lg p-4 mt-4" style={{ background: t.colors.surface }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: t.colors.text }}>System Details</h3>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Version</span><span style={{ color: t.colors.text }}>1.0.0</span></div>
                  <div className="flex justify-between"><span>Build</span><span style={{ color: t.colors.text }}>2024.06.01</span></div>
                  <div className="flex justify-between"><span>Platform</span><span style={{ color: t.colors.text }}>Web / Browser</span></div>
                  <div className="flex justify-between"><span>License</span><span style={{ color: t.colors.text }}>MIT</span></div>
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: t.colors.surface }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: t.colors.text }}>Credits</h3>
                <p>Built with React, Tailwind CSS, and TypeScript. Inspired by Linux, macOS, and the cyberpunk aesthetic.</p>
              </div>
            </div>
          </div>
        ),
      };

    case 'axier://search':
      return {
        url: 'axier://search',
        title: 'Axier Search',
        content: (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h1 className="text-3xl font-bold mb-6" style={{ color: t.colors.text }}>Axier Search</h1>
            <div className="w-full max-w-md relative">
              <input
                type="text"
                placeholder="Search the local system..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: t.colors.surface, color: t.colors.text, border: `1px solid ${t.colors.border}` }}
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.colors.textSecondary} strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-xs mt-4" style={{ color: t.colors.textSecondary }}>Search is simulated. No actual network requests are made.</p>
          </div>
        ),
      };

    default:
      return {
        url,
        title: '404 - Page Not Found',
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl font-bold mb-4 opacity-20">404</div>
            <h1 className="text-lg font-medium mb-2" style={{ color: t.colors.text }}>Page Not Found</h1>
            <p className="text-xs" style={{ color: t.colors.textSecondary }}>
              The page &quot;{url}&quot; does not exist on this system.
            </p>
            <p className="text-xs mt-2" style={{ color: t.colors.textSecondary }}>
              Try navigating to axier://welcome
            </p>
          </div>
        ),
      };
  }
}

export default function Browser({ windowId: _windowId, data }: Props) {
  const { currentTheme } = useOS();
  const [url, setUrl] = useState((data?.url as string) || 'axier://welcome');
  const [inputUrl, setInputUrl] = useState(url);
  const [history, setHistory] = useState<string[]>([url]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const page = getPage(url, currentTheme);

  const navigate = (newUrl: string) => {
    setUrl(newUrl);
    setInputUrl(newUrl);
    const newHistory = [...history.slice(0, historyIdx + 1), newUrl];
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = inputUrl.trim();
    if (!target) return;
    if (!target.includes('://') && !target.startsWith('/')) {
      target = 'axier://search?q=' + encodeURIComponent(target);
    }
    navigate(target);
  };

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background }}>
      {/* Address Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: currentTheme.colors.border, background: currentTheme.colors.surface }}>
        <button onClick={goBack} className="p-1 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button onClick={goForward} className="p-1 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>
        <button onClick={() => navigate(url)} className="p-1 rounded hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
        </button>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            className="w-full px-3 py-1.5 rounded text-xs outline-none"
            style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1px solid ${currentTheme.colors.border}` }}
          />
        </form>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto" style={{ color: currentTheme.colors.text }}>
        {page.content}
      </div>
    </div>
  );
}
