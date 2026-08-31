import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  agentSlug,
  hermesTuiUrl,
  humanHermesError,
  pickReadyHermesInstance,
  stripAgentPrefix
} from '../src/api/hermesApi.js'

describe('humanHermesError', () => {
  it('does not surface fetch failures', () => {
    assert.equal(humanHermesError(new Error('Failed to fetch'), 'soon'), 'soon')
    assert.equal(humanHermesError(new Error('Load failed'), 'soon'), 'soon')
    assert.equal(humanHermesError(new Error('Basic or Pro required'), 'soon'), 'Basic or Pro required')
  })
})

describe('agentSlug', () => {
  it('locks the agent- prefix', () => {
    assert.equal(agentSlug('brenonaraujo'), 'agent-brenonaraujo')
    assert.equal(agentSlug('agent-studio'), 'agent-studio')
    assert.equal(stripAgentPrefix('agent-agent-x'), 'x')
  })
})

describe('pickReadyHermesInstance', () => {
  it('prefers the ready row for the signed-in email', () => {
    const mine = { email: 'me@x', ready: true, hostname: 'agent-me.brenon.cloud' }
    const other = { email: 'you@x', ready: true, hostname: 'agent-you.brenon.cloud' }
    assert.equal(pickReadyHermesInstance([other, mine], 'me@x'), mine)
  })

  it('falls back to the first ready hostname when emails do not match', () => {
    const ready = { email: 'stored@x', ready: true, hostname: 'agent-brenonaraujo.brenon.cloud' }
    assert.equal(pickReadyHermesInstance([ready], 'jwt@x'), ready)
  })

  it('ignores rows that are not ready to chat', () => {
    assert.equal(
      pickReadyHermesInstance([{ email: 'me@x', ready: false, hostname: 'h' }], 'me@x'),
      null
    )
  })
})

describe('hermesTuiUrl', () => {
  it('uses tuiUrl from the API when present', () => {
    assert.equal(
      hermesTuiUrl({ tuiUrl: 'https://agent-x.brenon.cloud/hermes/tui' }),
      'https://agent-x.brenon.cloud/hermes/tui'
    )
  })

  it('falls back to /hermes/tui on the instance hostname', () => {
    assert.equal(
      hermesTuiUrl({ hostname: 'agent-brenonaraujo.brenon.cloud' }),
      'https://agent-brenonaraujo.brenon.cloud/hermes/tui'
    )
  })

  it('returns empty when the backend has not published a host yet', () => {
    assert.equal(hermesTuiUrl({}), '')
    assert.equal(hermesTuiUrl(null), '')
  })
})

describe('Hermes dock stays on brenon.cloud', () => {
  it('does not iframe or link out to the tenant dashboard', () => {
    const dock = readFileSync(new URL('../src/components/HermesDock.vue', import.meta.url), 'utf8')
    const page = readFileSync(new URL('../src/pages/console/Hermes.vue', import.meta.url), 'utf8')
    for (const src of [dock, page]) {
      assert.equal(src.includes('<iframe'), false)
      assert.equal(src.includes('hermes/sessions'), false)
      assert.equal(src.includes('hermes-mascot'), false)
      assert.equal(/href=.*\/hermes['"]/.test(src), false)
    }
    assert.match(dock, /sendHermesChat/)
    assert.match(dock, /hermes-fab/)
  })

  it('keeps the chat panel visible after startChat even if canChat is still false', () => {
    const dock = readFileSync(new URL('../src/components/HermesDock.vue', import.meta.url), 'utf8')
    assert.doesNotMatch(dock, /v-if="canChat"/)
    assert.match(dock, /v-if="showDock"/)
    assert.match(dock, /pickReadyHermesInstance/)
    assert.match(dock, /dockEmptyReply/)
  })
})

describe('Hermes TUI button (#21)', () => {
  it('adds Abrir Hermes no terminal without replacing Abrir terminal', () => {
    const page = readFileSync(new URL('../src/pages/console/Hermes.vue', import.meta.url), 'utf8')
    assert.match(page, /console\.hermes\.cliOpen/)
    assert.match(page, /pageInstance\.cliUrl/)
    assert.match(page, /console\.hermes\.tuiOpen/)
    assert.match(page, /hermesTuiUrl/)
    assert.match(page, /min-h-\[44px\]/)
    assert.equal(page.includes('ttyd'), false)
  })
})
