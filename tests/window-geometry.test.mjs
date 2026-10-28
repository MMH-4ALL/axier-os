import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fitWindow } from '../src/lib/window-geometry.ts';

test('large apps open entirely inside a phone viewport', () => {
  const { position, size } = fitWindow({ position: { x: 900, y: -40 }, size: { width: 900, height: 600 } }, { width: 375, height: 667 });
  assert.ok(position.x >= 0 && position.y >= 28);
  assert.ok(position.x + size.width <= 375);
  assert.ok(position.y + size.height <= 667);
});

test('desktop app dimensions and valid positions are preserved', () => {
  const bounds = { position: { x: 80, y: 50 }, size: { width: 750, height: 480 } };
  assert.deepEqual(fitWindow(bounds, { width: 1440, height: 900 }), bounds);
});

test('an old off-screen window returns to the current display', () => {
  const result = fitWindow({ position: { x: 1800, y: 1200 }, size: { width: 500, height: 400 } }, { width: 1024, height: 768 });
  assert.equal(result.position.x, 516);
  assert.equal(result.position.y, 288);
});
