import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.argv[2] || '')
if (!root) throw new Error('Harness checkout path is required')

function edit(relativePath, transform) {
  const path = resolve(root, relativePath)
  const before = readFileSync(path, 'utf8')
  const after = transform(before)
  if (after !== before) writeFileSync(path, after)
}

function insertOnce(text, marker, needle, replacement, file) {
  if (text.includes(marker)) return text
  if (!text.includes(needle)) {
    throw new Error(`${file} has changed upstream; could not find the Open Sea integration anchor`)
  }
  return text.replace(needle, replacement)
}

edit('packages/client/ui-layout/src/client/index.ts', text => {
  text = insertOnce(
    text,
    "'shell.background':",
    "    'shell.overlay': { kind: 'list'; scope: 'root' }",
    `    /** Frame-sized layer behind every column; background plugins register here. */\n    'shell.background': { kind: 'single'; scope: 'root' }\n    'shell.overlay': { kind: 'list'; scope: 'root' }`,
    'ui-layout/src/client/index.ts',
  )
  return insertOnce(
    text,
    "'shell.background': { kind: 'single', scope: 'root' },",
    "        'shell.overlay': { kind: 'list', scope: 'root' },",
    `        'shell.background': { kind: 'single', scope: 'root' },\n        'shell.overlay': { kind: 'list', scope: 'root' },`,
    'ui-layout/src/client/index.ts',
  )
})

edit('packages/client/ui-layout/src/client/AppFrame.tsx', text => {
  text = insertOnce(
    text,
    "'shell.background' | 'shell.overlay'",
    "PropsRenderSlots<'sidebar' | 'conversation' | 'details' | 'shell.overlay'>",
    "PropsRenderSlots<'sidebar' | 'conversation' | 'details' | 'shell.background' | 'shell.overlay'>",
    'ui-layout/src/client/AppFrame.tsx',
  )
  return insertOnce(
    text,
    "renderSlot('shell.background', {})",
    "    >\n      <div className={css.sidebarCol}>",
    `    >\n      <div className={css.backgroundLayer}>\n        {renderSlot('shell.background', {})}\n      </div>\n      <div className={css.sidebarCol}>`,
    'ui-layout/src/client/AppFrame.tsx',
  )
})

edit('packages/client/ui-layout/src/client/AppFrame.module.css', text => {
  text = text.replace(
    `.backgroundLayer {\n  position: absolute;\n  inset: 0;\n  z-index: 0;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.sidebarCol,\n.centerCol,\n.detailsCol {\n  position: relative;\n  z-index: 1;\n}\n\n.sidebarCol {`,
    `.backgroundLayer {\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.sidebarCol {`,
  )
  text = insertOnce(
    text,
    'isolation: isolate; /* Open Sea background stacking context */',
    '  position: relative; /* anchors the drag handles, which straddle column borders */',
    '  position: relative; /* anchors the drag handles, which straddle column borders */\n  isolation: isolate; /* Open Sea background stacking context */',
    'ui-layout/src/client/AppFrame.module.css',
  )

  return insertOnce(
    text,
    '.backgroundLayer {',
    '.sidebarCol {',
    `.backgroundLayer {\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.sidebarCol {`,
    'ui-layout/src/client/AppFrame.module.css',
  )
})

edit('packages/host/apiproxy/src/api-proxy.ts', text => insertOnce(
  text,
  "'ui-open-sea-skin'",
  "'agent-loop', 'shell', 'locale', 'permission', 'ui-conversation', 'ui-theme', 'web-search-deepseek',",
  "'agent-loop', 'shell', 'locale', 'permission', 'ui-conversation', 'ui-theme', 'ui-open-sea-skin', 'web-search-deepseek',",
  'host/apiproxy/src/api-proxy.ts',
))

edit('tsconfig.client.json', text => insertOnce(
  text,
  './packages/client/ui-open-sea-skin',
  '    { "path": "./packages/client/ui-layout" },',
  '    { "path": "./packages/client/ui-layout" },\n    { "path": "./packages/client/ui-open-sea-skin" },',
  'tsconfig.client.json',
))

edit('packages/bundle/web-app/cordis.patch.yml', text => insertOnce(
  text,
  '    - id: ui-open-sea-skin',
  "    - id: ui-layout\n      name: '@deepseek-ai/dsh-client-ui-layout'",
  `    - id: ui-layout\n      name: '@deepseek-ai/dsh-client-ui-layout'\n\n    - id: ui-open-sea-skin\n      name: '@deepseek-ai/dsh-client-ui-open-sea-skin'`,
  'packages/bundle/web-app/cordis.patch.yml',
))

edit('packages/bundle/web-app/package.json', text => {
  const manifest = JSON.parse(text)
  const name = '@deepseek-ai/dsh-client-ui-open-sea-skin'
  if (manifest.dependencies[name] === 'workspace:^') return text
  manifest.dependencies[name] = 'workspace:^'
  manifest.dependencies = Object.fromEntries(Object.entries(manifest.dependencies).sort(([a], [b]) => a.localeCompare(b)))
  return `${JSON.stringify(manifest, null, 2)}\n`
})

console.log('Harness slot, settings exposure, client aggregate, bundle manifest and Cordis graph are integrated.')
