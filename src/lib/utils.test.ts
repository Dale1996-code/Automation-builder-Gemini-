import { test } from 'node:test';
import assert from 'node:assert';
import { cn } from './utils.js';

test('cn utility function', async (t) => {
  await t.test('merges basic class names', () => {
    assert.strictEqual(cn('base', 'extra'), 'base extra');
  });

  await t.test('handles conditional class names', () => {
    assert.strictEqual(cn('base', true && 'active', false && 'hidden'), 'base active');
  });

  await t.test('resolves tailwind class conflicts', () => {
    // p-4 should override px-2 py-2
    const result = cn('px-2 py-2', 'p-4');
    assert.strictEqual(result, 'p-4');
  });

  await t.test('handles objects and arrays', () => {
    assert.strictEqual(cn(['a', 'b'], { 'c': true, 'd': false }), 'a b c');
  });

  await t.test('filters out falsy values', () => {
    // @ts-ignore - testing runtime behavior with mixed types
    assert.strictEqual(cn('a', null, undefined, '', false, 0), 'a');
  });
});
