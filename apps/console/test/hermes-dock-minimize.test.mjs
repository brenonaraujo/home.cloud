import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createPinia, setActivePinia } from 'pinia'
import { retainLiveInstance } from '../src/api/hermesApi.js'
import { useHermesDockStore } from '../src/stores/hermesDockStore.js'

const live = { email: 'me@x', ready: true, hostname: 'agent-me.brenon.cloud' }

describe('retainLiveInstance', () => {
  it('keeps the hot instance when the catalog fetch fails', () => {
    assert.equal(retainLiveInstance(live, null, false), live)
  })

  it('drops the iframe host when the catalog says the tenant is gone', () => {
    assert.equal(retainLiveInstance(live, null, true), null)
  })

  it('adopts a newly ready instance', () => {
    const next = { email: 'me@x', ready: true, hostname: 'agent-new.brenon.cloud' }
    assert.equal(retainLiveInstance(live, next, true), next)
  })

  it('does not invent a console chat when there was never an instance', () => {
    assert.equal(retainLiveInstance(null, null, false), null)
  })
})

describe('hermesDockStore minimize vs remount', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hide then show does not bump nonce (same TUI session)', () => {
    const dock = useHermesDockStore()
    dock.startChat()
    const nonce = dock.nonce
    dock.close()
    assert.equal(dock.lastEvent, 'hide')
    dock.startChat()
    assert.equal(dock.open, true)
    assert.equal(dock.nonce, nonce)
    assert.equal(dock.lastEvent, 'show')
  })

  it('toggle does not treat minimize as restart', () => {
    const dock = useHermesDockStore()
    dock.startChat()
    const nonce = dock.nonce
    dock.toggle()
    dock.toggle()
    assert.equal(dock.nonce, nonce)
    assert.equal(dock.lastEvent, 'show')
  })

  it('restart is the explicit remount path, not hide', () => {
    const dock = useHermesDockStore()
    dock.startChat()
    dock.restart()
    assert.equal(dock.nonce, 1)
    assert.equal(dock.lastEvent, 'restart')
  })

  it('a fresh store is a cold console load, not a minimize', () => {
    const dock = useHermesDockStore()
    assert.equal(dock.open, false)
    assert.equal(dock.nonce, 0)
    assert.equal(dock.lastEvent, 'idle')
  })
})

describe('HermesDock hide keeps ttyd WebSocket', () => {
  const dock = readFileSync(new URL('../src/components/HermesDock.vue', import.meta.url), 'utf8')
  const api = readFileSync(new URL('../src/api/hermesApi.js', import.meta.url), 'utf8')
  const store = readFileSync(new URL('../src/stores/hermesDockStore.js', import.meta.url), 'utf8')

  it('does not use visibility or display none on the hidden panel', () => {
    assert.match(dock, /is-hidden/)
    assert.doesNotMatch(dock, /visibility:\s*hidden/)
    assert.doesNotMatch(dock, /display:\s*none/)
    assert.match(dock, /\.hermes-panel\.is-hidden[\s\S]*opacity:\s*0/)
  })

  it('keeps the iframe mounted and does not fall back to console chat', () => {
    assert.doesNotMatch(dock, /v-if="dock\.open"/)
    assert.match(dock, /<iframe/)
    assert.equal(dock.includes('sendHermesChat'), false)
    assert.equal(api.includes('/api/v1/hermes/chat'), false)
    assert.equal(dock.includes('dockNew'), false)
    assert.equal(dock.includes('HermesDockSessions'), false)
  })

  it('catalog errors keep the live instance instead of unmounting', () => {
    assert.match(dock, /retainLiveInstance/)
    assert.doesNotMatch(dock, /instance\.value = null\n    if \(dock\.open\)/)
  })

  it('startChat does not remount; restart does', () => {
    assert.doesNotMatch(store, /function startChat\(\) \{\s*nonce\.value \+= 1/)
    assert.match(store, /function restart\(\) \{\n    nonce\.value \+= 1/)
  })
})
