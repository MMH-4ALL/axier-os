import { useOS } from '@/store/OSContext';
import { useState } from 'react';

export default function VirtualDesktopBar() {
  const { state, dispatch } = useOS();
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addDesktop = () => {
    const id = `desktop-${Date.now()}`;
    const count = state.virtualDesktops.length + 1;
    dispatch({
      type: 'ADD_VIRTUAL_DESKTOP',
      desktop: { id, name: `Desktop ${count}`, bg: '#0a0a1a' },
    });
    dispatch({ type: 'SWITCH_DESKTOP', id });
  };

  const removeDesktop = (id: string) => {
    dispatch({ type: 'REMOVE_VIRTUAL_DESKTOP', id });
  };

  const startEdit = (id: string, name: string) => {
    setEditing(id);
    setEditName(name);
  };

  const commitEdit = (id: string) => {
    if (editName.trim()) dispatch({ type: 'RENAME_VIRTUAL_DESKTOP', id, name: editName.trim() });
    setEditing(null);
  };

  return (
    <div
      className="fixed bottom-3 left-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(8, 8, 18, 0.72)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.48)',
      }}
    >
      {state.virtualDesktops.map(d => (
        <div key={d.id} className="relative group flex items-center">
          <button
            className="w-8 h-1.5 rounded-full transition-all flex items-center justify-center"
            style={{
              background: state.activeDesktop === d.id ? '#7aa2f7' : 'rgba(255,255,255,0.20)',
              boxShadow: state.activeDesktop === d.id ? '0 0 8px rgba(122,162,247,0.6)' : 'none',
            }}
            onClick={() => dispatch({ type: 'SWITCH_DESKTOP', id: d.id })}
            title={d.name}
          />

          {/* Tooltip on hover */}
          <div className="absolute bottom-full mb-2 left-1/2 hidden group-hover:flex flex-col items-center gap-1 pointer-events-none">
            <div
              className="px-2 py-1 rounded-lg text-xs whitespace-nowrap"
              style={{
                background: 'rgba(8, 8, 18, 0.92)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.80)',
                transform: 'translateX(-50%)',
              }}
            >
              {editing === d.id ? (
                <input
                  className="bg-transparent outline-none w-16 text-xs text-center text-white"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => commitEdit(d.id)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(d.id); if (e.key === 'Escape') setEditing(null); }}
                  autoFocus
                />
              ) : d.name}
            </div>
            {/* Action buttons */}
            <div className="flex gap-1">
              <button
                className="w-5 h-5 rounded text-[8px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)' }}
                onClick={(e) => { e.stopPropagation(); startEdit(d.id, d.name); }}
              >
                ✎
              </button>
              {state.virtualDesktops.length > 1 && (
                <button
                  className="w-5 h-5 rounded text-[8px] flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.20)', color: 'rgba(239,68,68,0.8)' }}
                  onClick={(e) => { e.stopPropagation(); removeDesktop(d.id); }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add desktop */}
      <button
        className="w-5 h-5 rounded-full flex items-center justify-center ml-1 opacity-40 hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)' }}
        onClick={addDesktop}
        title="Add desktop"
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}
