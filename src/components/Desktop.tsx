import { useOS } from '@/store/OSContext';
import { wallpapers } from '@/themes';
import Window from './Window';
import Dock from './Dock';
import TopBar from './TopBar';
import NotificationCenter from './NotificationCenter';
import DesktopIcons from './DesktopIcons';

export default function Desktop() {
  const { state, currentTheme } = useOS();

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

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-500"
      style={bgStyle}
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

      {/* CRT Overlay - only in retro theme */}
      {state.settings.theme === 'retro' && <div className="crt-overlay" />}
    </div>
  );
}
