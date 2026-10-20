import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyRelease } from '../scripts/verify-release.mjs';
import { readFileSync } from 'node:fs';

const bytes = Buffer.from('one immutable package');
const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
test('release verification checks exact bytes and registry integrity', () => {
  assert.match(verifyRelease(bytes, bytes, integrity), /^[a-f0-9]{64}$/);
  assert.throws(() => verifyRelease(Buffer.from('other'), bytes, integrity), /tarballs differ/);
  assert.throws(() => verifyRelease(bytes, bytes, undefined), /integrity mismatch/);
  assert.throws(() => verifyRelease(bytes, bytes, 'sha512-invalid'), /integrity mismatch/);
});

test('publish workflow uses an explicit local tarball path, not GitHub shorthand', () => {
  const workflow = readFileSync(new URL('../.github/workflows/npm-publish.yml', import.meta.url), 'utf8');
  assert.match(workflow, /npm publish \.\/release-audit\/open-sea-skin\.tgz/);
});
