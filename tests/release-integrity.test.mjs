import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyGitHubRelease, verifyRegistryRelease, verifyRelease, versionFromTag } from '../scripts/verify-release.mjs';
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
  assert.match(workflow, /gh release download/);
  assert.match(workflow, /tar -xOf[^\n]+package\/package\.json/);
  assert.match(workflow, /steps\.registry\.outputs\.status == 'missing'/);
  assert.doesNotMatch(workflow, /npm pack\b|npm run build|gh release upload|contents: write/);
});

const tag = 'v1.2.7';
const filename = 'open-sea-skin-1.2.7.tgz';
const identity = { name: 'open-sea-skin', version: '1.2.7' };
const digest = createHash('sha256').update(bytes).digest('hex');
const checksum = `${digest}  ${filename}\n`;
const metadata = {
  ...identity,
  dist: { tarball: 'https://registry.npmjs.org/open-sea-skin/-/open-sea-skin-1.2.7.tgz', integrity },
};
const response = (body, status = 200) => new Response(body, { status });

test('GitHub candidate verification checks filename, checksum and embedded package identity', () => {
  assert.equal(verifyGitHubRelease(bytes, checksum, identity, tag, filename), digest);
  assert.equal(verifyGitHubRelease(bytes, checksum.replace('  ', ' *'), identity, tag, filename), digest);
  assert.throws(() => verifyGitHubRelease(Buffer.from('changed'), checksum, identity, tag, filename), /SHA-256 mismatch/);
  assert.throws(() => verifyGitHubRelease(bytes, '', identity, tag, filename), /exactly one/);
  assert.throws(() => verifyGitHubRelease(bytes, checksum + checksum, identity, tag, filename), /exactly one/);
  assert.throws(() => verifyGitHubRelease(bytes, checksum, { ...identity, version: '1.2.6' }, tag, filename), /identity mismatch/);
  assert.throws(() => verifyGitHubRelease(bytes, checksum, { ...identity, name: 'other' }, tag, filename), /identity mismatch/);
  assert.throws(() => verifyGitHubRelease(bytes, checksum, identity, tag, 'open-sea-skin.tgz'), /filename/);
  assert.throws(() => versionFromTag('v1.2.7/../../main'), /version tag/);
});

test('an unpublished version is distinct from registry or network failure', async () => {
  assert.deepEqual(await verifyRegistryRelease(bytes, tag, {
    allowMissing: true, fetchImpl: async () => response('not found', 404),
  }), { status: 'missing' });
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(verifyRegistryRelease(bytes, tag, {
      allowMissing: true, fetchImpl: async () => response('failure', status),
    }), new RegExp(`HTTP ${status}`));
  }
  await assert.rejects(verifyRegistryRelease(bytes, tag, {
    allowMissing: true, fetchImpl: async () => { throw new Error('network unavailable'); },
  }), /network unavailable/);
});

test('rerunning after a successful npm publish verifies bytes instead of allowing another publish', async () => {
  const requests = [];
  const fetchImpl = async url => {
    requests.push(url);
    return response(url.endsWith('.tgz') ? bytes : JSON.stringify(metadata));
  };
  for (let rerun = 0; rerun < 2; rerun++) {
    const result = await verifyRegistryRelease(bytes, tag, { allowMissing: true, fetchImpl });
    assert.equal(result.status, 'present');
    assert.equal(result.digest, digest);
    assert.deepEqual(result.actual, bytes);
  }
  assert.equal(requests.length, 4);
});

test('an existing version with different bytes or package identity is rejected', async () => {
  await assert.rejects(verifyRegistryRelease(Buffer.from('new build of same version'), tag, {
    allowMissing: true,
    fetchImpl: async url => response(url.endsWith('.tgz') ? bytes : JSON.stringify(metadata)),
  }), /tarballs differ/);
  for (const invalid of [
    { ...metadata, version: '1.2.6' },
    { ...metadata, name: 'other' },
    { ...metadata, dist: { ...metadata.dist, tarball: 'https://example.com/package.tgz' } },
  ]) {
    await assert.rejects(verifyRegistryRelease(bytes, tag, {
      allowMissing: true, fetchImpl: async () => response(JSON.stringify(invalid)),
    }), /identity mismatch|tarball origin/);
  }
});

test('post-publish verification waits for registry propagation, with a bounded failure', async () => {
  let lookups = 0;
  const waits = [];
  const result = await verifyRegistryRelease(bytes, tag, {
    fetchImpl: async url => {
      if (url.endsWith('.tgz')) return response(bytes);
      return ++lookups < 3 ? response('not found', 404) : response(JSON.stringify(metadata));
    },
    wait: async ms => { waits.push(ms); },
  });
  assert.equal(result.status, 'present');
  assert.deepEqual(waits, [5000, 5000]);
  await assert.rejects(verifyRegistryRelease(bytes, tag, {
    fetchImpl: async () => response('not found', 404), attempts: 2, wait: async () => {},
  }), /not visible/);
});
