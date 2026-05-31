import { useState, useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';
import { APPS } from '@/store/OSContext';

interface Result {
  id: string;
  type: 'app' | 'file' | 'setting' | 'clipboard' | 'calc';
  label: string;
  sub?: string;
  icon?: string;
  action: () => void;
}

export default function SpotlightSearch() {
  const { state, dispatch, openApp, copyToClipboard } = useOS();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const close = () => dispatch({ type: 'CLOSE_SPOTLIGHT' });

  const exec = (r: Result) => { r.action(); close(); };

  const results: Result[] = (() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default suggestions
      const defaults: Result[] = [
        { id: 'calc', type: 'calc', label: 'Calculator', sub: 'Open calculator', action: () => dispatch({ type: 'TOGGLE_CALCULATOR' }) },
        { id: 'settings', type: 'app', label: 'Settings', sub: 'System preferences', icon: '⚙️', action: () => openApp('settings') },
        { id: 'terminal', type: 'app', label: 'Terminal', sub: 'Command line', icon: '⌨️', action: () => openApp('terminal') },
        { id: 'files', type: 'app', label: 'File Manager', sub: 'Browse files', icon: '📁', action: () => openApp('files') },
        { id: 'browser', type: 'app', label: 'Browser', sub: 'Web browser', icon: '🌐', action: () => openApp('browser') },
      ];
      return defaults;
    }

    const appResults: Result[] = APPS
      .filter(a => a.name.toLowerCase().includes(q))
      .map(a => ({
        id: a.id, type: 'app' as const, label: a.name, sub: a.category,
        icon: a.id === 'terminal' ? '⌨️' : a.id === 'files' ? '📁' : a.id === 'browser' ? '🌐'
          : a.id === 'settings' ? '⚙️' : a.id === 'music' ? '🎵' : a.id === 'notes' ? '📝' : '🖥️',
        action: () => openApp(a.id),
      }));

    const fileResults: Result[] = state.fs
      .filter(n => n.type === 'file' && n.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map(n => ({
        id: n.id, type: 'file' as const, label: n.name, sub: 'File',
        icon: n.name.endsWith('.md') ? '📝' : '📄',
        action: () => openApp('editor', { fileId: n.id }),
      }));

    const clipResults: Result[] = state.clipboard
      .filter(c => c.text.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({
        id: c.id, type: 'clipboard' as const,
        label: c.text.slice(0, 60) + (c.text.length > 60 ? '…' : ''),
        sub: `Copied ${new Date(c.timestamp).toLocaleTimeString()}`,
        icon: '📋',
        action: () => { copyToClipboard(c.text); },
      }));

    const calc: Result[] = ['calculator', 'calc', 'math', '+', '-', '*', '/'].some(t => q.includes(t))
      ? [{ id: 'calc', type: 'calc', label: 'Calculator', sub: 'Open calculator', icon: '🔢', action: () => dispatch({ type: 'TOGGLE_CALCULATOR' }) }]
      : [];

    return [...appResults, ...fileResults, ...clipResults, ...calc];
  })();

  useEffect(() => setSelected(0), [query]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') setSelected(s => Math.min(s + 1, results.length - 1));
    else if (e.key === 'ArrowUp') setSelected(s => Math.max(s - 1, 0));
    else if (e.key === 'Enter' && results[selected]) exec(results[selected]);
  };

  const typeColor: Record<string, string> = {
    app: '#7aa2f7', file: '#9ece6a', setting: '#e0af68', clipboard: '#bb9af7', calc: '#73daca',
  };
  const typeLabel: Record<string, string> = {
    app: 'App', file: 'File', setting: 'Setting', clipboard: 'Clipboard', calc: 'Tool',
  };

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={close} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div
        className="fixed left-1/2 top-[20%] z-[91] w-full flex flex-col items-center"
        style={{ transform: 'translateX(-50%)', maxWidth: '580px', animation: 'spotlight-enter 0.2s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Search bar */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(8, 8, 18, 0.92)',
            backdropFilter: 'blur(56px)',
            WebkitBackdropFilter: 'blur(56px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.80)',
          }}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search apps, files, clipboard…"
              className="flex-1 bg-transparent text-white text-base outline-none placeholder-white/30"
            />
            {query && (
              <button className="text-white/30 hover:text-white/60 text-sm transition-colors" onClick={() => setQuery('')}>
                ✕
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="py-2 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={r.id + r.type}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                  style={{
                    background: i === selected ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                  onClick={() => exec(r)}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span className="text-xl w-8 text-center">{r.icon || '🔎'}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-white/90 truncate">{r.label}</div>
                    {r.sub && <div className="text-[11px] text-white/40 truncate">{r.sub}</div>}
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ color: typeColor[r.type], background: `${typeColor[r.type]}18` }}
                  >
                    {typeLabel[r.type]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="py-8 text-center text-white/30 text-sm">No results for "{query}"</div>
          )}

          {!query && (
            <div className="px-4 py-3 text-center text-white/25 text-xs">
              Type to search · ↑↓ navigate · ↵ select · Esc close
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spotlight-enter {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
