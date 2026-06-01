import { useState } from 'react';
import { useOS } from '@/store/OSContext';
import { wallpapers } from '@/themes';
import Window from './Window';
import Dock from './Dock';
import TopBar from './TopBar';
import NotificationCenter from './NotificationCenter';
import DesktopIcons from './DesktopIcons';

type CtxItem = { label: string; action?: () => void; separator?: boolean };

export default function Desktop() {
  const { state, currentTheme, openApp, dispatch } = useOS();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const wallpaper = wallpapers.find(w => w.id === state.settings.wallpaper);

  const bgStyle = (() => {
    if (!wallpaper) return { background: currentTheme.colors.background };
    if (wallpaper.category === 'gradient' && wallpaper.gradient) {
      return { background: wallpaper.gradient };
    }
    if (wallpaper.category === 'solid' && wallpaper.color) {
      return { background: wallpaper.color };
    }
    return {
      backgroundImage: `url(${wallpaper.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  })();

  const desktopCtxItems: CtxItem[] = [
    { label: 'Terminal', action: () => openApp('terminal') },
    { label: 'File Manager', action: () => openApp('files') },
    { label: 'Browser', action: () => openApp('browser') },
    { label: 'Text Editor', action: () => openApp('editor') },
    { label: 'Separator', separator: true },
    { label: 'Settings', action: () => openApp('settings') },
    { label: 'App Store', action: () => openApp('store') },
    { label: 'Separator', separator: true },
    { label: 'Refresh Wallpaper', action: () => {
      const walls = wallpapers.filter(w => w.category === 'gradient');
      const random = walls[Math.floor(Math.random() * walls.length)];
      if (random) dispatch({ type: 'UPDATE_SETTINGS', settings: { wallpaper: random.id } });
    }},
  ];

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-500"
      style={bgStyle}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => setContextMenu(null)}
    >
      {/* Dark overlay for wallpapers */}
      {wallpaper?.url && (
        <div className="absolute inset-0 bg-black/20" />
      )}

      <TopBar />

      {/* Desktop Icons */}
      <DesktopIcons />

      {/* Windows */}
      {state.windows.map(win => (
        <Window key={win.id} window={win} />
      ))}

      {/* Dock */}
      <Dock />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] py-1 rounded-xl glass-menu"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 320),
            minWidth: '180px',
          }}
          onClick={e => e.stopPropagation()}
        >
          {desktopCtxItems.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 border-t border-white/10" />
            ) : (
              <button
                key={i}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2 text-white/80"
                onClick={() => { item.action?.(); setContextMenu(null); }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}

      {/* CRT Overlay - only in retro theme */}
      {state.settings.theme === 'retro' && <div className="crt-overlay" />}
    </div>
  );
}
