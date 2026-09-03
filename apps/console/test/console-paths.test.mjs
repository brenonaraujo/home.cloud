import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HOUSE_STATUS, PATHS, SITE_HOME } from '../src/config/console-paths.mjs'

describe('console paths — apex is overview, no /console prefix', () => {
  it('sends the member home to /', () => {
    assert.equal(PATHS.overview, '/')
  })

  it('keeps member routes unprefixed', () => {
    assert.equal(PATHS.services, '/services')
    assert.equal(PATHS.service('draw'), '/services/draw')
    assert.equal(PATHS.hermes, '/hermes')
    assert.equal(PATHS.account, '/account')
    assert.equal(PATHS.billing, '/billing')
    assert.equal(PATHS.notifications, '/notifications')
  })

  it('does not keep the blog /console prefix on any path constant', () => {
    const values = [
      PATHS.overview,
      PATHS.services,
      PATHS.service('x'),
      PATHS.hermes,
      PATHS.account,
      PATHS.billing,
      PATHS.notifications
    ]
    for (const value of values) {
      assert.equal(String(value).startsWith('/console'), false, value)
    }
  })

  it('points back to the company site with an absolute URL', () => {
    assert.equal(SITE_HOME, 'https://brenon.cloud/')
  })

  it('points house health at the existing platform status surface', () => {
    assert.equal(HOUSE_STATUS, 'https://uptime.brenon.cloud/status/services')
  })
})
