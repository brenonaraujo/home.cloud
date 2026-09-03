import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visibleForGroups } from '../src/config/console-acl.mjs'
import { CONSOLE_SERVICES } from '../src/config/console-registry.js'
import { HOUSE_STATUS, SITE_HOME } from '../src/config/console-paths.mjs'
import { catalogQueryResult, searchServices } from '../src/config/console-taxonomy.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = (rel) => readFileSync(join(root, 'src', rel), 'utf8')

const catalog = [
  {
    id: 'draw',
    groups: ['*'],
    title: { en: 'Draw', pt: 'Draw' },
    description: { en: 'Shared whiteboard', pt: 'Quadro compartilhado' },
    url: 'https://draw.brenon.cloud'
  },
  {
    id: 'authentik',
    groups: ['brenon-admins'],
    title: { en: 'Authentik', pt: 'Authentik' },
    description: { en: 'Identity operator console', pt: 'Console do operador de identidade' },
    url: 'https://auth.brenon.cloud/if/admin/'
  },
  {
    id: 'control',
    groups: ['brenon-admins'],
    title: { en: 'Control', pt: 'Control' },
    description: { en: 'Control plane', pt: 'Plano de controle' },
    url: 'https://control.brenon.cloud'
  }
]

describe('AC-1 — three subjects, three destinations', () => {
  it('keeps account, billing and notices out of the catalog sidebar', () => {
    const sidebar = src('components/console/ConsoleSidebar.vue')
    assert.doesNotMatch(sidebar, /to="\/account"/)
    assert.doesNotMatch(sidebar, /to="\/billing"/)
    assert.doesNotMatch(sidebar, /to="\/notifications"/)
  })

  it('reaches house health and company site from house chrome, not as catalog tiles', () => {
    const sidebar = src('components/console/ConsoleSidebar.vue')
    assert.match(sidebar, /HOUSE_STATUS/)
    assert.match(sidebar, /SITE_HOME/)
    assert.equal(HOUSE_STATUS, 'https://uptime.brenon.cloud/status/services')
    assert.equal(SITE_HOME, 'https://brenon.cloud/')
    assert.equal(
      CONSOLE_SERVICES.some((s) => String(s.url).includes('uptime.brenon.cloud')),
      false
    )
    assert.equal(
      CONSOLE_SERVICES.some((s) => s.id === 'status'),
      false
    )
  })

  it('reaches account and billing from session identity, not as catalog peers', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const menuStart = topbar.indexOf('role="menu"')
    assert.ok(menuStart > 0)
    const menu = topbar.slice(menuStart)
    assert.match(menu, /to="\/account"/)
    assert.match(menu, /to="\/billing"/)
    assert.match(menu, /auth\.logout/)
    assert.doesNotMatch(menu, /\/notifications/)
    assert.doesNotMatch(menu, /HOUSE_STATUS|uptime\.brenon\.cloud/)
    assert.match(topbar.slice(0, menuStart), /to="\/notifications"/)
  })

  it('does not put account, billing or notices on home as catalog peers', () => {
    const home = src('pages/console/Home.vue')
    assert.doesNotMatch(home, /to="\/account"/)
    assert.doesNotMatch(home, /to="\/billing"/)
    assert.doesNotMatch(home, /to="\/notifications"/)
  })
})

describe('AC-2 — search is a live recut of the published catalog', () => {
  it('matches name or description as the query changes, without inventing tiles', () => {
    assert.deepEqual(searchServices(catalog, 'white').map((s) => s.id), ['draw'])
    assert.deepEqual(searchServices(catalog, 'Draw').map((s) => s.id), ['draw'])
    const hits = searchServices(catalog, 'nope')
    assert.deepEqual(hits, [])
    assert.equal(
      searchServices(catalog, 'authentik').every((s) => catalog.some((row) => row.id === s.id)),
      true
    )
    assert.deepEqual(searchServices([], 'draw'), [])
  })

  it('treats a miss as an empty recut, not a catalog load failure', () => {
    const miss = catalogQueryResult(catalog, 'nope', 'en', null)
    assert.deepEqual(miss.items, [])
    assert.equal(miss.emptyMatch, true)
    assert.equal(miss.catalogFailed, false)
    const failed = catalogQueryResult([], 'draw', 'en', 'catalog')
    assert.deepEqual(failed.items, [])
    assert.equal(failed.emptyMatch, false)
    assert.equal(failed.catalogFailed, true)
  })

  it('hides staff and control from a paid member without an operator group', () => {
    const member = visibleForGroups(catalog, ['plan-pro'])
    assert.deepEqual(member.map((s) => s.id), ['draw'])
    assert.deepEqual(searchServices(member, 'authentik'), [])
    assert.deepEqual(searchServices(member, 'control'), [])
    assert.deepEqual(searchServices(member, 'Draw').map((s) => s.id), ['draw'])
  })

  it('filters the catalog as the member types, with no extra confirm step', () => {
    const search = src('components/console/ConsoleSearch.vue')
    const services = src('pages/console/Services.vue')
    const home = src('pages/console/Home.vue')
    assert.match(search, /v-model="query"/)
    assert.doesNotMatch(search, /type="submit"|@submit/)
    assert.doesNotMatch(search, /id: 'account'|id: 'billing'|id: 'notifications'/)
    assert.match(search, /searchFor/)
    assert.match(services, /searchQuery/)
    assert.match(home, /searchQuery/)
    assert.match(home, /console\.search\.empty/)
  })
})

describe('AC-3 — first surface on a phone is the catalog', () => {
  it('keeps search in the topbar on every width', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    assert.match(topbar, /<div class="min-w-0 flex-1">\s*<ConsoleSearch/)
  })

  it('keeps identity menu targets at least 44px', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const menu = topbar.slice(topbar.indexOf('role="menu"'))
    assert.match(menu, /min-h-\[44px\]/)
  })
})

describe('AC-5 — back is not logout; health is not catalog', () => {
  it('lands logout on the public site and back on the company hostname', () => {
    const auth = src('stores/authStore.js')
    const topbar = src('components/console/ConsoleTopbar.vue')
    assert.match(auth, /postLogoutRedirectUri/)
    assert.match(topbar, /auth\.logout/)
    assert.equal(SITE_HOME, 'https://brenon.cloud/')
  })
})
