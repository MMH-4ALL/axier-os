import { useState } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold mb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-sm font-semibold mb-1 mt-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xs font-semibold mb-1 mt-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code class="px-1 py-0.5 rounded text-[10px] font-mono" style="background:var(--surface-alt)">$1</code>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 text-xs">$1</li>')
    .replace(/^\[ \] (.*$)/gim, '<div class="flex items-center gap-2 ml-2"><span class="w-3 h-3 rounded border border-current opacity-40"></span><span class="text-xs">$1</span></div>')
    .replace(/^\[x\] (.*$)/gim, '<div class="flex items-center gap-2 ml-2"><span class="w-3 h-3 rounded border flex items-center justify-center text-[8px]">✓</span><span class="text-xs line-through opacity-60">$1</span></div>')
    .replace(/^\|(.+)\|$/gim, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => `<td class="px-2 py-1 text-[10px] border-b" style="border-color:var(--border)">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .replace(/\n/gim, '<br>');
}

export default function Notes({ windowId: _windowId }: Props) {
  const { state, dispatch, currentTheme } = useOS();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(state.notes[0]?.id || null);
  const [editMode, setEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const activeNote = state.notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '# New Note\n\nStart writing here...',
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTE', note: newNote });
    setActiveNoteId(newNote.id);
    setEditMode(true);
  };

  const updateNote = (updates: { title?: string; content?: string }) => {
    if (!activeNote) return;
    dispatch({
      type: 'UPDATE_NOTE',
      note: { ...activeNote, ...updates },
    });
  };

  const deleteNote = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', id });
    if (activeNoteId === id) {
      setActiveNoteId(state.notes.find(n => n.id !== id)?.id || null);
    }
  };

  return (
    <div className="w-full h-full flex" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Sidebar */}
      <div className="w-44 border-r flex flex-col" style={{ borderColor: currentTheme.colors.border, background: currentTheme.colors.surface }}>
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xs font-semibold">Notes</h3>
          <button onClick={createNote} className="p-1 rounded hover:bg-white/10 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {state.notes.length === 0 ? (
            <div className="p-3 text-[10px] text-center opacity-40">No notes yet</div>
          ) : (
            state.notes.map(note => (
              <button
                key={note.id}
                onClick={() => { setActiveNoteId(note.id); setEditMode(false); }}
                className={`w-full text-left p-3 border-b transition-colors ${
                  activeNoteId === note.id ? '' : 'hover:bg-white/5'
                }`}
                style={{
                  borderColor: currentTheme.colors.border + '40',
                  background: activeNoteId === note.id ? `${currentTheme.colors.primary}15` : 'transparent',
                }}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-xs font-medium truncate flex-1 ${activeNoteId === note.id ? '' : 'opacity-80'}`}>
                    {note.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 hover:opacity-100 group-hover:opacity-40 transition-opacity p-0.5"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
                <p className="text-[9px] opacity-40 mt-0.5 truncate">{note.content.slice(0, 60).replace(/[#*_`]/g, '')}</p>
                <span className="text-[8px] opacity-30 mt-1 block">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: currentTheme.colors.border }}>
              <input
                type="text"
                value={activeNote.title}
                onChange={e => updateNote({ title: e.target.value })}
                className="flex-1 bg-transparent outline-none text-sm font-medium mr-4"
                style={{ color: currentTheme.colors.text }}
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditMode(!editMode); setShowPreview(false); }}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all ${editMode ? 'ring-1' : 'opacity-60 hover:opacity-100'}`}
                  style={{
                    background: currentTheme.colors.surface,
                    border: `1px solid ${editMode ? currentTheme.colors.primary : currentTheme.colors.border}`,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => { setShowPreview(!showPreview); setEditMode(false); }}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all ${showPreview ? 'ring-1' : 'opacity-60 hover:opacity-100'}`}
                  style={{
                    background: currentTheme.colors.surface,
                    border: `1px solid ${showPreview ? currentTheme.colors.primary : currentTheme.colors.border}`,
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {editMode ? (
                <textarea
                  value={activeNote.content}
                  onChange={e => updateNote({ content: e.target.value })}
                  className="w-full h-full p-4 text-xs font-mono resize-none outline-none leading-relaxed"
                  style={{
                    background: currentTheme.colors.background,
                    color: currentTheme.colors.text,
                  }}
                  spellCheck={false}
                />
              ) : showPreview ? (
                <div
                  className="p-4 text-xs leading-relaxed prose-sm max-w-none"
                  style={{ color: currentTheme.colors.text }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(activeNote.content) }}
                />
              ) : (
                <div className="p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-80"
                  style={{ color: currentTheme.colors.text }}>
                  {activeNote.content}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="px-3 py-1.5 border-t text-[9px] flex items-center justify-between" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.textSecondary }}>
              <span>{activeNote.content.length} characters</span>
              <span>{activeNote.content.split('\n').length} lines</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-xs">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
