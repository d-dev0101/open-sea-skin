import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version

function bytes(path) {
  return readFileSync(join(root, path))
}

function assertSame(expected, target) {
  const targetPath = join(root, target)
  if (!existsSync(targetPath) || !bytes(target).equals(expected)) {
    throw new Error(`${target} is stale; run npm run build`)
  }
}

function emit(source, targets) {
  const body = bytes(source)
  for (const target of targets) {
    if (check) assertSame(body, target)
    else {
      mkdirSync(dirname(join(root, target)), { recursive: true })
      writeFileSync(join(root, target), body)
    }
  }
}

function emitTree(source, targets) {
  const sourceRoot = join(root, source)
  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry)
      if (statSync(path).isDirectory()) walk(path)
      else {
        const suffix = relative(sourceRoot, path)
        for (const target of targets) emit(join(source, suffix), [join(target, suffix)])
      }
    }
  }
  if (!check) {
    for (const target of targets) {
      rmSync(join(root, target), { recursive: true, force: true })
      mkdirSync(join(root, target), { recursive: true })
    }
  }
  walk(sourceRoot)
}

function emitLoader(adapter, target) {
  const banner = Buffer.from(`// GENERATED from shared sources. Run npm run build after editing shared sources.\n{\nconst OPEN_SEA_VERSION = ${JSON.stringify(version)};\n`)
  const expected = Buffer.concat([banner, bytes('shared/skin-core.js'), Buffer.from('\n'),
    bytes('shared/update-checker.js'), Buffer.from('\n'), bytes(adapter), Buffer.from('\n}\n')])
  if (check) assertSame(expected, target)
  else writeFileSync(join(root, target), expected)
}

emitLoader('shared/extension-entry.js', 'extension/content.js')
emitLoader('shared/native-entry.js', 'native-dist/loader.js')

emit('shared/ocean.js', [
  'extension/ocean.js',
  'native-dist/ocean.js',
  'harness-plugin/assets/ocean.js',
])
emit('shared/styles.css', [
  'extension/styles.css',
  'native-dist/styles.css',
  'harness-plugin/assets/styles.css',
])
emit('extension/skin.html', [
  'native-dist/skin.html',
  'harness-plugin/assets/skin.html',
])
emitTree('shared/vendor', [
  'extension/vendor',
  'native-dist/vendor',
  'harness-plugin/assets/vendor',
])

if (!check) console.log('Open Sea runtime copies are up to date.')
