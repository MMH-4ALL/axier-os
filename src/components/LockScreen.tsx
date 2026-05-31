import { useOS } from '@/store/OSContext';
import { useState, useEffect } from 'react';

export default function LockScreen() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState(new Date());
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setUnlocked(true);
    setTimeout(() => {
      dispatch({ type: 'SET_VIEW', view: 'desktop' });
    }, 600);
  };

  useEffect(() => {
    const onKey = () => handleUnlock();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wallpaper = state.settings.wallpaper;
  const wpData = wallpaper.startsWith('gradient') || wallpaper.startsWith('solid') ? null : { url: `/wallpapers/${wallpaper}.jpg` };

  const bgStyle = wallpaper.startsWith('gradient')
    ? { background: wallpaper }
    : wpData
    ? { backgroundImage: `url(${wpData.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1030 50%, #0d1a2a 100%)' };

  const hour = time.toLocaleTimeString('en-US', {
    hour: state.settings.clockFormat === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: state.settings.clockFormat === '12h',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none cursor-pointer"
      style={bgStyle}
      onClick={handleUnlock}
    >
      {/* Atmosphere orbs */}
      <div className="orbs" />

      {/* Dark veil */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Main glass card */}
      <div
        className="relative z-10 glass-card rounded-[28px] px-14 py-12 flex flex-col items-center gap-1"
        style={{
          minWidth: '320px',
          animation: unlocked
            ? 'glass-unlock 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'glass-enter 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}
      >
        {/* Shine sweep */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
          <div
            style={{
              content: '',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 52%, transparent 70%)',
              backgroundSize: '300% 100%',
              animation: 'glass-shine 4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Time */}
        <div
          className="text-white font-light tracking-tight leading-none"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <div className="text-8xl">{hour.split(':')[0]}</div>
          <div className="text-8xl text-white/60">{hour.split(':').slice(1).join(':')}</div>
        </div>

        {/* Date */}
        <div className="text-white/50 text-sm mt-2 font-normal tracking-wide">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 my-3" />

        {/* Unlock hint */}
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
          <span>Click anywhere or press any key</span>
        </div>
      </div>

      <style>{`
        @keyframes glass-enter {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes glass-unlock {
          0%   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
          100% { opacity: 0; transform: scale(1.06) translateY(-8px); filter: blur(12px); }
        }
        @keyframes glass-shine {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
