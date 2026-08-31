import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_HOME } from '../src/config/console-paths.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(root, 'src')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

describe('extracted shell contract', () => {
  it('uses https://brenon.cloud/ for back-to-site, not a local / route', () => {
    const hits = walk(srcRoot)
      .filter((file) => /\.(vue|js|mjs)$/.test(file))
      .filter((file) => readFileSync(file, 'utf8').includes('console.nav.backToSite'))
    assert.ok(hits.length > 0, 'expected back-to-site copy in the shell')
    for (const file of hits) {
      const src = readFileSync(file, 'utf8')
      let from = 0
      let found = 0
      while (from < src.length) {
        const pos = src.indexOf("console.nav.backToSite", from)
        if (pos < 0) break
        found += 1
        const window = src.slice(Math.max(0, pos - 400), pos)
        assert.match(window, /SITE_HOME|https:\/\/brenon\.cloud\//)
        from = pos + 1
      }
      assert.ok(found > 0)
    }
    assert.equal(SITE_HOME, 'https://brenon.cloud/')
  })

  it('does not keep /console prefixed router links in vue templates', () => {
    const vueFiles = walk(srcRoot).filter((file) => file.endsWith('.vue'))
    const leftover = []
    for (const file of vueFiles) {
      const src = readFileSync(file, 'utf8')
      if (/to=["']\/console/.test(src) || /to=\{['"]\/console/.test(src)) leftover.push(file)
    }
    assert.deepEqual(leftover, [])
  })

  it('does not commit secrets', () => {
    const files = walk(srcRoot)
    const secret = /(sk_live|sk_test|whsec_|AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH )?PRIVATE KEY)/
    for (const file of files) {
      if (file.endsWith('.png')) continue
      const src = readFileSync(file, 'utf8')
      assert.equal(secret.test(src), false, file)
    }
  })

  it('does not put @ or | inside t() string literals', () => {
    const files = walk(srcRoot).filter((file) => /\.(vue|js|mjs)$/.test(file))
    const bad = []
    const re = /\bt\(\s*(['"`])([^'"`]*?)\1/g
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      let match
      while ((match = re.exec(src))) {
        const arg = match[2]
        if (arg.includes('@') || arg.includes('|')) bad.push(`${file}: t('${arg}')`)
      }
    }
    assert.deepEqual(bad, [])
  })
})
