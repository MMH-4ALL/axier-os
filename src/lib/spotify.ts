const CLIENT_ID = 'e7d799c59ba342c282f663d334aaf507';
const REDIRECT_URI = 'https://MMH-4ALL.github.io/axier-os/';
const SCOPES = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

export function generateCodeVerifier(length = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function buildAuthUrl(): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem('spotify_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeCodeOnce(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const verifier = sessionStorage.getItem('spotify_verifier') || '';
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) throw new Error('Token exchange failed');
  return res.json();
}

// React StrictMode and multiple music windows must share a one-use OAuth exchange.
let exchange: { code: string; promise: ReturnType<typeof exchangeCodeOnce> } | undefined;
export function exchangeCodeForToken(code: string) {
  if (!exchange || exchange.code !== code) exchange = { code, promise: exchangeCodeOnce(code) };
  return exchange.promise;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}

export async function getCurrentlyPlaying(accessToken: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  if (res.status === 204) return null;
  checkPlaybackResponse(res);
  return res.json();
}

export async function pausePlayback(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  checkPlaybackResponse(response);
}

export async function resumePlayback(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  checkPlaybackResponse(response);
}

export async function skipNext(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/next', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  checkPlaybackResponse(response);
}

export async function skipPrevious(accessToken: string) {
  const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  checkPlaybackResponse(response);
}

function checkPlaybackResponse(response: Response) {
  if (response.ok) return;
  if (response.status === 401) throw new Error('Spotify sign-in expired. Disconnect and reconnect Spotify.');
  if (response.status === 403) throw new Error('Spotify refused playback control. Check your account and active device.');
  if (response.status === 404) throw new Error('Open Spotify and start playback on an active device first.');
  if (response.status === 429) throw new Error('Spotify is busy. Wait a little before trying again.');
  throw new Error('Could not reach Spotify. Check your connection and try again.');
}
