import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'pages-dist')

rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })

cpSync(resolve(root, 'website'), output, { recursive: true })
cpSync(resolve(root, 'extension/skin.html'), resolve(output, 'skin.html'))
cpSync(resolve(root, 'shared/ocean.js'), resolve(output, 'ocean.js'))
cpSync(resolve(root, 'shared/styles.css'), resolve(output, 'styles.css'))
cpSync(resolve(root, 'shared/vendor'), resolve(output, 'vendor'), { recursive: true })
cpSync(resolve(root, 'extension/icons/icon48.png'), resolve(output, 'icon48.png'))
cpSync(resolve(root, 'docs/marketplace/open-sea-harness-cover.png'), resolve(output, 'og.png'))

const media = resolve(output, 'media')
mkdirSync(media, { recursive: true })
for (const name of [
  'harness-dark-overview-40.gif',
  'harness-light-overview-40.gif',
  'harness-wave-control-40.gif',
  'harness-daylight-sunset-40.gif',
]) {
  cpSync(resolve(root, 'docs/screenshots', name), resolve(media, name))
}

writeFileSync(resolve(output, '.nojekyll'), '')
console.log(`GitHub Pages site built at ${output}`)
