import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY = 'https://registry.npmjs.org';
const PACKAGE = 'open-sea-skin';

export function versionFromTag(tag) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(tag ?? '')) {
    throw new Error('Expected a version tag such as v1.2.7');
  }
  return tag.slice(1);
}

function verifyPackageIdentity(metadata, version) {
  if (metadata?.name !== PACKAGE || metadata?.version !== version) {
    throw new Error(`Package identity mismatch: expected ${PACKAGE}@${version}`);
  }
}

export function verifyGitHubRelease(bytes, checksums, metadata, tag, filename) {
  const version = versionFromTag(tag);
  if (filename !== `${PACKAGE}-${version}.tgz`) throw new Error('Unexpected release asset filename');
  verifyPackageIdentity(metadata, version);
  const matches = checksums.split(/\r?\n/)
    .map(line => /^([a-fA-F0-9]{64}) [ *](.+)$/.exec(line))
    .filter(match => match?.[2] === filename);
  if (matches.length !== 1) throw new Error('Expected exactly one asset entry in SHA256SUMS');
  const digest = sha256(bytes);
  if (matches[0][1].toLowerCase() !== digest) throw new Error('GitHub asset SHA-256 mismatch');
  return digest;
}

export function verifyRelease(expected, actual, integrity) {
  const sha512 = `sha512-${createHash('sha512').update(actual).digest('base64')}`;
  if (integrity !== sha512) throw new Error('Registry SHA-512 integrity mismatch');
  if (sha256(expected) !== sha256(actual)) throw new Error('Release tarballs differ (SHA-256)');
  return sha256(actual);
}

// A 404 is the only response that permits publishing. Network/auth/service
// failures must never be mistaken for an unpublished version on a rerun.
export async function verifyRegistryRelease(expected, tag, {
  allowMissing = false,
  fetchImpl = fetch,
  attempts = 5,
  wait = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  const version = versionFromTag(tag);
  let metadata;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetchImpl(`${REGISTRY}/${PACKAGE}/${encodeURIComponent(version)}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 404) {
      if (allowMissing) return { status: 'missing' };
      if (attempt === attempts) throw new Error('Published version is not visible in the npm registry yet');
      await wait(5000);
      continue;
    }
    if (!response.ok) throw new Error(`npm registry lookup failed: HTTP ${response.status}`);
    metadata = await response.json();
    break;
  }
  verifyPackageIdentity(metadata, version);
  const tarball = new URL(metadata.dist?.tarball);
  if (tarball.origin !== REGISTRY || tarball.username || tarball.password) {
    throw new Error('Unexpected npm tarball origin');
  }
  const response = await fetchImpl(tarball.href, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`npm tarball download failed: HTTP ${response.status}`);
  const actual = Buffer.from(await response.arrayBuffer());
  const digest = verifyRelease(expected, actual, metadata.dist?.integrity);
  return { status: 'present', digest, metadata, actual };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args[0] === '--github') {
    const [, archive, checksums, packageJson, tag] = args;
    if (!archive || !checksums || !packageJson || !tag) {
      throw new Error('Usage: verify-release.mjs --github package.tgz SHA256SUMS package.json tag');
    }
    console.log(verifyGitHubRelease(
      await readFile(archive), await readFile(checksums, 'utf8'),
      JSON.parse(await readFile(packageJson, 'utf8')), tag, basename(archive),
    ));
  } else if (args[0] === '--registry') {
    const [, archive, tag, directory, option] = args;
    if (!archive || !tag || !directory || (option && option !== '--allow-missing')) {
      throw new Error('Usage: verify-release.mjs --registry package.tgz tag audit-directory [--allow-missing]');
    }
    const result = await verifyRegistryRelease(await readFile(archive), tag, { allowMissing: option === '--allow-missing' });
    await mkdir(directory, { recursive: true });
    if (result.status === 'present') {
      await writeFile(join(directory, 'registry-package.json'), JSON.stringify(result.metadata, null, 2) + '\n');
      await writeFile(join(directory, 'registry.tgz'), result.actual);
    }
    await writeFile(join(directory, 'registry-verification.json'), JSON.stringify({ status: result.status, sha256: result.digest }, null, 2) + '\n');
    if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `status=${result.status}\n`);
    console.log(result.status === 'present' ? `Registry bytes verified: ${result.digest}` : 'Version is not published yet');
  } else {
    const [expected, actual, metadata] = args;
    if (!expected || !actual || !metadata) throw new Error('Usage: verify-release.mjs expected.tgz actual.tgz dist.json');
    const dist = JSON.parse(await readFile(metadata, 'utf8'));
    console.log(verifyRelease(await readFile(expected), await readFile(actual), dist.integrity));
  }
}
