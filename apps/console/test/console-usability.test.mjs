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

function headerClass(topbar) {
  const match = topbar.match(/<header class="([^"]+)"/)
  assert.ok(match, 'topbar header class')
  return match[1]
}

describe('issue #39 — session identity is operable, not just declared', () => {
  it('does not clip the session menu inside the topbar', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const cls = headerClass(topbar)
    assert.equal(cls.includes('overflow-hidden'), false)
    assert.match(cls, /\bz-(30|40|50)\b/)
  })

  it('keeps the session identity control from shrinking away at 375', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const start = topbar.indexOf('ref="menuRoot"')
    assert.ok(start > 0)
    const trigger = topbar.slice(Math.max(0, start - 80), topbar.indexOf('role="menu"'))
    assert.match(trigger, /relative shrink-0/)
    assert.match(trigger, /min-h-\[44px\]/)
    assert.match(trigger, /min-w-\[44px\]/)
    assert.doesNotMatch(trigger, /\bhidden\b/)
  })

  it('keeps the session label visible on every SPEC width', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const label = topbar.match(/<span class="([^"]+)"[^>]*>\{\{\s*sessionLabel/)
    assert.ok(label, 'visible sessionLabel in the identity control')
    assert.doesNotMatch(label[1], /\bhidden\b/)
  })

  it('recognizes a session without a display name via email', () => {
    const ui = src('composables/useConsoleUi.js')
    const match = ui.match(
      /export function sessionIdentityLabel\(displayName, email\) \{\n([\s\S]*?)\n\}/
    )
    assert.ok(match, 'sessionIdentityLabel is exported')
    const sessionIdentityLabel = new Function('displayName', 'email', match[1])
    assert.equal(sessionIdentityLabel('Ada Lovelace', 'ada@house'), 'Ada Lovelace')
    assert.equal(sessionIdentityLabel('', 'ada@house'), 'ada@house')
    assert.equal(sessionIdentityLabel('   ', 'ada@house'), 'ada@house')
    assert.equal(sessionIdentityLabel('', ''), '')
  })

  it('does not offer dead account actions without a house session', () => {
    const layout = src('layouts/ConsoleLayout.vue')
    const unauth = layout.slice(layout.indexOf('v-else'))
    assert.ok(unauth.length > 0)
    assert.doesNotMatch(unauth, /to="\/account"/)
    assert.doesNotMatch(unauth, /to="\/billing"/)
    assert.doesNotMatch(unauth, /auth\.logout/)
    assert.match(unauth, /auth\.signingIn/)
    assert.match(unauth, /auth\.identityError/)
  })

  it('keeps account, billing and sign-out copy in en and pt', () => {
    const en = JSON.parse(src('locales/en.json'))
    const pt = JSON.parse(src('locales/pt.json'))
    for (const key of ['account', 'billing', 'sessionMenu']) {
      assert.equal(typeof en.console.nav[key], 'string')
      assert.equal(typeof pt.console.nav[key], 'string')
      assert.notEqual(en.console.nav[key], pt.console.nav[key])
    }
    assert.equal(typeof en.navbar.logout, 'string')
    assert.equal(typeof pt.navbar.logout, 'string')
    assert.notEqual(en.navbar.logout, pt.navbar.logout)
    assert.equal(typeof en.console.account.name, 'string')
    assert.equal(typeof pt.console.account.name, 'string')
    assert.equal(typeof en.console.account.email, 'string')
    assert.equal(typeof pt.console.account.email, 'string')
    assert.equal(typeof en.console.account.plan, 'string')
    assert.equal(typeof pt.console.account.plan, 'string')
  })
})
