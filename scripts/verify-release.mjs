import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function verifyRelease(expected, actual, integrity) {
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
  const sha512 = `sha512-${createHash('sha512').update(actual).digest('base64')}`;
  if (integrity !== sha512) throw new Error('Registry SHA-512 integrity mismatch');
  if (sha256(expected) !== sha256(actual)) throw new Error('Release tarballs differ (SHA-256)');
  return sha256(actual);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [expected, actual, metadata] = process.argv.slice(2);
  if (!expected || !actual || !metadata) throw new Error('Usage: verify-release.mjs expected.tgz actual.tgz dist.json');
  const dist = JSON.parse(await readFile(metadata, 'utf8'));
  console.log(verifyRelease(await readFile(expected), await readFile(actual), dist.integrity));
}
