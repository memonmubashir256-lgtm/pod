import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampExplodedAmount,
  cycleIndex,
  formatUsd,
  getHotspotCameraPreset,
  resolveProductConfiguration,
  validateNewsletterEmail,
} from './valenceLogic';

test('validateNewsletterEmail rejects empty and malformed emails', () => {
  const empty = validateNewsletterEmail('   ');
  assert.equal(empty.valid, false);
  assert.ok(empty.error);

  const bad = validateNewsletterEmail('not-an-email');
  assert.equal(bad.valid, false);
  assert.match(bad.error ?? '', /valid email/i);
});

test('validateNewsletterEmail accepts valid email and detects duplicates', () => {
  const ok = validateNewsletterEmail('  Alex@Valence.Studio ');
  assert.equal(ok.valid, true);
  assert.equal(ok.normalizedEmail, 'alex@valence.studio');
  assert.equal(ok.error, null);

  const dup = validateNewsletterEmail('alex@valence.studio', ['ALEX@VALENCE.STUDIO']);
  assert.equal(dup.valid, false);
  assert.match(dup.error ?? '', /already/i);
});

test('resolveProductConfiguration computes finish delta pricing accurately', () => {
  const base = resolveProductConfiguration('valence-s1', 'obsidian');
  assert.equal(base.totalPrice, 189);
  assert.equal(base.formattedPrice, '$189');

  const prism = resolveProductConfiguration('valence-s1', 'prism');
  assert.equal(prism.totalPrice, 214);
  assert.equal(prism.finish.name, 'Solar Prism');
});

test('cycleIndex wraps cleanly forward and backward', () => {
  assert.equal(cycleIndex(0, -1, 4), 3);
  assert.equal(cycleIndex(3, 1, 4), 0);
  assert.equal(cycleIndex(1, 1, 4), 2);
  assert.equal(cycleIndex(0, 1, 0), 0);
});

test('clampExplodedAmount bounds values to [0, 1]', () => {
  assert.equal(clampExplodedAmount(-0.4), 0);
  assert.equal(clampExplodedAmount(1.6), 1);
  assert.equal(clampExplodedAmount(0.45), 0.45);
  assert.equal(clampExplodedAmount(Number.NaN), 0);
});

test('getHotspotCameraPreset returns calibrated target preset', () => {
  const preset = getHotspotCameraPreset('valve');
  assert.equal(preset.spec.id, 'valve');
  assert.equal(preset.spec.indexLabel, '03');
  assert.ok(preset.zoom > 2);
});

test('formatUsd formats integer dollar amounts', () => {
  assert.equal(formatUsd(1249.4), '$1,249');
});
