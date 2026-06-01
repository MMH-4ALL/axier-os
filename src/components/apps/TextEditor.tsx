import { useState, useEffect, useCallback } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

interface EditorTab {
  id: string;
  name: string;
  content: string;
  fileId?: string;
  dirty: boolean;
}

export default function TextEditor({ windowId: _windowId, data }: Props) {
  const { state, dispatch, currentTheme } = useOS();
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (data?.fileId && typeof data.fileId === 'string') {
      const file = state.fs.find(f => f.id === data.fileId);
      if (file) {
        const newTab: EditorTab = {
          id: `tab-${Date.now()}`,
          name: file.name,
          content: file.content || '',
          fileId: file.id,
          dirty: false,
        };
        setTabs([newTab]);
        setActiveTab(0);
      }
    } else if (tabs.length === 0) {
      setTabs([{ id: 'tab-1', name: 'Untitled.txt', content: '', dirty: false }]);
    }
  }, [data]);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      tabs.forEach(tab => {
        if (tab.dirty && tab.fileId) {
          dispatch({ type: 'FS_UPDATE_CONTENT', id: tab.fileId, content: tab.content });
          setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, dirty: false } : t));
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [tabs, dispatch]);

  const updateContent = (content: string) => {
    setTabs(prev => prev.map((t, i) => i === activeTab ? { ...t, content, dirty: true } : t));
  };

  const newTab = () => {
    const tab: EditorTab = { id: `tab-${Date.now()}`, name: `Untitled ${tabs.length + 1}.txt`, content: '', dirty: false };
    setTabs([...tabs, tab]);
    setActiveTab(tabs.length);
  };

  const closeTab = (idx: number) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((_, i) => i !== idx);
    setTabs(newTabs);
    if (activeTab >= idx && activeTab > 0) setActiveTab(activeTab - 1);
    if (activeTab >= newTabs.length) setActiveTab(newTabs.length - 1);
  };

  const saveFile = useCallback(() => {
    const tab = tabs[activeTab];
    if (!tab) return;

    if (tab.fileId) {
      dispatch({ type: 'FS_UPDATE_CONTENT', id: tab.fileId, content: tab.content });
      setTabs(prev => prev.map((t, i) => i === activeTab ? { ...t, dirty: false } : t));
    } else {
      // Create new file
      const newId = `fs-${Date.now()}`;
      dispatch({
        type: 'FS_ADD',
        node: {
          id: newId,
          name: tab.name,
          type: 'file',
          parentId: state.currentDir || 'user',
          content: tab.content,
          createdAt: new Date().toISOString(),
          size: new Blob([tab.content]).size,
          mimeType: 'text/plain',
        },
      });
      setTabs(prev => prev.map((t, i) => i === activeTab ? { ...t, fileId: newId, dirty: false } : t));
    }
  }, [tabs, activeTab, dispatch, state.currentDir]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveFile]);

  const active = tabs[activeTab];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b" style={{ borderColor: currentTheme.colors.border, background: currentTheme.colors.surface }}>
        <button onClick={newTab} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New File">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button onClick={saveFile} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Save (Ctrl+S)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
        </button>
        <div className="w-px h-4 mx-1" style={{ background: currentTheme.colors.border }} />
        <span className="text-[10px] opacity-40">
          {active?.dirty ? '● Modified' : 'Saved'}
        </span>
        <div className="flex-1" />
        <span className="text-[10px] opacity-40">
          {active ? `${active.content.split('\n').length} lines | ${active.content.length} chars` : ''}
        </span>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex border-b" style={{ borderColor: currentTheme.colors.border, background: currentTheme.colors.surface }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(idx)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border-r"
              style={{
                background: idx === activeTab ? currentTheme.colors.background : 'transparent',
                borderColor: currentTheme.colors.border,
                color: idx === activeTab ? currentTheme.colors.text : currentTheme.colors.textSecondary,
              }}
            >
              <span>{tab.name}{tab.dirty ? ' ●' : ''}</span>
              <span
                className="opacity-0 hover:opacity-100 ml-1 transition-opacity"
                onClick={(e) => { e.stopPropagation(); closeTab(idx); }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative">
        {active && (
          <textarea
            value={active.content}
            onChange={e => updateContent(e.target.value)}
            className="w-full h-full p-3 text-xs font-mono resize-none outline-none"
            style={{
              background: currentTheme.colors.background,
              color: currentTheme.colors.text,
              lineHeight: '1.6',
              fontFamily: "'Courier New', monospace",
            }}
            spellCheck={false}
            placeholder="Start typing..."
          />
        )}
      </div>
    </div>
  );
}
