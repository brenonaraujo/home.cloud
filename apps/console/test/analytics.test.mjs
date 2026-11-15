import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyOptOut,
  cleanReferrer,
  resolveAnalyticsConfig,
  trackedPath,
  trackingDecision
} from '../src/analytics.js'

function mem() {
  const m = new Map()
  return {
    getItem: (k) => m.has(k) ? m.get(k) : null,
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k)
  }
}

test('config off unless url and website id are both set', () => {
  assert.equal(resolveAnalyticsConfig('', '3022cb3f-2a04-45e2-ad3f-d0926a01d544'), null)
  assert.equal(resolveAnalyticsConfig('https://analytics.brenon.cloud', '  '), null)
  assert.deepEqual(
    resolveAnalyticsConfig('https://analytics.brenon.cloud/', '3022cb3f-2a04-45e2-ad3f-d0926a01d544'),
    {
      scriptUrl: 'https://analytics.brenon.cloud/script.js',
      websiteId: '3022cb3f-2a04-45e2-ad3f-d0926a01d544'
    }
  )
})

test('route pattern, never the real id or the login callback', () => {
  assert.equal(trackedPath({ name: 'overview' }), '/')
  assert.equal(trackedPath({ name: 'console-service' }), '/services/:id')
  assert.equal(trackedPath({ name: 'auth-callback' }), null)
  assert.equal(trackedPath({ name: 'auth-continue' }), null)
  assert.equal(trackedPath({ name: 'console-kit' }), null)
  assert.equal(trackedPath({ name: 'console-not-found' }), '/404')
  assert.equal(trackedPath({}), null)
})

test('decision stays off for opt-out, DNT and localhost', () => {
  const route = { name: 'console-billing' }
  assert.deepEqual(trackingDecision({ route, host: 'console.brenon.cloud' }), { url: '/billing' })
  assert.equal(trackingDecision({ route, optedOut: true, host: 'console.brenon.cloud' }), null)
  assert.equal(trackingDecision({ route, doNotTrack: true, host: 'console.brenon.cloud' }), null)
  assert.equal(trackingDecision({ route, host: 'localhost' }), null)
})

test('opt out sticks until cleared', () => {
  const storage = mem()
  assert.equal(applyOptOut('?nocount=1', storage), true)
  assert.equal(applyOptOut('', storage), true)
  assert.equal(applyOptOut('?nocount=0', storage), false)
})

test('same-origin referrer keeps only a measured pattern', () => {
  const origin = 'https://console.brenon.cloud'
  assert.equal(cleanReferrer(`${origin}/services/draw?x=1`, origin), '')
  assert.equal(cleanReferrer(`${origin}/billing?checkout=success`, origin), '/billing')
  assert.equal(cleanReferrer(`${origin}/auth/callback?code=1`, origin), '')
  assert.equal(cleanReferrer('https://brenon.cloud/?utm=1', origin), 'https://brenon.cloud/')
})
