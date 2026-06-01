import { useState, useRef, useEffect } from 'react';
import { useOS } from '@/store/OSContext';
import useSpotify from '@/hooks/useSpotify';

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

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MusicPlayer({ windowId: _windowId }: Props) {
  const { currentTheme } = useOS();
  const [tab, setTab] = useState<'local' | 'spotify'>('local');
  const spotify = useSpotify();

  // --- Local player state ---
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
  const prevTrack = () => { setCurrentTrack(idx => (idx - 1 + tracks.length) % tracks.length); setProgress(0); };
  const nextTrack = () => { setCurrentTrack(idx => (idx + 1) % tracks.length); setProgress(0); };
  const localTrack = tracks[currentTrack];
  const localSeconds = (progress / 100) * localTrack.duration;
  const fmtLocal = (s: number) => `${Math.floor(s / 60)}:${(Math.floor(s) % 60).toString().padStart(2, '0')}`;

  // --- Spotify panel ---
  const SpotifyPanel = () => {
    if (spotify.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: currentTheme.colors.primary, borderTopColor: 'transparent' }} />
          <span className="text-xs opacity-60">Connecting to Spotify...</span>
        </div>
      );
    }

    if (!spotify.isAuthed) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#1DB954', boxShadow: '0 8px 32px #1DB95440' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Connect Spotify</h3>
            <p className="text-[10px] opacity-50">See what's playing on your Spotify right now</p>
          </div>
          <button
            onClick={spotify.login}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-85"
            style={{ background: '#1DB954' }}
          >
            Connect with Spotify
          </button>
          <p className="text-[9px] opacity-30">Read-only access — only shows your current track</p>
        </div>
      );
    }

    const t = spotify.track;
    return (
      <div className="flex flex-col h-full">
        {t ? (
          <>
            {/* Album art */}
            <div className="flex-shrink-0 h-44 flex items-center justify-center relative overflow-hidden">
              {t.albumArt ? (
                <img
                  src={t.albumArt}
                  alt={t.album}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}40, ${currentTheme.colors.accent}20)` }}>
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{ background: '#1DB954' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
              <div className="absolute bottom-2 left-0 right-0 px-3">
                <p className="text-xs font-semibold truncate">{t.title}</p>
                <p className="text-[10px] opacity-70 truncate">{t.artist}</p>
              </div>
              {/* Spotify live badge */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1"
                style={{ background: '#1DB954', color: '#fff' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Progress */}
            <div className="px-3 py-2">
              <div className="w-full h-1 rounded-full overflow-hidden cursor-pointer"
                style={{ background: currentTheme.colors.surfaceAlt }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(t.progress / t.duration) * 100}%`, background: '#1DB954' }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] opacity-50">{formatTime(t.progress)}</span>
                <span className="text-[9px] opacity-50">{formatTime(t.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 py-1">
              <button onClick={spotify.prev}
                className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 disabled:opacity-30"
                disabled={!spotify.isPremium}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button
                onClick={spotify.pause}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-30"
                style={{ background: '#1DB954' }}
                disabled={!spotify.isPremium}>
                {t.isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button onClick={spotify.next}
                className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 disabled:opacity-30"
                disabled={!spotify.isPremium}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {!spotify.isPremium && (
              <p className="text-[9px] text-center opacity-30 px-4 mb-1">
                Playback control requires Spotify Premium
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="text-4xl">🎵</div>
            <div>
              <p className="text-sm font-medium">Nothing playing</p>
              <p className="text-[10px] opacity-50 mt-1">Start playing something on Spotify</p>
            </div>
            <div className="w-6 h-6 border border-t-transparent rounded-full animate-spin"
              style={{ borderColor: currentTheme.colors.border, borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Disconnect */}
        <div className="mt-auto pt-2 border-t flex-shrink-0" style={{ borderColor: currentTheme.colors.border }}>
          <button
            onClick={spotify.logout}
            className="w-full py-1.5 text-[10px] opacity-40 hover:opacity-80 transition-opacity">
            Disconnect Spotify
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: currentTheme.colors.background, color: currentTheme.colors.text }}>
      {/* Tab switcher */}
      <div className="flex border-b flex-shrink-0 gap-1 px-3 pt-2" style={{ borderColor: currentTheme.colors.border }}>
        <button
          onClick={() => setTab('local')}
          className="flex-1 py-1.5 px-4 text-xs font-semibold rounded-t-lg transition-all"
          style={{
            color: tab === 'local' ? '#fff' : currentTheme.colors.textSecondary,
            background: tab === 'local' ? currentTheme.colors.primary + '25' : 'transparent',
            borderBottom: tab === 'local' ? `2px solid ${currentTheme.colors.primary}` : '2px solid transparent',
          }}>
          🎵 Library
        </button>
        <button
          onClick={() => setTab('spotify')}
          className="flex-1 py-1.5 px-4 text-xs font-semibold rounded-t-lg transition-all flex items-center justify-center gap-1.5"
          style={{
            color: tab === 'spotify' ? '#fff' : currentTheme.colors.textSecondary,
            background: tab === 'spotify' ? '#1DB95425' : 'transparent',
            borderBottom: tab === 'spotify' ? '2px solid #1DB954' : '2px solid transparent',
          }}>
          🎧 Spotify
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#1DB954' }} />
        </button>
      </div>

      {/* Local player */}
      {tab === 'local' && (
        <>
          {/* Album Art */}
          <div className="flex-shrink-0 h-48 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}30, ${currentTheme.colors.accent}20)` }} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.accent})`, boxShadow: `0 8px 32px ${currentTheme.colors.primary}40` }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">{localTrack.title}</h3>
              <p className="text-xs opacity-60">{localTrack.artist}</p>
            </div>
            {/* Visualizer bars */}
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
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: currentTheme.colors.primary }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] opacity-50">{fmtLocal(localSeconds)}</span>
              <span className="text-[9px] opacity-50">{fmtLocal(localTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-2">
            <button onClick={prevTrack} className="p-2 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors">
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
            <button onClick={nextTrack} className="p-2 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-4 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input type="range" min="0" max="100" value={volume}
              onChange={e => setVolume(parseInt(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{ background: currentTheme.colors.surfaceAlt, accentColor: currentTheme.colors.primary }} />
            <span className="text-[9px] w-6 text-right opacity-50">{volume}%</span>
          </div>

          {/* Playlist */}
          <div className="flex-1 overflow-y-auto border-t mt-2" style={{ borderColor: currentTheme.colors.border }}>
            {tracks.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => { setCurrentTrack(idx); setProgress(0); setIsPlaying(true); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5 ${idx === currentTrack ? 'bg-white/5' : ''}`}>
                <span className="text-[10px] w-4 text-center opacity-40">
                  {idx === currentTrack && isPlaying ? '♪' : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs truncate ${idx === currentTrack ? 'font-medium' : ''}`}
                    style={idx === currentTrack ? { color: currentTheme.colors.primary } : {}}>
                    {t.title}
                  </div>
                  <div className="text-[9px] opacity-50">{t.artist}</div>
                </div>
                <span className="text-[9px] opacity-40">{fmtLocal(t.duration)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Spotify panel */}
      {tab === 'spotify' && <SpotifyPanel />}
    </div>
  );
}
