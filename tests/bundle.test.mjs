import assert from 'node:assert/strict'
import test from 'node:test'

import { apply } from '../plugin/index.js'

function createResponse() {
  return {
    body: undefined,
    headers: undefined,
    status: undefined,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
    },
    end(body) {
      this.body = body
    },
  }
}

function captureRoute() {
  let route
  const ctx = {
    effect(factory) {
      factory()
    },
    webServer: {
      register(value) {
        route = value
        return () => {}
      },
    },
  }
  apply(ctx)
  return route
}

test('DSH Host bundle serves only local Open Sea assets', async () => {
  const route = captureRoute()
  assert.equal(route.kind, 'prefix')
  assert.equal(route.path, '/open-sea-skin')

  const page = createResponse()
  await route.handler({ method: 'GET', url: '/open-sea-skin/skin.html' }, page)
  assert.equal(page.status, 200)
  assert.equal(page.headers['content-type'], 'text/html; charset=utf-8')
  assert.match(page.body.toString(), /Open Sea/)

  const head = createResponse()
  await route.handler({ method: 'HEAD', url: '/open-sea-skin/styles.css' }, head)
  assert.equal(head.status, 200)
  assert.equal(head.body, undefined)
  assert.ok(Number(head.headers['content-length']) > 0)

  const traversal = createResponse()
  await route.handler({ method: 'GET', url: '/open-sea-skin/%2e%2e%2fpackage.json' }, traversal)
  assert.equal(traversal.status, 403)

  const method = createResponse()
  await route.handler({ method: 'POST', url: '/open-sea-skin/skin.html' }, method)
  assert.equal(method.status, 405)
  assert.equal(method.headers.allow, 'GET, HEAD')
})
