import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { agentSlug, humanHermesError, stripAgentPrefix } from '../src/api/hermesApi.js'

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
})
