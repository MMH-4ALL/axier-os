import { useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  emoji: string;
  color: string;
}

const TRACKS: Track[] = [
  { id: '1', title: 'Neon Dreams', artist: 'Axier Audio', duration: 184, emoji: '🌆', color: '#7aa2f7' },
  { id: '2', title: 'System Boot', artist: 'Kernel Beats', duration: 142, emoji: '🖥️', color: '#9ece6a' },
  { id: '3', title: 'Digital Rain', artist: 'Matrix Sound', duration: 226, emoji: '🌧️', color: '#7dcfff' },
  { id: '4', title: 'Terminal Flow', artist: 'Shell Collective', duration: 198, emoji: '⌨️', color: '#bb9af7' },
  { id: '5', title: 'Cyber Dawn', artist: 'Future Labs', duration: 254, emoji: '🌅', color: '#ff9e64' },
  { id: '6', title: 'Quantum Leap', artist: 'Physics Dept', duration: 312, emoji: '⚛️', color: '#73daca' },
];

export default function MiniMusicPlayer() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setCurrent(c => (c + 1) % TRACKS.length);
            return 0;
          }
          return p + 0.4;
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const track = TRACKS[current];
  const curSec = (progress / 100) * track.duration;

  if (!expanded) {
    // Collapsed — small pill at bottom-right
    return (
      <button
        className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all hover:scale-105"
        style={{
          background: 'rgba(8, 8, 18, 0.82)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.48)',
          animation: 'mini-player-enter 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={() => setExpanded(true)}
        title="Open music player"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
          style={{ background: track.color + '30', border: `1px solid ${track.color}50` }}
        >
          {playing ? '🎵' : track.emoji}
        </div>
        <div className="flex flex-col items-start">
          <div className="text-[10px] text-white/70 leading-tight max-w-[90px] truncate">{track.title}</div>
          <div className="text-[9px] text-white/30 leading-tight">{playing ? 'Now playing' : 'Paused'}</div>
        </div>
        <button
          className="ml-1 text-white/50 hover:text-white/90 transition-colors"
          onClick={e => { e.stopPropagation(); setPlaying(p => !p); }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
      </button>
    );
  }

  // Expanded view
  return (
    <div
      className="fixed bottom-3 right-3 z-50 rounded-2xl overflow-hidden"
      style={{
        width: '260px',
        background: 'rgba(8, 8, 18, 0.88)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 16px 64px rgba(0,0,0,0.64)',
        animation: 'mini-player-enter 0.25s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Now Playing</span>
        <div className="flex gap-2">
          <button
            className="text-white/40 hover:text-white/80 text-xs transition-colors"
            onClick={() => { setCurrent(c => (c - 1 + TRACKS.length) % TRACKS.length); setProgress(0); }}
          >
            ⏮
          </button>
          <button
            className="text-white/40 hover:text-white/80 text-xs transition-colors"
            onClick={() => { setCurrent(c => (c + 1) % TRACKS.length); setProgress(0); }}
          >
            ⏭
          </button>
          <button
            className="text-white/40 hover:text-white/80 text-xs transition-colors"
            onClick={() => setExpanded(false)}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Album art */}
      <div className="px-4 flex flex-col items-center">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl mb-3"
          style={{
            background: `linear-gradient(135deg, ${track.color}30, ${track.color}10)`,
            border: `1px solid ${track.color}30`,
            boxShadow: `0 8px 32px ${track.color}20`,
          }}
        >
          {track.emoji}
        </div>
        <div className="text-sm font-medium text-white/90 text-center">{track.title}</div>
        <div className="text-[11px] text-white/40 mt-0.5">{track.artist}</div>
      </div>

      {/* Progress */}
      <div className="px-4 mt-4">
        <div
          className="w-full h-1 rounded-full overflow-hidden cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: track.color, transition: 'width 0.2s' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-white/30">
          <span>{fmt(curSec)}</span>
          <span>{fmt(track.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pb-4 pt-2">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          onClick={() => { setCurrent(c => (c - 1 + TRACKS.length) % TRACKS.length); setProgress(0); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: track.color }}
          onClick={() => setPlaying(p => !p)}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          onClick={() => { setCurrent(c => (c + 1) % TRACKS.length); setProgress(0); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

      {/* Playlist */}
      <div className="border-t px-1 py-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors"
            style={{
              background: i === current ? `${t.color}18` : 'transparent',
            }}
            onClick={() => { setCurrent(i); setProgress(0); setPlaying(true); }}
          >
            <span className="text-base">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] truncate" style={{ color: i === current ? t.color : 'rgba(255,255,255,0.65)' }}>
                {t.title}
              </div>
            </div>
            {i === current && playing && (
              <div className="flex gap-px">
                <div className="w-0.5 h-2 rounded-full animate-pulse" style={{ background: t.color, animation: 'bar-dance 0.4s ease-in-out infinite alternate' }} />
                <div className="w-0.5 h-3 rounded-full animate-pulse" style={{ background: t.color, animation: 'bar-dance 0.4s 0.15s ease-in-out infinite alternate' }} />
                <div className="w-0.5 h-1.5 rounded-full animate-pulse" style={{ background: t.color, animation: 'bar-dance 0.4s 0.3s ease-in-out infinite alternate' }} />
              </div>
            )}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes mini-player-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bar-dance {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
