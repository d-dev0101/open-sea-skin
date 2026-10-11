import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyRelease } from '../scripts/verify-release.mjs';

const bytes = Buffer.from('one immutable package');
const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
test('release verification checks exact bytes and registry integrity', () => {
  assert.match(verifyRelease(bytes, bytes, integrity), /^[a-f0-9]{64}$/);
  assert.throws(() => verifyRelease(Buffer.from('other'), bytes, integrity), /tarballs differ/);
  assert.throws(() => verifyRelease(bytes, bytes, undefined), /integrity mismatch/);
  assert.throws(() => verifyRelease(bytes, bytes, 'sha512-invalid'), /integrity mismatch/);
});
