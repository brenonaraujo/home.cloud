import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCatalogService, visibleForGroups } from '../src/config/console-acl.mjs'

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
