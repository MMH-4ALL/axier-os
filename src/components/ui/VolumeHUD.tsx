import { useState, useEffect } from 'react';
import { useOS } from '@/store/OSContext';

export default function VolumeHUD() {
  const { state } = useOS();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.showVolumeHUD) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1600);
      return () => clearTimeout(t);
    }
  }, [state.showVolumeHUD, state.volume]);

  if (!visible) return null;

  const icons = state.volume === 0 ? '🔇' : state.volume < 33 ? '🔈' : state.volume < 66 ? '🔉' : '🔊';

  return (
    <div
      className="fixed left-1/2 top-1/2 z-[200] flex flex-col items-center"
      style={{ transform: 'translate(-50%, -50%)', animation: 'hud-pop 0.25s cubic-bezier(0.22,1,0.36,1)' }}
    >
      <div
        className="rounded-2xl px-7 py-5 flex flex-col items-center gap-3"
        style={{
          background: 'rgba(8, 8, 18, 0.88)',
          backdropFilter: 'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.72)',
          minWidth: '110px',
        }}
      >
        <div className="text-3xl">{icons}</div>
        <div className="w-36 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${state.volume}%`,
              background: 'linear-gradient(90deg, #7aa2f7, #bb9af7)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
        <div className="text-white/50 text-xs tabular-nums">{state.volume}%</div>
      </div>

      <style>{`
        @keyframes hud-pop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
