import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  canUseHermesSessions,
  classifyHermesSurfaceError,
  fetchHermesNativeSessions,
  hermesDashboardChatUrl,
  hermesDashboardUrl,
  hermesMetricCounts,
  hermesSessionsApiUrl,
  hermesSurfaceLog,
  normalizeHermesSessions,
  noteHermesMetric,
  openNativeSurface,
  resetHermesMetrics
} from '../src/api/hermesSessions.js'

const mine = {
  email: 'me@x',
  ready: true,
  hostname: 'agent-me.brenon.cloud',
  launchUrl: 'https://agent-me.brenon.cloud/hermes'
}

describe('hermesDashboardUrl', () => {
  it('uses launchUrl from the instance when present', () => {
    assert.equal(hermesDashboardUrl(mine), 'https://agent-me.brenon.cloud/hermes')
  })

  it('falls back to /hermes on the instance hostname', () => {
    assert.equal(
      hermesDashboardUrl({ hostname: 'agent-me.brenon.cloud', ready: true }),
      'https://agent-me.brenon.cloud/hermes'
    )
  })

  it('is empty without an instance host', () => {
    assert.equal(hermesDashboardUrl({}), '')
    assert.equal(hermesDashboardUrl(null), '')
  })
})

describe('entitlement', () => {
  it('refuses sessions and dashboard when the account has no ready instance', () => {
    assert.equal(canUseHermesSessions(null), false)
    assert.equal(canUseHermesSessions({ ready: false, hostname: 'h' }), false)
    assert.equal(canUseHermesSessions({ ready: true }), false)
    assert.equal(canUseHermesSessions(mine), true)
    assert.equal(hermesDashboardChatUrl(null), '')
    assert.equal(hermesSessionsApiUrl({ ready: false }), '')
  })
})

describe('native dashboard surfaces', () => {
  it('opens chat on the tenant hostname, not the console origin', () => {
    assert.equal(
      hermesDashboardChatUrl(mine),
      'https://agent-me.brenon.cloud/hermes/chat'
    )
    assert.equal(
      hermesDashboardChatUrl(mine, 'abc-1'),
      'https://agent-me.brenon.cloud/hermes/chat?resume=abc-1'
    )
    assert.equal(hermesDashboardChatUrl(mine).includes('console.brenon.cloud'), false)
  })

  it('lists from the same sessions API the native dashboard uses', () => {
    assert.equal(
      hermesSessionsApiUrl(mine),
      'https://agent-me.brenon.cloud/hermes/api/sessions?limit=20&order=recent'
    )
  })
})

describe('normalizeHermesSessions', () => {
  it('keeps title and recency from the native payload', () => {
    const rows = normalizeHermesSessions({
      sessions: [
        { id: 'old', title: 'Older', last_active: 10 },
        { id: 'new', title: 'Newer', last_active: 50 }
      ]
    })
    assert.equal(rows[0].id, 'new')
    assert.equal(rows[0].title, 'Newer')
    assert.equal(rows[0].lastActive, 50)
    assert.equal(rows[1].title, 'Older')
  })

  it('drops rows without an id', () => {
    assert.deepEqual(normalizeHermesSessions({ sessions: [{ title: 'x' }] }), [])
  })
})

describe('classifyHermesSurfaceError', () => {
  it('names console, tenant, edge, or missing instance', () => {
    assert.equal(classifyHermesSurfaceError(null, { hasInstance: false }), 'instance')
    assert.equal(
      classifyHermesSurfaceError(new Error('control.brenon.cloud 502'), { hasInstance: true }),
      'console'
    )
    assert.equal(
      classifyHermesSurfaceError(Object.assign(new Error('tenant 502'), { status: 502 }), {
        hasInstance: true
      }),
      'tenant'
    )
    assert.equal(
      classifyHermesSurfaceError(new Error('Failed to fetch'), {
        hasInstance: true,
        consoleUnreachable: true,
        tenantUnreachable: true
      }),
      'edge'
    )
  })

  it('does not classify Failed to fetch on the sessions GET as edge', () => {
    assert.equal(
      classifyHermesSurfaceError(new Error('Failed to fetch'), { hasInstance: true }),
      'tenant'
    )
    assert.equal(
      classifyHermesSurfaceError(new Error('NetworkError when attempting to fetch resource.'), {
        hasInstance: true
      }),
      'tenant'
    )
    assert.equal(
      classifyHermesSurfaceError(Object.assign(new Error('tenant 401'), { status: 401 }), {
        hasInstance: true
      }),
      'tenant'
    )
    assert.equal(
      classifyHermesSurfaceError(Object.assign(new Error('tenant 302'), { status: 302 }), {
        hasInstance: true
      }),
      'tenant'
    )
  })
})

describe('fetchHermesNativeSessions', () => {
  it('does not send the console token to the tenant', async () => {
    resetHermesMetrics()
    const calls = []
    const fetchImpl = async (url, opts) => {
      calls.push({ url, opts })
      return {
        ok: true,
        json: async () => ({ sessions: [{ id: 's1', title: 'Hello', last_active: 9 }] })
      }
    }
    const out = await fetchHermesNativeSessions(mine, fetchImpl)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url.includes('/hermes/api/sessions'), true)
    assert.equal(calls[0].opts.credentials, 'include')
    assert.equal(Boolean(calls[0].opts.headers?.Authorization), false)
    assert.equal(out.sessions[0].title, 'Hello')
    assert.equal(hermesMetricCounts().list, 1)
  })

  it('refuses to list when there is no instance', async () => {
    resetHermesMetrics()
    const fetchImpl = async () => {
      throw new Error('should not fetch')
    }
    const out = await fetchHermesNativeSessions(null, fetchImpl)
    assert.deepEqual(out.sessions, [])
    assert.equal(out.kind, 'instance')
    assert.equal(hermesMetricCounts().refuse, 1)
    assert.equal(hermesMetricCounts().list, 0)
  })

  it('classifies Failed to fetch from the tenant sessions GET as tenant, not edge', async () => {
    const fetchImpl = async () => {
      throw new Error('Failed to fetch')
    }
    const out = await fetchHermesNativeSessions(mine, fetchImpl)
    assert.deepEqual(out.sessions, [])
    assert.equal(out.kind, 'tenant')
  })
})

describe('openNativeSurface', () => {
  it('leaves the console for a new surface on the given url', () => {
    resetHermesMetrics()
    const calls = []
    const ok = openNativeSurface('https://agent-me.brenon.cloud/hermes', (href, target, features) => {
      calls.push({ href, target, features })
    })
    assert.equal(ok, true)
    assert.equal(calls[0].href, 'https://agent-me.brenon.cloud/hermes')
    assert.equal(calls[0].target, '_blank')
    assert.equal(String(calls[0].features).includes('noopener'), true)
    assert.equal(hermesMetricCounts().launch, 1)
  })

  it('does not open a blank window without a url', () => {
    const calls = []
    assert.equal(openNativeSurface('', (href) => calls.push(href)), false)
    assert.equal(calls.length, 0)
  })
})

describe('metrics and logs', () => {
  it('counts resume and never logs conversation PII', () => {
    resetHermesMetrics()
    noteHermesMetric('resume')
    assert.equal(hermesMetricCounts().resume, 1)
    const line = hermesSurfaceLog('list', 'tenant')
    assert.equal(line.event, 'list')
    assert.equal(line.kind, 'tenant')
    assert.equal(JSON.stringify(line).includes('@'), false)
  })
})

describe('dock chrome contracts (#32)', () => {
  it('keeps the TUI iframe and does not revive console chat', () => {
    const dock = readFileSync(new URL('../src/components/HermesDock.vue', import.meta.url), 'utf8')
    const api = readFileSync(new URL('../src/api/hermesApi.js', import.meta.url), 'utf8')
    const sessions = readFileSync(new URL('../src/api/hermesSessions.js', import.meta.url), 'utf8')
    assert.match(dock, /<iframe/)
    assert.match(dock, /hermesTuiUrl/)
    assert.equal(dock.includes('sendHermesChat'), false)
    assert.equal(api.includes('sendHermesChat'), false)
    assert.equal(api.includes('/api/v1/hermes/chat'), false)
    assert.equal(sessions.includes('/api/v1/hermes/chat'), false)
    assert.equal(sessions.includes('Authorization'), false)
  })

  it('lists native sessions in chrome and launches dashboard in a new surface', () => {
    const dock = readFileSync(new URL('../src/components/HermesDock.vue', import.meta.url), 'utf8')
    const chrome = readFileSync(
      new URL('../src/components/HermesDockSessions.vue', import.meta.url),
      'utf8'
    )
    assert.match(dock, /HermesDockSessions/)
    assert.match(chrome, /hermesDashboardChatUrl/)
    assert.match(chrome, /openNativeSurface/)
    assert.match(chrome, /console\.site\.dockNew/)
    assert.match(chrome, /console\.site\.dockOpenDashboard/)
    assert.match(chrome, /target="_blank"/)
    assert.equal(chrome.includes('<iframe'), false)
    assert.equal(chrome.includes('sendHermesChat'), false)
  })

  it('does not treat minimize as a new session', () => {
    const store = readFileSync(new URL('../src/stores/hermesDockStore.js', import.meta.url), 'utf8')
    assert.match(store, /function startChat\(\) \{\n    open\.value = true/)
    assert.doesNotMatch(store, /function startChat\(\) \{\s*nonce\.value \+= 1/)
    assert.match(store, /function close\(\) \{\n    open\.value = false/)
    assert.doesNotMatch(store, /function close\(\) \{\s*nonce/)
    assert.match(store, /function newSession\(\)/)
    assert.match(store, /nonce\.value \+= 1/)
  })
})

describe('Hermes page dashboard shortcut', () => {
  it('adds open dashboard next to terminal / TUI / public page', () => {
    const page = readFileSync(new URL('../src/pages/console/Hermes.vue', import.meta.url), 'utf8')
    assert.match(page, /console\.hermes\.cliOpen/)
    assert.match(page, /console\.hermes\.tuiOpen/)
    assert.match(page, /console\.hermes\.openPage/)
    assert.match(page, /console\.hermes\.openDashboard/)
    assert.match(page, /hermesDashboardUrl/)
    assert.match(page, /target="_blank"/)
    assert.equal(page.includes('<iframe'), false)
    assert.equal(page.includes('sendHermesChat'), false)
  })
})
