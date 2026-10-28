import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCurrentlyPlaying, pausePlayback, resumePlayback, exchangeCodeForToken } from '../src/lib/spotify.ts';

test('Spotify uses the endpoint that includes active device information', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(url, 'https://api.spotify.com/v1/me/player');
    return Response.json({ device: { is_restricted: false }, item: null });
  };
  try { assert.equal((await getCurrentlyPlaying('test')).device.is_restricted, false); }
  finally { globalThis.fetch = original; }
});

test('no playback is distinct from a rejected Spotify request', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await getCurrentlyPlaying('test'), null);
    globalThis.fetch = async () => new Response(null, { status: 401 });
    await assert.rejects(getCurrentlyPlaying('test'), /sign-in expired/);
    globalThis.fetch = async () => new Response(null, { status: 403 });
    await assert.rejects(pausePlayback('test'), /refused playback/);
  } finally { globalThis.fetch = original; }
});

test('resuming sends a play command, while pausing sends a pause command', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options.method]);
    return new Response(null, { status: 204 });
  };
  try {
    await pausePlayback('test');
    await resumePlayback('test');
    assert.deepEqual(calls, [
      ['https://api.spotify.com/v1/me/player/pause', 'PUT'],
      ['https://api.spotify.com/v1/me/player/play', 'PUT'],
    ]);
  } finally { globalThis.fetch = original; }
});

test('duplicate mounts exchange a one-use Spotify code only once', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  let requests = 0;
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: () => 'verifier' } });
  globalThis.fetch = async () => { requests++; return Response.json({ access_token: 'test', refresh_token: 'refresh', expires_in: 3600 }); };
  try {
    await Promise.all([exchangeCodeForToken('one-use-code'), exchangeCodeForToken('one-use-code')]);
    assert.equal(requests, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage);
    else delete globalThis.sessionStorage;
  }
});
