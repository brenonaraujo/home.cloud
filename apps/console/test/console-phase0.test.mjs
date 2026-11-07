import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_TITLE, htmlLang, pageTitle } from '../src/config/console-title.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => readFileSync(join(root, rel), 'utf8')
const locale = (lang) => JSON.parse(read(`src/locales/${lang}.json`))

function lookup(obj, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj)
}

describe('unknown routes (#44 fase 0)', () => {
  const main = read('src/main.js')

  it('has a catch-all inside the console layout', () => {
    assert.match(main, /path: ':pathMatch\(\.\*\)\*'.*ConsoleNotFound/)
  })

  it('redirects old /console/* bookmarks to the unprefixed path', () => {
    assert.match(main, /path: '\/console\/:rest\(\.\*\)\*'/)
    assert.match(main, /redirect: \(to\) =>/)
  })

  it('ships the not-found copy in en and pt', () => {
    for (const lang of ['en', 'pt']) {
      for (const key of ['title', 'body', 'back']) {
        assert.equal(typeof locale(lang).console.notFound[key], 'string', `${lang}.${key}`)
      }
    }
  })
})

describe('document.title per route (#44 fase 0)', () => {
  it('formats page titles with the brand', () => {
    assert.equal(pageTitle('Billing'), 'Billing · Brenon Cloud')
    assert.equal(pageTitle(''), DEFAULT_TITLE)
    assert.equal(pageTitle('  '), DEFAULT_TITLE)
  })

  it('maps the UI locale to <html lang>', () => {
    assert.equal(htmlLang('pt'), 'pt-BR')
    assert.equal(htmlLang('en'), 'en')
  })

  it('gives every console route a titleKey that exists in en and pt', () => {
    const main = read('src/main.js')
    const keys = [...main.matchAll(/titleKey: '([^']+)'/g)].map((m) => m[1])
    assert.ok(keys.length >= 8, `found ${keys.length} titleKeys`)
    for (const lang of ['en', 'pt']) {
      for (const key of keys) {
        assert.equal(typeof lookup(locale(lang), key), 'string', `${lang}: ${key}`)
      }
    }
  })
})

describe('user menu keyboard (#44 fase 0)', () => {
  const topbar = read('src/components/console/ConsoleTopbar.vue')

  it('opens from the trigger with the arrow keys', () => {
    assert.match(topbar, /@keydown\.down\.prevent="openMenu\(0\)"/)
    assert.match(topbar, /@keydown\.up\.prevent="openMenu\(-1\)"/)
  })

  it('handles arrows, Home/End and Esc with focus back on the trigger', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'Tab']) {
      assert.match(topbar, new RegExp(`case '${key}'`), key)
    }
    assert.match(topbar, /closeMenu\(\{ restoreFocus: true \}\)/)
  })

  it('keeps menu items out of the tab order (roving focus)', () => {
    const items = topbar.match(/role="menuitem"\s+tabindex="-1"/g) || []
    assert.equal(items.length, 3)
  })
})
