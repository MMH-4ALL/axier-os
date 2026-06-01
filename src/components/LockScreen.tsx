import { useOS } from '@/store/OSContext';
import { useState, useEffect, useCallback } from 'react';

export default function LockScreen() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState(new Date());
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = useCallback(() => {
    setShowLogin(true);
    setTimeout(() => {
      dispatch({ type: 'SET_VIEW', view: 'desktop' });
    }, 600);
  }, [dispatch]);

  useEffect(() => {
    const handleKey = () => handleUnlock();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleKey);
    };
  }, [handleUnlock]);

  const wallpaper = state.settings.wallpaper;
  const wpData = wallpaper.startsWith('gradient')
    ? null
    : wallpaper.startsWith('solid')
    ? null
    : { url: `/wallpapers/${wallpaper}.jpg` };

  const bgStyle = wallpaper.startsWith('gradient')
    ? { background: wallpaper }
    : wallpaper.startsWith('solid')
    ? { background: '#0f1117' }
    : wpData
    ? { backgroundImage: `url(${wpData.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: '#0f1117' };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-700"
      style={{
        ...bgStyle,
        filter: showLogin ? 'brightness(2) blur(20px)' : 'brightness(0.4)',
        opacity: showLogin ? 0 : 1,
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 text-center">
        {/* Time */}
        <div className="text-white font-light mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
          <div className="text-7xl sm:text-8xl tracking-tight">
            {time.toLocaleTimeString('en-US', {
              hour: state.settings.clockFormat === '12h' ? 'numeric' : '2-digit',
              minute: '2-digit',
              hour12: state.settings.clockFormat === '12h',
            })}
          </div>
          <div className="text-xl sm:text-2xl text-white/70 mt-2 font-normal">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Unlock Prompt */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-white/80 text-sm tracking-wide">Press any key to unlock</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-white/40 boot-pulse" />
            <span className="text-white/40 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              AXIER OS v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
