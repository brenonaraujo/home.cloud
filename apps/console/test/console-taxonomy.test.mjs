import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { factsFor } from '../src/config/console-service-facts.mjs'
import { humanBillingError } from '../src/config/console-billing.mjs'
import { readEntitlement, writeEntitlement } from '../src/config/console-entitlement.mjs'
import { visibleForGroups } from '../src/config/console-acl.mjs'
import {
  canManageHermes,
  groupServices,
  displayPlan,
  hermesDiskGb,
  hermesQuota,
  isHermesOperator,
  isHermesSubscriber,
  isStaff,
  primaryPlan,
  searchServices,
  serviceKind
} from '../src/config/console-taxonomy.mjs'
import {
  prefsKey,
  readPrefs,
  recordVisit,
  lastVisitAt,
  resolveByIds,
  toggleFavorite,
  setSidebarFavoritesHidden,
  markNotificationsRead,
  unreadNotifications,
  paginate
} from '../src/config/console-prefs.mjs'
import {
  formatRelativeTime,
  serviceAccess,
  serviceDetails,
  servicePlan
} from '../src/config/console-service-details.mjs'

describe('serviceKind', () => {
  it('treats wildcard products as applications', () => {
    assert.equal(serviceKind({ id: 'draw', groups: ['*'] }), 'application')
  })

  it('treats known ops consoles as platform', () => {
    assert.equal(serviceKind({ id: 'konga', groups: ['api-owner'] }), 'platform')
    assert.equal(serviceKind({ id: 'portainer', groups: ['brenon-admins'] }), 'platform')
    assert.equal(serviceKind({ id: 'authentik', groups: ['brenon-admins'] }), 'platform')
    assert.equal(serviceKind({ id: 'vserver', groups: ['brenon-admins', 'brenon-ops'] }), 'platform')
  })

  it('honors explicit kind from the control plane', () => {
    assert.equal(serviceKind({ id: 'draw', groups: ['*'], kind: 'platform' }), 'platform')
    assert.equal(serviceKind({ id: 'custom', category: 'product' }), 'application')
  })
})

describe('groupServices / searchServices', () => {
  const catalog = [
    { id: 'draw', groups: ['*'], title: { en: 'Draw', pt: 'Draw' }, description: { en: 'Whiteboard', pt: 'Quadro' }, url: 'https://draw.brenon.cloud' },
    { id: 'grafana', groups: ['brenon-admins'], title: { en: 'Grafana' }, description: { en: 'Metrics' }, url: 'https://grafana.brenon.cloud' }
  ]

  it('splits application vs platform', () => {
    const grouped = groupServices(catalog)
    assert.deepEqual(grouped.applications.map((s) => s.id), ['draw'])
    assert.deepEqual(grouped.platform.map((s) => s.id), ['grafana'])
  })

  it('searches title, host and id', () => {
    assert.deepEqual(searchServices(catalog, 'draw').map((s) => s.id), ['draw'])
    assert.deepEqual(searchServices(catalog, 'grafana.brenon').map((s) => s.id), ['grafana'])
    assert.equal(searchServices(catalog, 'nope').length, 0)
  })
})

describe('plans and hermes access', () => {
  it('prefers an active Stripe plan over a stale JWT', () => {
    assert.equal(displayPlan(['plan-free'], { plan: 'basic', status: 'active' }), 'basic')
    assert.equal(displayPlan(['plan-free'], { plan: 'pro', status: 'trialing' }), 'pro')
    assert.equal(displayPlan(['plan-free'], { plan: 'basic', status: 'canceled' }), 'free')
    assert.equal(displayPlan(['plan-free'], { plan: 'free', status: 'none' }), 'free')
  })

  it('prefers plan-pro, then basic (even with plan-hermes), then hermes, then free', () => {
    assert.equal(primaryPlan(['plan-free', 'plan-pro']), 'pro')
    assert.equal(primaryPlan(['plan-free', 'plan-basic', 'plan-hermes']), 'basic')
    assert.equal(primaryPlan(['plan-free', 'plan-hermes']), 'hermes')
    assert.equal(primaryPlan(['plan-free', 'plan-basic']), 'basic')
    assert.equal(primaryPlan(['plan-free']), 'free')
    assert.equal(primaryPlan([]), 'free')
  })

  it('keeps staff distinct from the hermes subscriber', () => {
    assert.equal(isStaff(['brenon-admins']), true)
    assert.equal(isStaff(['plan-free']), false)
    assert.equal(isHermesSubscriber(['plan-hermes']), true)
    assert.equal(isHermesSubscriber(['plan-pro']), true)
    assert.equal(isHermesSubscriber(['plan-basic']), true)
    assert.equal(isHermesSubscriber(['hermes-owner']), false)
    assert.equal(isHermesOperator(['hermes-owner']), true)
    assert.equal(canManageHermes(['plan-hermes']), true)
    assert.equal(canManageHermes(['plan-pro']), true)
    assert.equal(canManageHermes(['plan-basic']), true)
    assert.equal(canManageHermes(['hermes-owner']), true)
    assert.equal(canManageHermes(['plan-free']), false)
    assert.equal(hermesDiskGb(['plan-basic']), 5)
    assert.equal(hermesDiskGb(['plan-pro']), 20)
    assert.equal(hermesDiskGb(['plan-free']), 0)
    assert.deepEqual(hermesQuota(['plan-basic']), { diskGb: 5, memoryGb: 2, cpus: 1 })
    assert.deepEqual(hermesQuota(['plan-pro']), { diskGb: 20, memoryGb: 4, cpus: 2 })
  })
})

describe('console prefs', () => {
  it('records recents and favorites per account', () => {
    const storage = new Map()
    const mem = {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v)
    }
    recordVisit(mem, 'a@x.com', 'draw')
    recordVisit(mem, 'a@x.com', 'grafana')
    recordVisit(mem, 'a@x.com', 'draw')
    toggleFavorite(mem, 'a@x.com', 'draw')
    const prefs = readPrefs(mem, 'a@x.com')
    assert.deepEqual(prefs.recent, ['draw', 'grafana'])
    assert.deepEqual(prefs.favorites, ['draw'])
    assert.equal(prefs.sidebarFavoritesHidden, false)
    assert.ok(lastVisitAt(prefs, 'draw'))
    assert.ok(lastVisitAt(prefs, 'grafana'))
    assert.equal(lastVisitAt(prefs, 'missing'), null)
    assert.equal(prefsKey('A@x.com'), 'brenon-console:a@x.com')
    const resolved = resolveByIds(
      [{ id: 'draw' }, { id: 'grafana' }],
      prefs.recent
    )
    assert.deepEqual(resolved.map((s) => s.id), ['draw', 'grafana'])
    const hidden = setSidebarFavoritesHidden(mem, 'a@x.com', true)
    assert.equal(hidden.sidebarFavoritesHidden, true)
    assert.deepEqual(hidden.favorites, ['draw'])
    assert.equal(readPrefs(mem, 'a@x.com').sidebarFavoritesHidden, true)
    const shown = setSidebarFavoritesHidden(mem, 'a@x.com', false)
    assert.equal(shown.sidebarFavoritesHidden, false)
  })

  it('marks notifications read and paginates', () => {
    const storage = new Map()
    const mem = {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v)
    }
    markNotificationsRead(mem, 'a@x.com', ['catalog-offline'])
    const items = [{ id: 'catalog-offline' }, { id: 'hermes-provision' }]
    const unread = unreadNotifications(items, readPrefs(mem, 'a@x.com').readNotifications)
    assert.deepEqual(unread.map((i) => i.id), ['hermes-provision'])
    const lots = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }))
    const p2 = paginate(lots, 2, 10)
    assert.equal(p2.page, 2)
    assert.equal(p2.pages, 3)
    assert.equal(p2.items.length, 10)
    assert.equal(p2.items[0].id, '10')
  })
})

describe('catalog ACL (no SPA tile bypass)', () => {
  const catalog = [
    { id: 'draw', groups: ['*'], url: 'https://draw.brenon.cloud' },
    { id: 'authentik', groups: ['brenon-admins'], url: 'https://auth.brenon.cloud/if/admin/' },
    { id: 'console-air', groups: ['*'], url: 'https://akash.brenon.cloud' }
  ]

  it('hides Authentik from free and shows it to admins only when the catalog says so', () => {
    assert.equal(visibleForGroups(catalog, ['plan-free']).some((s) => s.id === 'authentik'), false)
    assert.equal(visibleForGroups(catalog, ['brenon-admins']).some((s) => s.id === 'authentik'), true)
  })

  it('shows Console Air to any signed-in account including free when the catalog lists it', () => {
    assert.equal(visibleForGroups(catalog, ['plan-free']).some((s) => s.id === 'console-air'), true)
    assert.equal(serviceKind({ id: 'console-air', groups: ['*'] }), 'platform')
  })

  it('does not invent tiles that are missing from the catalog', () => {
    const onlyDraw = [{ id: 'draw', groups: ['*'], url: 'https://draw.brenon.cloud' }]
    assert.equal(visibleForGroups(onlyDraw, ['brenon-admins']).some((s) => s.id === 'authentik'), false)
  })
})

describe('service facts', () => {
  it('returns real host copy for Console Air and Draw', () => {
    const air = factsFor('console-air', 'en')
    assert.equal(air.plan, 'free')
    assert.match(air.bullets[0], /akash\.brenon\.cloud/)
    const draw = factsFor('draw', 'pt')
    assert.match(draw.bullets[0], /draw\.brenon\.cloud/)
  })
})

describe('service details', () => {
  it('covers VServer with staff facts, not a free default', () => {
    const vs = factsFor('vserver', 'pt')
    assert.equal(vs.plan, 'staff')
    assert.ok(vs.bullets[0].includes('vserver.brenon.cloud'))
    const svc = {
      id: 'vserver',
      groups: ['brenon-admins', 'brenon-ops'],
      url: 'https://vserver.brenon.cloud'
    }
    assert.equal(serviceAccess(svc), 'staff')
    assert.equal(servicePlan(svc), 'staff')
    assert.ok(serviceDetails(svc, 'en').bullets[0].includes('vserver.brenon.cloud'))
  })

  it('derives details for a catalog service without hardcoded facts', () => {
    const svc = { id: 'new-lab', groups: ['brenon-admins'], url: 'https://lab.brenon.cloud' }
    const details = serviceDetails(svc, 'en')
    assert.equal(details.plan, 'staff')
    assert.equal(details.access, 'staff')
    assert.equal(details.host, 'lab.brenon.cloud')
    assert.ok(details.bullets[0].includes('lab.brenon.cloud'))
    const any = serviceDetails({ id: 'board', groups: ['*'], url: 'https://draw.brenon.cloud' }, 'pt')
    assert.equal(any.plan, 'free')
    assert.equal(any.access, 'any')
  })
})

describe('last visit timestamps', () => {
  it('reads old prefs without lastVisit as empty', () => {
    const storage = new Map()
    const mem = {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v)
    }
    storage.set('brenon-console:a@x.com', JSON.stringify({ recent: ['draw'], favorites: [] }))
    const prefs = readPrefs(mem, 'a@x.com')
    assert.deepEqual(prefs.lastVisit, {})
    assert.equal(lastVisitAt(prefs, 'draw'), null)
  })

  it('records a timestamp and formats relative time', () => {
    const storage = new Map()
    const mem = {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v)
    }
    const at = Date.now() - 2 * 60 * 60 * 1000
    recordVisit(mem, 'a@x.com', 'vserver', at)
    const prefs = readPrefs(mem, 'a@x.com')
    assert.equal(lastVisitAt(prefs, 'vserver'), at)
    const rel = formatRelativeTime(at, Date.now(), 'en')
    assert.ok(rel.includes('hour'))
    assert.equal(formatRelativeTime(0, Date.now(), 'en'), '')
  })
})

describe('billing errors and plan copy', () => {
  it('does not surface Load failed to the member', () => {
    assert.equal(humanBillingError(new Error('Load failed'), 'soon'), 'soon')
    assert.equal(humanBillingError(new Error('Failed to fetch'), 'soon'), 'soon')
    assert.equal(humanBillingError(new Error('stripe price not configured'), 'soon'), 'stripe price not configured')
  })

  it('keeps Pro features as a list, not a vue-i18n plural pipe', async () => {
    const { readFile } = await import('node:fs/promises')
    const pt = JSON.parse(await readFile(new URL('../src/locales/pt.json', import.meta.url), 'utf8'))
    const en = JSON.parse(await readFile(new URL('../src/locales/en.json', import.meta.url), 'utf8'))
    assert.equal(Array.isArray(pt.console.billing.features.pro), true)
    assert.equal(Array.isArray(en.console.billing.features.pro), true)
    assert.match(pt.console.billing.hermesOwn, /instância Hermes/)
    assert.match(en.console.billing.hermesOwn, /Hermes instance/)
    assert.equal(String(pt.console.billing.features.free).includes('|'), false)
  })
})

describe('entitlement cache', () => {
  it('round-trips a paid plan and expires after 24h', () => {
    const storage = new Map()
    const mem = {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    }
    writeEntitlement(mem, 'a@x.com', { plan: 'basic', status: 'active', customerId: 'cus_1' })
    const hit = readEntitlement(mem, 'a@x.com')
    assert.equal(hit.plan, 'basic')
    assert.equal(hit.status, 'active')
    assert.equal(hit.customerId, 'cus_1')
    const stale = JSON.parse(storage.get('brenon-console-plan:a@x.com'))
    stale.at = Date.now() - 25 * 60 * 60 * 1000
    storage.set('brenon-console-plan:a@x.com', JSON.stringify(stale))
    assert.equal(readEntitlement(mem, 'a@x.com'), null)
  })
})
