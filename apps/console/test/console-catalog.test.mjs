import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CONTROL_URL,
  isControlService,
  normalizeCatalogService,
  visibleForGroups
} from '../src/config/console-acl.mjs'
import { CONSOLE_SERVICES } from '../src/config/console-registry.js'
import { buildNotifications } from '../src/config/console-overview.mjs'
import { groupServices, serviceKind } from '../src/config/console-taxonomy.mjs'

describe('normalizeCatalogService', () => {
  it('maps control-plane catalog rows to console tiles', () => {
    const row = normalizeCatalogService({
      id: 'konga',
      title: { en: 'Konga', pt: 'Konga' },
      description: { en: 'Kong admin UI', pt: 'UI do Kong' },
      url: 'https://konga.brenon.cloud',
      groups: ['api-owner'],
      icon: 'settings',
      color: 'purple'
    })
    assert.equal(row.id, 'konga')
    assert.equal(row.url, 'https://konga.brenon.cloud')
    assert.deepEqual(row.groups, ['api-owner'])
    assert.equal(row.icon, 'settings')
    assert.equal(row.kind, '')
  })

  it('keeps optional kind from the control plane', () => {
    const row = normalizeCatalogService({
      id: 'draw',
      url: 'https://draw.brenon.cloud',
      groups: ['*'],
      kind: 'application'
    })
    assert.equal(row.kind, 'application')
  })

  it('accepts launchUrl and consoleGroups aliases', () => {
    const row = normalizeCatalogService({
      id: 'x',
      name: 'X',
      launchUrl: 'https://x.brenon.cloud',
      consoleGroups: ['brenon-admins']
    })
    assert.equal(row.url, 'https://x.brenon.cloud')
    assert.deepEqual(row.groups, ['brenon-admins'])
    assert.equal(row.title.en, 'X')
  })
})

describe('visibleForGroups', () => {
  const catalog = [
    { id: 'draw', groups: ['*'], url: 'https://draw.brenon.cloud' },
    { id: 'konga', groups: ['api-owner'], url: 'https://konga.brenon.cloud' },
    { id: 'portainer', groups: ['brenon-admins'], url: 'https://portainer.brenon.cloud' }
  ]

  it('shows wildcard tiles to any signed-in account', () => {
    const apps = visibleForGroups(catalog, ['plan-free'])
    assert.deepEqual(apps.map((a) => a.id), ['draw'])
  })

  it('shows konga only when the session has api-owner', () => {
    const without = visibleForGroups(catalog, ['brenon-admins'])
    assert.equal(without.some((a) => a.id === 'konga'), false)
    const withRole = visibleForGroups(catalog, ['brenon-admins', 'api-owner'])
    assert.deepEqual(withRole.map((a) => a.id), ['draw', 'konga', 'portainer'])
  })

  it('matches group names case-insensitively', () => {
    const apps = visibleForGroups(catalog, ['API-OWNER'])
    assert.equal(apps.some((a) => a.id === 'konga'), true)
  })
})

describe('Control tile — staff group, never plan, never *', () => {
  const draw = { id: 'draw', groups: ['*'], url: 'https://draw.brenon.cloud' }
  const control = {
    id: 'control',
    groups: ['brenon-admins'],
    url: CONTROL_URL,
    kind: 'platform'
  }
  const catalog = [draw, control]

  it('recognizes the control host as a platform Control tile', () => {
    assert.equal(isControlService(control), true)
    assert.equal(isControlService(draw), false)
    assert.equal(serviceKind(control), 'platform')
    assert.deepEqual(groupServices(catalog).platform.map((s) => s.id), ['control'])
  })

  it('hides Control from free and paid members without a staff group', () => {
    assert.equal(visibleForGroups(catalog, ['plan-free']).some((s) => s.id === 'control'), false)
    assert.equal(
      visibleForGroups(catalog, ['plan-pro', 'plan-hermes']).some((s) => s.id === 'control'),
      false
    )
  })

  it('shows Control to an operator on the free plan and opens the control host', () => {
    const apps = visibleForGroups(catalog, ['plan-free', 'brenon-admins'])
    const tile = apps.find((s) => s.id === 'control')
    assert.ok(tile)
    assert.equal(tile.url, 'https://control.brenon.cloud')
  })

  it('never treats * as enough to reveal Control', () => {
    const starred = [{ id: 'control', groups: ['*'], url: CONTROL_URL }]
    assert.equal(visibleForGroups(starred, ['plan-free']).some((s) => s.id === 'control'), false)
    assert.equal(visibleForGroups(starred, ['plan-pro']).some((s) => s.id === 'control'), false)
    assert.equal(visibleForGroups(starred, ['brenon-admins']).some((s) => s.id === 'control'), false)
  })

  it('does not invent a Control tile in the offline fallback registry', () => {
    assert.equal(CONSOLE_SERVICES.some((s) => s.id === 'control'), false)
    assert.equal(
      CONSOLE_SERVICES.some((s) => String(s.url).includes('control.brenon.cloud')),
      false
    )
  })

  it('does not treat a missing Control tile as a catalog load failure', () => {
    const memberTiles = visibleForGroups(catalog, ['plan-free'])
    assert.equal(memberTiles.some((s) => s.id === 'control'), false)
    assert.equal(memberTiles.some((s) => s.id === 'draw'), true)
    const notes = buildNotifications({ catalogOffline: false, groups: ['plan-free'] })
    assert.equal(notes.some((n) => n.id === 'catalog-offline'), false)
  })
})
