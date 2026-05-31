import { useState, useRef, useCallback, useEffect } from 'react';
import { useOS } from '@/store/OSContext';
import type { WindowState } from '@/types';
import Terminal from './apps/Terminal';
import FileManager from './apps/FileManager';
import Browser from './apps/Browser';
import Settings from './apps/Settings';
import TextEditor from './apps/TextEditor';
import AppStore from './apps/AppStore';
import MusicPlayer from './apps/MusicPlayer';
import Notes from './apps/Notes';

interface Props {
  window: WindowState;
}

interface ContextMenu {
  x: number;
  y: number;
}

export default function WindowComponent({ window: win }: Props) {
  const { dispatch, closeWindow, focusWindow, currentTheme, apps, openApp } = useOS();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const app = apps.find(a => a.id === win.appId);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-titlebar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - win.position.x,
        y: e.clientY - win.position.y,
      });
    }
    focusWindow(win.id);
  }, [win.position, win.id, focusWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('mousedown', closeContextMenu);
      return () => document.removeEventListener('mousedown', closeContextMenu);
    }
  }, [contextMenu, closeContextMenu]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const SNAP_THRESHOLD = 40;
        const topBarH = 28;
        const ww = window.innerWidth;
        const wh = window.innerHeight;
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Snap to edges
        if (newX < SNAP_THRESHOLD && newX > -10) {
          dispatch({ type: 'SNAP_WINDOW', windowId: win.id, edge: 'left' });
          setIsDragging(false);
          return;
        }
        if (newX + win.size.width > ww - SNAP_THRESHOLD && newX + win.size.width < ww + 10) {
          dispatch({ type: 'SNAP_WINDOW', windowId: win.id, edge: 'right' });
          setIsDragging(false);
          return;
        }
        if (newY < SNAP_THRESHOLD) {
          dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id });
          setIsDragging(false);
          return;
        }

        const clampedX = Math.max(0, Math.min(newX, ww - win.size.width));
        const clampedY = Math.max(topBarH, Math.min(newY, wh - 10));
        dispatch({ type: 'MOVE_WINDOW', windowId: win.id, position: { x: clampedX, y: clampedY } });
      }
      if (isResizing) {
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          const newW = Math.max((app?.minSize.width || 300), e.clientX - rect.left);
          const newH = Math.max((app?.minSize.height || 200), e.clientY - rect.top);
          dispatch({ type: 'RESIZE_WINDOW', windowId: win.id, size: { width: newW, height: newH } });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, win.id, win.size, dispatch, app]);

  if (win.isMinimized) return null;

  const windowStyle = win.isMaximized
    ? { top: 28, left: 0, width: '100%', height: 'calc(100% - 28px)', zIndex: win.zIndex }
    : { top: win.position.y, left: win.position.x, width: win.size.width, height: win.size.height, zIndex: win.zIndex };

  const titleBarBg = win.isFocused
    ? currentTheme.colors.surface
    : currentTheme.colors.surfaceAlt;

  const renderApp = () => {
    switch (win.appId) {
      case 'terminal': return <Terminal windowId={win.id} data={win.data} />;
      case 'files': return <FileManager windowId={win.id} data={win.data} />;
      case 'browser': return <Browser windowId={win.id} data={win.data} />;
      case 'settings': return <Settings windowId={win.id} data={win.data} />;
      case 'editor': return <TextEditor windowId={win.id} data={win.data} />;
      case 'store': return <AppStore windowId={win.id} data={win.data} />;
      case 'music': return <MusicPlayer windowId={win.id} data={win.data} />;
      case 'notes': return <Notes windowId={win.id} data={win.data} />;
      default: return <div className="p-4 text-sm opacity-50">App not implemented</div>;
    }
  };

  type CtxItem = { label: string; action?: () => void; separator?: boolean };
  const contextItems: CtxItem[] = [
    { label: 'Open New Window', action: () => openApp(win.appId) },
    { label: 'Separator', separator: true },
    { label: 'Minimize', action: () => dispatch({ type: 'MINIMIZE_WINDOW', windowId: win.id }) },
    { label: 'Maximize', action: () => win.isMaximized ? dispatch({ type: 'RESTORE_WINDOW', windowId: win.id }) : dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id }) },
    ...(win._prevPosition ? [{ label: 'Restore', action: () => dispatch({ type: 'SNAP_WINDOW', windowId: win.id, edge: 'restore' }) }] : []),
    { label: 'Separator', separator: true },
    { label: 'Close Window', action: () => closeWindow(win.id) },
  ];

  return (
    <>
      <div
        ref={windowRef}
        className={`absolute flex flex-col rounded-lg overflow-hidden window-enter ${
          win.isFocused ? 'shadow-2xl' : 'shadow-md'
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          ...windowStyle,
          background: currentTheme.colors.background,
          border: `1px solid ${win.isFocused ? currentTheme.colors.primary + '40' : currentTheme.colors.border}`,
          transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s, border-color 0.2s',
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        {/* Title Bar */}
        <div
          className="window-titlebar flex items-center justify-between px-3 py-2 select-none cursor-grab active:cursor-grabbing"
          style={{ background: titleBarBg, borderBottom: `1px solid ${currentTheme.colors.border}` }}
        >
          <div className="flex items-center gap-2">
            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-transform hover:scale-110 group"
                style={{ background: currentTheme.colors.error }}
                title="Close"
              >
                <span className="text-[8px] text-black/60 opacity-0 group-hover:opacity-100 font-bold leading-none">×</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', windowId: win.id }); }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-transform hover:scale-110 group"
                style={{ background: currentTheme.colors.warning }}
                title="Minimize"
              >
                <span className="text-[6px] text-black/60 opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (win.isMaximized) {
                    dispatch({ type: 'RESTORE_WINDOW', windowId: win.id });
                  } else {
                    dispatch({ type: 'MAXIMIZE_WINDOW', windowId: win.id });
                  }
                }}
                className="w-3 h-3 rounded-full flex items-center justify-center transition-transform hover:scale-110 group"
                style={{ background: currentTheme.colors.success }}
                title="Maximize"
              >
                <span className="text-[6px] text-black/60 opacity-0 group-hover:opacity-100 font-bold leading-none">+</span>
              </button>
            </div>

            {/* Title */}
            <span className="ml-3 text-xs font-medium truncate max-w-[200px]" style={{ color: win.isFocused ? currentTheme.colors.text : currentTheme.colors.textSecondary }}>
              {win.title}
            </span>
          </div>

          {/* Right side actions */}
          {win.isMaximized && (
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'RESTORE_WINDOW', windowId: win.id }); }}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={currentTheme.colors.textSecondary} strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ background: currentTheme.colors.background }}>
          {renderApp()}
        </div>

        {/* Resize Handle */}
        {app?.canResize && !win.isMaximized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
            onMouseDown={handleResizeStart}
            style={{
              background: `linear-gradient(135deg, transparent 50%, ${currentTheme.colors.border} 50%)`,
            }}
          />
        )}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] py-1 rounded-lg shadow-2xl"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: currentTheme.colors.surface,
            border: `1px solid ${currentTheme.colors.border}`,
            minWidth: '160px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {contextItems.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 border-t" style={{ borderColor: currentTheme.colors.border }} />
            ) : (
              <button
                key={i}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
                style={{ color: currentTheme.colors.text }}
                onClick={() => { item.action?.(); setContextMenu(null); }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
}
