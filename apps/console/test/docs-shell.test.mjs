import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (rel) => readFileSync(join(repo, rel), 'utf8')

describe('contract: one shell, two hosts', () => {
  it('documents a shared visual language without merging the control git', () => {
    const spec = read('SPEC.md')
    const arch = read('ARCHITECTURE.md')
    assert.match(spec, /shell único, dois hosts/i)
    assert.match(spec, /control\.brenon\.cloud/)
    assert.match(spec, /mesmo idioma visual/i)
    assert.match(arch, /shell único, dois hosts/i)
    assert.match(arch, /não fundir git/i)
  })

  it('keeps #8 301 parked in this GO', () => {
    const spec = read('SPEC.md')
    const arch = read('ARCHITECTURE.md')
    assert.match(spec, /sem 301/i)
    assert.match(arch, /301.*não está neste GO|não.*301/i)
  })

  it('does not ship a Netlify _redirects 301 for /console', () => {
    const taxonomy = read('docs/taxonomy.md')
    assert.match(taxonomy, /console\.brenon\.cloud/)
    assert.match(taxonomy, /control\.brenon\.cloud/)
  })
})
