/**
 * Native Open Sea Host half: registers durable preferences and serves the
 * self-contained WebGPU scene under `/open-sea-skin`.
 * @module @deepseek-ai/dsh-client-ui-open-sea-skin
 */
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { OpenSeaSettingsSchema } from './settings.ts'
import { OPEN_SEA_SETTINGS_NAMESPACE } from './settings-contract.ts'

export {
  DEFAULT_OPEN_SEA_SETTINGS,
  OPEN_SEA_QUALITIES,
  OPEN_SEA_SETTINGS_NAMESPACE,
  type OpenSeaQuality,
  type OpenSeaSettings,
} from './settings-contract.ts'

/** Stable Cordis plugin name. */
export const name = 'client-ui-open-sea-skin'

const ROUTE = '/open-sea-skin'
// Normalize away URL's trailing slash so the containment check adds exactly
// one platform separator on macOS, Linux and Windows.
const ASSET_ROOT = resolve(fileURLToPath(new URL('../assets/', import.meta.url)))
const SETTINGS_NAMESPACE = settingsNamespace(OPEN_SEA_SETTINGS_NAMESPACE)

const MIME: Readonly<Record<string, string>> = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
})

function end(res: ServerResponse, status: number): void {
  res.writeHead(status)
  res.end()
}

/**
 * Serve one plugin-owned static asset without falling through to the SPA.
 * @param req - incoming Harness request.
 * @param res - response owned by this prefix route.
 */
async function serveAsset(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    end(res, 405)
    return
  }
  /* v8 ignore next -- node:http always sets url on server requests. */
  const pathname = decodeURIComponent(new URL(req.url ?? ROUTE, 'http://x').pathname)
  const suffix = pathname === ROUTE ? 'skin.html' : pathname.slice(`${ROUTE}/`.length)
  const target = resolve(ASSET_ROOT, suffix)
  if (target !== ASSET_ROOT && !target.startsWith(ASSET_ROOT + sep)) {
    end(res, 403)
    return
  }
  try {
    const body = await readFile(target)
    res.writeHead(200, {
      'cache-control': 'no-cache',
      'content-type': MIME[extname(target)] ?? 'application/octet-stream',
    })
    res.end(req.method === 'HEAD' ? undefined : body)
  } catch (error) {
    if (error instanceof Error && 'code' in error
      && (error.code === 'ENOENT' || error.code === 'EISDIR')) {
      end(res, 404)
      return
    }
    throw error
  }
}

/**
 * Register the settings schema and static resource route when their Host
 * services join the composition.
 * @param ctx - Host Cordis context.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(SETTINGS_NAMESPACE, OpenSeaSettingsSchema)
  })
  ctx.inject(['webServer'], (httpCtx) => {
    httpCtx.effect(() => httpCtx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      handler: serveAsset,
    }), 'client-ui-open-sea-skin: static assets')
  })
}
