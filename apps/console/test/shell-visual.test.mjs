import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = (rel) => readFileSync(join(root, 'src', rel), 'utf8')

describe('shell visual language — mobile + tokens', () => {
  it('keeps the member shell from overflowing horizontally', () => {
    const layout = src('layouts/ConsoleLayout.vue')
    assert.match(layout, /overflow-x-hidden/)
    assert.match(layout, /min-w-0/)
  })

  it('uses a mobile drawer, not a persistent sidebar, below lg', () => {
    const sidebar = src('components/console/ConsoleSidebar.vue')
    assert.match(sidebar, /console-drawer/)
    assert.match(sidebar, /-translate-x-full/)
    assert.match(sidebar, /lg:static/)
    assert.match(sidebar, /fixed inset-0/)
  })

  it('keeps search and menu tap targets at least 44px', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    const search = src('components/console/ConsoleSearch.vue')
    assert.match(topbar, /min-h-\[44px\].*min-w-\[44px\]/)
    assert.match(search, /(?:min-h-\[44px\]|h-11)/)
  })

  it('hides secondary topbar chrome below lg so 768px stays usable with the hamburger', () => {
    const topbar = src('components/console/ConsoleTopbar.vue')
    assert.match(topbar, /lg:hidden/)
    assert.match(topbar, /hidden[\s\S]*lg:inline-flex/)
    assert.match(topbar, /lg:flex/)
    assert.match(topbar, /hidden[\s\S]*lg:block/)
    assert.doesNotMatch(topbar, /sm:inline-flex/)
    assert.doesNotMatch(topbar, /sm:flex/)
    assert.doesNotMatch(topbar, /hidden sm:block/)
  })

  it('closes the drawer with Escape', () => {
    const layout = src('layouts/ConsoleLayout.vue')
    assert.match(layout, /Escape/)
  })

  it('declares shared shell tokens (not a second lime palette)', () => {
    const css = src('style.css')
    assert.match(css, /--color-bg:\s*#030712/)
    assert.match(css, /--color-primary:\s*#3b82f6/)
    assert.equal(css.includes('#a3e635'), false)
  })
})
