import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  billingSnapshot,
  buildNotifications,
  currentPeriodLabel,
  formatMoney
} from '../src/config/console-overview.mjs'

describe('billingSnapshot', () => {
  it('is zero and prefers the hermes plan', () => {
    const snap = billingSnapshot(['plan-free', 'plan-hermes'])
    assert.equal(snap.plan, 'hermes')
    assert.equal(snap.amountCents, 0)
    assert.equal(snap.currency, 'BRL')
    assert.deepEqual(snap.invoices, [])
  })
})

describe('formatMoney / period', () => {
  it('formats BRL in pt-BR', () => {
    assert.match(formatMoney(0, 'BRL', 'pt'), /R\$\s*0/)
  })

  it('labels the given month', () => {
    const label = currentPeriodLabel('en', new Date('2026-08-15T12:00:00Z'))
    assert.match(label, /August/)
    assert.match(label, /2026/)
  })
})

describe('buildNotifications', () => {
  it('is empty for a signed-in free account with a live catalog', () => {
    assert.deepEqual(buildNotifications({ groups: ['plan-free'] }), [])
  })

  it('warns when the catalog is offline', () => {
    const items = buildNotifications({ catalogOffline: true, groups: ['plan-free'] })
    assert.equal(items[0].id, 'catalog-offline')
    assert.equal(items[0].level, 'warning')
  })

  it('points hermes subscribers at the instances page', () => {
    const items = buildNotifications({ groups: ['plan-hermes'] })
    assert.equal(items.some((i) => i.id === 'hermes-provision' && i.to === '/hermes'), true)
  })
})
