import { useState } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

export default function FileManager({ windowId: _windowId }: Props) {
  const { state, dispatch, currentTheme, openApp } = useOS();
  const [currentDir, setCurrentDir] = useState(state.currentDir || 'user');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getBreadcrumbs = () => {
    const crumbs: { id: string; name: string }[] = [];
    let current: string | null = currentDir;
    while (current) {
      const node = state.fs.find(n => n.id === current);
      if (node) {
        crumbs.unshift({ id: node.id, name: node.name });
        current = node.parentId;
      } else break;
    }
    return crumbs;
  };

  const getChildren = () => {
    return state.fs.filter(n => n.parentId === currentDir);
  };

  const handleOpen = (node: typeof state.fs[0]) => {
    if (node.type === 'folder') {
      setCurrentDir(node.id);
      dispatch({ type: 'SET_CURRENT_DIR', dirId: node.id });
    } else {
      if (node.name.endsWith('.txt') || node.name.endsWith('.md') || node.mimeType?.startsWith('text')) {
        openApp('editor', { fileId: node.id, fileName: node.name });
      } else {
        setPreviewFile(node.id);
      }
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setRenameId(id);
    setRenameValue(currentName);
  };

  const submitRename = () => {
    if (renameId && renameValue.trim()) {
      dispatch({ type: 'FS_RENAME', id: renameId, name: renameValue.trim() });
    }
    setRenameId(null);
    setRenameValue('');
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'FS_DELETE', id });
    setSelectedId(null);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    dispatch({
      type: 'FS_ADD',
      node: {
        id: `fs-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        parentId: currentDir,
        createdAt: new Date().toISOString(),
      },
    });
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const createFile = () => {
    dispatch({
      type: 'FS_ADD',
      node: {
        id: `fs-${Date.now()}`,
        name: `New File ${state.fs.length}.txt`,
        type: 'file',
        parentId: currentDir,
        content: '',
        createdAt: new Date().toISOString(),
        size: 0,
        mimeType: 'text/plain',
      },
    });
  };

  const previewNode = previewFile ? state.fs.find(n => n.id === previewFile) : null;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: currentTheme.colors.border }}>
        <div className="flex items-center gap-1">
          <button onClick={() => {
            const node = state.fs.find(n => n.id === currentDir);
            if (node?.parentId) {
              setCurrentDir(node.parentId);
              dispatch({ type: 'SET_CURRENT_DIR', dirId: node.parentId });
            }
          }} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={createFile} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New File">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </button>
          <button onClick={() => setShowNewFolder(true)} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New Folder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          </button>
        </div>

        <div className="flex-1 flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: currentTheme.colors.surface }}>
          {getBreadcrumbs().map((crumb, idx, arr) => (
            <span key={crumb.id} className="flex items-center">
              <button
                className="hover:underline opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => { setCurrentDir(crumb.id); dispatch({ type: 'SET_CURRENT_DIR', dirId: crumb.id }); }}
              >
                {crumb.name}
              </button>
              {idx < arr.length - 1 && <span className="mx-1 opacity-30">/</span>}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/15' : 'hover:bg-white/10'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/15' : 'hover:bg-white/10'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {showNewFolder && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded" style={{ background: currentTheme.colors.surface }}>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Folder name..."
              className="flex-1 px-2 py-1 rounded text-xs outline-none"
              style={{ background: currentTheme.colors.background, color: currentTheme.colors.text, border: `1px solid ${currentTheme.colors.border}` }}
              autoFocus
            />
            <button onClick={createFolder} className="px-3 py-1 rounded text-xs transition-colors" style={{ background: currentTheme.colors.primary, color: '#fff' }}>
              Create
            </button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        )}

        {previewNode ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderColor: currentTheme.colors.border }}>
              <span className="text-sm font-medium">{previewNode.name}</span>
              <button onClick={() => setPreviewFile(null)} className="p-1 rounded hover:bg-white/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.text} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-3 rounded text-xs font-mono whitespace-pre-wrap"
              style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text }}>
              {previewNode.content || '(empty file)'}
            </pre>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {getChildren().map(node => (
              <div
                key={node.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedId === node.id ? 'ring-2' : 'hover:bg-white/5'
                }`}
                style={selectedId === node.id ? { outline: `2px solid ${currentTheme.colors.primary}`, outlineOffset: '2px' } : {}}
                onClick={() => setSelectedId(node.id)}
                onDoubleClick={() => handleOpen(node)}
                onContextMenu={(e) => { e.preventDefault(); setSelectedId(node.id); }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {node.type === 'folder' ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={currentTheme.colors.warning} stroke="none">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : node.name.endsWith('.md') ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={currentTheme.colors.info} stroke="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill={currentTheme.colors.textSecondary} stroke="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                </div>
                {renameId === node.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={e => e.key === 'Enter' && submitRename()}
                    className="w-full text-center text-[10px] px-1 rounded outline-none"
                    style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-[10px] text-center truncate w-full leading-tight">{node.name}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {getChildren().map(node => (
              <div
                key={node.id}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all ${
                  selectedId === node.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                onClick={() => setSelectedId(node.id)}
                onDoubleClick={() => handleOpen(node)}
              >
                {node.type === 'folder' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={currentTheme.colors.warning} stroke="none">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={currentTheme.colors.textSecondary} stroke="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
                {renameId === node.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={e => e.key === 'Enter' && submitRename()}
                    className="flex-1 text-xs px-1 rounded outline-none"
                    style={{ background: currentTheme.colors.surface, color: currentTheme.colors.text }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-xs">{node.name}</span>
                )}
                <span className="text-[10px] opacity-40">{node.type === 'folder' ? '--' : formatSize(node.size || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar & context actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t text-[10px]" style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.textSecondary }}>
        <span>{getChildren().length} items</span>
        {selectedId && (
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const node = state.fs.find(n => n.id === selectedId);
              if (node) handleRename(selectedId, node.name);
            }} className="hover:text-white transition-colors">Rename</button>
            <button onClick={() => handleDelete(selectedId)} className="hover:text-red-400 transition-colors">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
