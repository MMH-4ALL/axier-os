import { useEffect, useRef, useState } from 'react';
import {
  buildAuthUrl,
  exchangeCodeForToken,
  getCurrentlyPlaying,
  pausePlayback,
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
  if (!data || !data.item) return null;
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

export default function useSpotify() {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY_TOKEN));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY_REFRESH));
  const [expiry, setExpiry] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_EXPIRY);
    return stored ? parseInt(stored) : null;
  });
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem(STORAGE_KEY_TOKEN));
  const [isPremium, setIsPremium] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    setIsLoading(true);
    exchangeCodeForToken(code)
      .then(data => {
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
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!refreshToken || !expiry) return;
    const msUntilRefresh = expiry - Date.now() - 60_000; // 1 min before expiry
    if (msUntilRefresh <= 0) return;

    refreshTimer.current = setTimeout(async () => {
      try {
        const data = await refreshAccessToken(refreshToken);
        const newExpiry = Date.now() + data.expires_in * 1000;
        localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEY_EXPIRY, String(newExpiry));
        setAccessToken(data.access_token);
        setExpiry(newExpiry);
      } catch {
        logout();
      }
    }, msUntilRefresh);

    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, [refreshToken, expiry]);

  // Poll currently playing
  useEffect(() => {
    if (!accessToken) return;

    const fetchTrack = async () => {
      const data = await getCurrentlyPlaying(accessToken);
      setTrack(data ? parseTrack(data) : null);
      // Premium if device list has a non-restricted device
      if (data && data.device) {
        setIsPremium(data.device.type !== 'unknown');
      }
    };

    fetchTrack();
    pollTimer.current = setInterval(fetchTrack, 5000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [accessToken]);

  const login = async () => {
    const url = await buildAuthUrl();
    window.location.href = url;
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
    setIsPremium(false);
  };

  const pause = () => accessToken && pausePlayback(accessToken);
  const next = () => accessToken && skipNext(accessToken);
  const prev = () => accessToken && skipPrevious(accessToken);

  return {
    track,
    isLoading,
    isAuthed,
    isPremium,
    login,
    logout,
    pause,
    next,
    prev,
  };
}
