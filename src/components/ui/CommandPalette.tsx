import { useState, useEffect, useRef } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: string;
  icon: string;
  action: () => void;
}

export default function CommandPalette({ onClose }: Props) {
  const { state, dispatch, openApp } = useOS();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Apps
    { id: 'app-terminal', label: 'Open Terminal', category: 'Apps', icon: '⬛', shortcut: '⌘T', action: () => { openApp('terminal'); onClose(); } },
    { id: 'app-music', label: 'Open Music Player', category: 'Apps', icon: '🎵', shortcut: '', action: () => { openApp('music'); onClose(); } },
    { id: 'app-files', label: 'Open File Manager', category: 'Apps', icon: '📁', shortcut: '', action: () => { openApp('files'); onClose(); } },
    { id: 'app-browser', label: 'Open Browser', category: 'Apps', icon: '🌐', shortcut: '', action: () => { openApp('browser'); onClose(); } },
    { id: 'app-settings', label: 'Open Settings', category: 'Apps', icon: '⚙️', shortcut: '', action: () => { openApp('settings'); onClose(); } },
    { id: 'app-notes', label: 'Open Notes', category: 'Apps', icon: '📝', shortcut: '', action: () => { openApp('notes'); onClose(); } },
    { id: 'app-editor', label: 'Open Text Editor', category: 'Apps', icon: '📄', shortcut: '', action: () => { openApp('editor'); onClose(); } },
    { id: 'app-store', label: 'Open App Store', category: 'Apps', icon: '🛒', shortcut: '', action: () => { openApp('store'); onClose(); } },
    // Actions
    { id: 'act-calc', label: 'Toggle Calculator', category: 'Actions', icon: '🧮', shortcut: 'Alt+C', action: () => { dispatch({ type: 'TOGGLE_CALCULATOR' }); onClose(); } },
    { id: 'act-weather', label: 'Toggle Weather', category: 'Actions', icon: '🌤️', shortcut: 'Alt+W', action: () => { dispatch({ type: 'TOGGLE_WIDGET', widget: 'weather' }); onClose(); } },
    { id: 'act-desktopbar', label: 'Toggle Desktop Bar', category: 'Actions', icon: '📊', shortcut: 'Alt+D', action: () => { dispatch({ type: 'TOGGLE_WIDGET', widget: 'virtualDesktopBar' }); onClose(); } },
    { id: 'act-spotlight', label: 'Open Spotlight', category: 'Actions', icon: '🔍', shortcut: '⌘K', action: () => { dispatch({ type: 'OPEN_SPOTLIGHT' }); onClose(); } },
    { id: 'act-notif', label: 'Toggle Notifications', category: 'Actions', icon: '🔔', shortcut: 'Ctrl+N', action: () => { dispatch({ type: 'TOGGLE_NOTIFICATIONS' }); onClose(); } },
    { id: 'act-lock', label: 'Lock Screen', category: 'System', icon: '🔒', shortcut: '', action: () => { dispatch({ type: 'SET_VIEW', view: 'lock' }); onClose(); } },
    { id: 'act-refresh', label: 'Refresh Desktop', category: 'System', icon: '🔄', shortcut: '', action: () => { dispatch({ type: 'SET_VIEW', view: 'desktop' }); onClose(); } },
    { id: 'act-clearclipboard', label: 'Clear Clipboard', category: 'System', icon: '📋', shortcut: '', action: () => { dispatch({ type: 'CLEAR_CLIPBOARD' }); onClose(); } },
    // Fun
    { id: 'fun-snake', label: 'Play Snake', category: 'Fun', icon: '🐍', shortcut: '⌘⇧S', action: () => { window.dispatchEvent(new CustomEvent('axier:snake')); onClose(); } },
    { id: 'fun-emoji', label: 'Open Emoji Picker', category: 'Fun', icon: '😀', shortcut: '⌘⇧E', action: () => { window.dispatchEvent(new CustomEvent('axier:emoji-picker')); onClose(); } },
  ];

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const execute = (cmd: Command) => {
    cmd.action();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) { execute(filtered[selected]); }
  };

  const accent = state.settings.accentColor || '#7aa2f7';
  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-[560px] max-h-[420px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'rgba(20,20,30,0.98)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 py-2">
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category} className="mb-1">
              <div className="px-4 py-1 text-xs font-medium" style={{ color: accent }}>{category}</div>
              {cmds.map(cmd => {
                const idx = flatIdx++;
                return (
                  <div
                    key={cmd.id}
                    className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: selected === idx ? `${accent}22` : 'transparent',
                      color: selected === idx ? '#fff' : 'rgba(255,255,255,0.75)',
                    }}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <span className="text-base">{cmd.icon}</span>
                    <span className="flex-1 text-sm">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
