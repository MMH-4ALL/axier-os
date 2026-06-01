import { useState, useRef, useEffect } from 'react';
import { useOS } from '@/store/OSContext';

interface Props {
  windowId: string;
  data?: Record<string, unknown>;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Neon Dreams', artist: 'Axier Audio', duration: 184 },
  { id: '2', title: 'System Boot', artist: 'Kernel Beats', duration: 142 },
  { id: '3', title: 'Digital Rain', artist: 'Matrix Sound', duration: 226 },
  { id: '4', title: 'Terminal Flow', artist: 'Shell Collective', duration: 198 },
  { id: '5', title: 'Cyber Dawn', artist: 'Future Labs', duration: 254 },
  { id: '6', title: 'Quantum Leap', artist: 'Physics Dept', duration: 312 },
];

export default function MusicPlayer({ windowId: _windowId }: Props) {
  const { currentTheme } = useOS();
  const [tracks] = useState<Track[]>(DEMO_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const progressInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            // Next track
            setCurrentTrack(idx => (idx + 1) % tracks.length);
            return 0;
          }
          return p + 0.5;
        });
      }, 100);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, tracks.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const prevTrack = () => {
    setCurrentTrack(idx => (idx - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const nextTrack = () => {
    setCurrentTrack(idx => (idx + 1) % tracks.length);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const track = tracks[currentTrack];
  const currentSeconds = (progress / 100) * track.duration;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Album Art / Visualizer */}
      <div className="flex-shrink-0 h-48 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}30, ${currentTheme.colors.accent}20)`,
          }} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`, boxShadow: `0 8px 32px ${currentTheme.colors.primary}40` }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold">{track.title}</h3>
          <p className="text-xs opacity-60">{track.artist}</p>
        </div>

        {/* Fake visualizer bars */}
        {isPlaying && (
          <div className="absolute bottom-2 left-0 right-0 flex items-end justify-center gap-0.5 h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.random() * 100}%`,
                  background: currentTheme.colors.primary,
                  opacity: 0.3,
                  animation: `sound-wave ${0.3 + Math.random() * 0.5}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="w-full h-1 rounded-full overflow-hidden cursor-pointer"
          style={{ background: currentTheme.colors.surfaceAlt }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setProgress(pct);
          }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: currentTheme.colors.primary }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] opacity-50">{formatTime(currentSeconds)}</span>
          <span className="text-[9px] opacity-50">{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button onClick={prevTrack} className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </button>
        <button onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: currentTheme.colors.primary }}>
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button onClick={nextTrack} className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 px-4 py-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={e => setVolume(parseInt(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: currentTheme.colors.surfaceAlt, accentColor: currentTheme.colors.primary }}
        />
        <span className="text-[9px] w-6 text-right opacity-50">{volume}%</span>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto border-t mt-2" style={{ borderColor: currentTheme.colors.border }}>
        {tracks.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => { setCurrentTrack(idx); setProgress(0); setIsPlaying(true); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5 ${
              idx === currentTrack ? 'bg-white/5' : ''
            }`}
          >
            <span className="text-[10px] w-4 text-center opacity-40">{idx === currentTrack && isPlaying ? '♪' : idx + 1}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs truncate ${idx === currentTrack ? 'font-medium' : ''}`} style={idx === currentTrack ? { color: currentTheme.colors.primary } : {}}>
                {t.title}
              </div>
              <div className="text-[9px] opacity-50">{t.artist}</div>
            </div>
            <span className="text-[9px] opacity-40">{formatTime(t.duration)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
