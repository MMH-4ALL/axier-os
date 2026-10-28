import { useEffect, useRef, useState } from 'react';
import {
  buildAuthUrl,
  exchangeCodeForToken,
  getCurrentlyPlaying,
  pausePlayback,
  resumePlayback,
  skipNext,
  skipPrevious,
  refreshAccessToken,
} from '@/lib/spotify';

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
  previewUrl: string | null;
}

const STORAGE_KEY_TOKEN = 'spotify_access_token';
const STORAGE_KEY_REFRESH = 'spotify_refresh_token';
const STORAGE_KEY_EXPIRY = 'spotify_token_expiry';

function parseTrack(data: any): SpotifyTrack | null {
  if (!data?.item?.album || !Array.isArray(data.item.artists)) return null;
  return {
    id: data.item.id,
    title: data.item.name,
    artist: data.item.artists.map((a: any) => a.name).join(', '),
    album: data.item.album.name,
    albumArt: data.item.album.images?.[0]?.url || '',
    progress: data.progress_ms || 0,
    duration: data.item.duration_ms || 0,
    isPlaying: data.is_playing,
    previewUrl: data.item.preview_url,
  };
}

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export default function useSpotify() {
  const [accessToken, setAccessToken] = useState<string | null>(() => readStorage(STORAGE_KEY_TOKEN));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => readStorage(STORAGE_KEY_REFRESH));
  const [expiry, setExpiry] = useState<number | null>(() => {
    const stored = readStorage(STORAGE_KEY_EXPIRY);
    return stored ? parseInt(stored) : null;
  });
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(!!readStorage(STORAGE_KEY_TOKEN));
  const [canControl, setCanControl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    let active = true;
    setIsLoading(true);
    exchangeCodeForToken(code)
      .then(data => {
        if (!active) return;
        const expiresAt = Date.now() + data.expires_in * 1000;
        localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEY_REFRESH, data.refresh_token);
        localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiresAt));
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiry(expiresAt);
        setIsAuthed(true);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(() => { if (active) setError('Spotify sign-in failed. Disconnect and try connecting again.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!refreshToken || !expiry) return;
    let active = true;
    const msUntilRefresh = Math.max(0, expiry - Date.now() - 60_000);

    refreshTimer.current = setTimeout(async () => {
      try {
        const data = await refreshAccessToken(refreshToken);
        if (!active) return;
        const newExpiry = Date.now() + data.expires_in * 1000;
        localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEY_EXPIRY, String(newExpiry));
        setAccessToken(data.access_token);
        if (data.refresh_token) {
          localStorage.setItem(STORAGE_KEY_REFRESH, data.refresh_token);
          setRefreshToken(data.refresh_token);
        }
        setExpiry(newExpiry);
      } catch {
        if (active) logout();
      }
    }, msUntilRefresh);

    return () => { active = false; if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, [refreshToken, expiry]);

  // Poll currently playing; keep only one request in flight.
  useEffect(() => {
    if (!accessToken) return;

    let disposed = false;
    let busy = false;
    const fetchTrack = async () => {
      if (busy) return;
      busy = true;
      try {
        const data = await getCurrentlyPlaying(accessToken);
        if (!disposed) {
          setTrack(parseTrack(data));
          setCanControl(data?.device?.is_restricted === false);
          setError(null);
        }
      } catch (cause) {
        if (!disposed) setError(cause instanceof Error ? cause.message : 'Could not check Spotify playback.');
      } finally { busy = false; }
    };

    fetchTrack();
    pollTimer.current = setInterval(fetchTrack, 5000);
    return () => { disposed = true; if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [accessToken]);

  const login = async () => {
    try {
      const url = await buildAuthUrl();
      window.location.href = url;
    } catch { setError('Spotify sign-in could not start. Allow site storage and retry.'); }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
    setAccessToken(null);
    setRefreshToken(null);
    setExpiry(null);
    setTrack(null);
    setIsAuthed(false);
    setCanControl(false);
    setError(null);
  };

  const control = async (action: (token: string) => Promise<void>) => {
    if (!accessToken) return;
    try {
      await action(accessToken);
      const data = await getCurrentlyPlaying(accessToken);
      setTrack(parseTrack(data));
      setCanControl(data?.device?.is_restricted === false);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Spotify playback control failed.');
    }
  };
  const pause = () => control(track?.isPlaying ? pausePlayback : resumePlayback);
  const next = () => control(skipNext);
  const prev = () => control(skipPrevious);

  return {
    track,
    isLoading,
    isAuthed,
    canControl,
    error,
    login,
    logout,
    pause,
    next,
    prev,
  };
}
