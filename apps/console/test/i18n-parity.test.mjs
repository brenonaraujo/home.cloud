import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function flatten(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [prefix]
}

describe('i18n en + pt (ADR-0001)', () => {
  it('ships en.json and pt.json, not es', () => {
    assert.equal(existsSync(join(root, 'src/locales/en.json')), true)
    assert.equal(existsSync(join(root, 'src/locales/pt.json')), true)
    assert.equal(existsSync(join(root, 'src/locales/es.json')), false)
    assert.equal(existsSync(join(root, 'src/locales/pt-BR.json')), false)
  })

  it('keeps the same keys in en and pt', () => {
    const en = JSON.parse(readFileSync(join(root, 'src/locales/en.json'), 'utf8'))
    const pt = JSON.parse(readFileSync(join(root, 'src/locales/pt.json'), 'utf8'))
    const enKeys = flatten(en).sort()
    const ptKeys = flatten(pt).sort()
    assert.deepEqual(ptKeys, enKeys)
  })
})
