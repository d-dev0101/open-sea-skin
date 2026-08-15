import { createServer } from 'node:http'
import { access, readdir, readFile, realpath } from 'node:fs/promises'
import { homedir, platform } from 'node:os'
import { extname, join, normalize, resolve, sep } from 'node:path'

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

async function existing(path) {
  try { await access(path); return path } catch { return undefined }
}

async function recursiveCandidates(root) {
  try {
    const entries = await readdir(root, { recursive: true })
    return entries
      .filter(entry => entry.endsWith('Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing') || entry.endsWith('/chrome'))
      .map(entry => join(root, entry))
  } catch { return [] }
}

export async function findChromeForTesting(playwrightExecutable) {
  const explicit = process.env.OSS_CHROME_BIN
  if (explicit) {
    const match = await existing(resolve(explicit))
    if (!match) throw new Error(`OSS_CHROME_BIN does not exist: ${explicit}`)
    return match
  }
  const candidates = [
    '/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    playwrightExecutable,
    ...(await recursiveCandidates(resolve('.cache/chrome-for-testing'))),
    ...(await recursiveCandidates(join(homedir(), 'Library/Caches/ms-playwright'))),
    ...(await recursiveCandidates(join(homedir(), 'Library/Caches/puppeteer'))),
    ...(await recursiveCandidates(join(homedir(), '.cache/puppeteer'))),
  ]
  for (const candidate of candidates) {
    if (candidate && await existing(candidate)) return realpath(candidate)
  }
  throw new Error('Chrome for Testing was not found. Run: npx playwright install chromium')
}

export function chromiumArgs() {
  const args = ['--enable-unsafe-webgpu']
  if (platform() === 'linux') {
    args.push('--use-angle=swiftshader', '--enable-features=Vulkan', '--disable-vulkan-surface')
  }
  return args
}

export async function serveDirectory(directory) {
  const root = await realpath(directory)
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://fixture').pathname)
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
      const target = normalize(resolve(root, relative))
      if (target !== root && !target.startsWith(root + sep)) {
        response.writeHead(403).end()
        return
      }
      const body = await readFile(target)
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': MIME[extname(target)] ?? 'application/octet-stream',
      })
      response.end(body)
    } catch (error) {
      response.writeHead(error?.code === 'ENOENT' ? 404 : 500).end()
    }
  })
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolvePromise)
  })
  const address = server.address()
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolvePromise, reject) => server.close(error => error ? reject(error) : resolvePromise())),
  }
}

export function watchPageErrors(page, label) {
  const failures = []
  page.on('pageerror', error => failures.push(`${label} pageerror: ${error.message}`))
  page.on('console', message => {
    const text = message.text()
    const expectedWebGPUShutdown = text.includes('THREE.WebGPURenderer: WebGPU Device Lost:')
      && text.includes('Reason: destroyed')
    if (message.type() === 'error' && !expectedWebGPUShutdown) {
      failures.push(`${label} console: ${text}`)
    }
  })
  return failures
}

export async function waitForOcean(page, frameSelector = '#__open-sea-skin__') {
  const iframe = page.locator(frameSelector)
  await iframe.waitFor({ state: 'attached', timeout: 30_000 })
  const frame = page.frameLocator(frameSelector)
  await frame.locator('body.ready').waitFor({ timeout: 45_000 })
  await frame.locator('canvas').waitFor({ state: 'visible', timeout: 15_000 })
  return frame
}

export async function setRange(locator, value) {
  await locator.evaluate((element, next) => {
    element.value = String(next)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}
