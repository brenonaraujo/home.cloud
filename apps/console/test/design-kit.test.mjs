import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwind from '../tailwind.config.js'
import {
  accessKeys,
  instanceStatus,
  needsSessionRefresh,
  planFeatureRows,
  planInfo
} from '../src/config/console-plans.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(root, '..', '..')
const read = (rel) => readFileSync(join(root, rel), 'utf8')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const vueFiles = walk(join(root, 'src')).filter((f) => f.endsWith('.vue'))

function hex(h) {
  const n = h.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
}
function luminance(h) {
  const [r, g, b] = hex(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('bc-ui tokens (#44 fase 1)', () => {
  const colors = tailwind.theme.extend.colors

  it('derives the brand scale from the logo lime', () => {
    assert.equal(colors.brand[500], '#76b900')
    for (const step of ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']) {
      assert.match(colors.brand[step], /^#[0-9a-f]{6}$/, step)
    }
  })

  it('declares semantic, surface, line and fg tokens', () => {
    for (const name of ['info', 'success', 'warning', 'danger', 'surface', 'line', 'fg']) {
      assert.ok(colors[name], name)
    }
    assert.ok(colors.surface.raised && colors.surface.overlay)
    assert.ok(colors.fg.muted && colors.fg.subtle && colors.fg.inverse)
    assert.ok(colors.line.strong)
    assert.deepEqual(Object.keys(tailwind.theme.extend.borderRadius).sort(), ['card', 'control', 'overlay'])
  })

  it('meets WCAG AA on every surface', () => {
    const surfaces = ['#030712', '#111827', '#1f2937']
    for (const bg of surfaces) {
      assert.ok(contrast('#8b93a1', bg) >= 4.5, `fg-subtle on ${bg}`)
      assert.ok(contrast('#9ca3af', bg) >= 4.5, `fg-muted on ${bg}`)
      assert.ok(contrast('#6b7280', bg) >= 3, `line-strong on ${bg}`)
    }
    assert.ok(contrast('#030712', colors.brand[500]) >= 4.5, 'dark text on brand-500')
    assert.ok(contrast(colors.brand[300], '#111827') >= 4.5, 'brand-300 text on raised')
  })

  it('focuses every control with focus-visible and respects reduced motion', () => {
    const css = read('src/style.css')
    assert.match(css, /:focus-visible/)
    assert.match(css, /prefers-reduced-motion: reduce/)
    assert.match(css, /scrollbar-color/)
  })
})

describe('no loose styling in screens (#44 acceptance)', () => {
  const offenders = (pattern) =>
    vueFiles.filter((f) => pattern.test(readFileSync(f, 'utf8'))).map((f) => relative(root, f))

  it('has no text under 12px', () => {
    assert.deepEqual(offenders(/text-\[(?:[0-9]|1[01])px\]/), [])
  })

  it('has no low-contrast grays for text', () => {
    assert.deepEqual(offenders(/text-gray-(?:500|600|700)/), [])
  })

  it('uses tokens instead of raw palettes for chrome', () => {
    assert.deepEqual(offenders(/\b(?:bg|text|border)-(?:blue|gray|amber|emerald|orange)-\d{2,3}/), [])
    assert.deepEqual(offenders(/border-white\/|rounded-(?:md|lg|xl|3xl)\b/), [])
  })

  it('keeps orange out of the Hermes FAB', () => {
    const dock = read('src/components/HermesDock.vue')
    assert.equal(dock.includes('#f4911e'), false)
    assert.match(dock, /colors\.brand\.500/)
  })
})

describe('bc-ui components (#44 fase 1)', () => {
  const kit = [
    'BcAlert', 'BcBadge', 'BcButton', 'BcCheckbox', 'BcCopy', 'BcDescriptionList', 'BcDialog',
    'BcEmptyState', 'BcField', 'BcInput', 'BcMenu', 'BcMenuItem', 'BcPageHeader', 'BcPanel',
    'BcSelect', 'BcServiceCard', 'BcServiceRow', 'BcSkeleton', 'BcSplash', 'BcStatus', 'BcTabs', 'BcTextarea'
  ]

  it('ships every component and exports it from the index', () => {
    const index = read('src/components/bc/index.js')
    for (const name of kit) {
      assert.equal(existsSync(join(root, `src/components/bc/${name}.vue`)), true, name)
      assert.match(index, new RegExp(`as ${name} }`), name)
    }
  })

  it('announces alerts and status through live roles', () => {
    const alert = read('src/components/bc/BcAlert.vue')
    assert.match(alert, /'alert' : 'status'/)
    const layout = read('src/layouts/ConsoleLayout.vue')
    assert.match(layout, /aria-live="polite"/)
  })

  it('traps focus in dialogs, closes on Esc and returns focus', () => {
    const dialog = read('src/components/bc/BcDialog.vue')
    const trap = read('src/composables/useFocusTrap.js')
    assert.match(dialog, /aria-modal="true"/)
    assert.match(dialog, /useFocusTrap/)
    assert.match(trap, /'Escape'/)
    assert.match(trap, /returnTo\.focus\(\)/)
  })

  it('marks external buttons for screen readers', () => {
    const button = read('src/components/bc/BcButton.vue')
    assert.match(button, /target === '_blank'/)
    assert.match(button, /bc\.newTab/)
    assert.match(button, /noopener noreferrer/)
  })

  it('exposes /_kit only in development', () => {
    const main = read('src/main.js')
    assert.match(main, /import\.meta\.env\.DEV[\s\S]*_kit[\s\S]*Kit\.vue/)
  })

  it('documents the kit and records the decision', () => {
    assert.equal(existsSync(join(repo, 'docs/design-kit.md')), true)
    const adrs = readdirSync(join(repo, 'docs/adr'))
    assert.ok(adrs.some((f) => /design-kit/.test(f)), 'ADR for bc-ui')
  })
})

describe('screens (#44 fases 2 e 3)', () => {
  it('Hermes: one primary action per context and delete only in the danger zone', () => {
    const page = read('src/pages/console/Hermes.vue')
    const template = page.slice(0, page.indexOf('<script'))
    const card = template.slice(template.indexOf('Instance card'), template.indexOf('<BcTabs'))
    assert.equal((card.match(/variant="primary"/g) || []).length, 1)
    assert.match(card, /<BcMenu/)
    assert.doesNotMatch(card, /askDestroy/)
    assert.match(template, /dangerTitle[\s\S]*askDestroy/)
    assert.match(template, /<BcDialog[\s\S]*confirmText\.trim\(\) !== pendingName/)
    assert.match(template, /<BcTabs/)
  })

  it('cards use a container-friendly grid and a stretched link', () => {
    const card = read('src/components/bc/BcServiceCard.vue')
    assert.match(card, /after:absolute after:inset-0/)
    for (const page of ['Home', 'Services']) {
      const src = read(`src/pages/console/${page}.vue`)
      assert.doesNotMatch(src, /lg:grid-cols-3/, page)
      assert.match(src, /xl:grid-cols-3/, page)
    }
  })

  it('hides the FAB under the drawer and pads main while it is visible', () => {
    const layout = read('src/layouts/ConsoleLayout.vue')
    const dock = read('src/components/HermesDock.vue')
    assert.match(layout, /dock\.suppressed = open/)
    assert.match(layout, /dock\.visible \? 'pb-28'/)
    assert.match(dock, /!dock\.suppressed/)
  })

  it('search follows the APG combobox and opens as a sheet on phones', () => {
    const search = read('src/components/console/ConsoleSearch.vue')
    assert.match(search, /aria-activedescendant/)
    assert.match(search, /sm:w-\[max\(100%,24rem\)\]/)
    assert.match(search, /openSheet/)
    assert.match(search, /sm:hidden/)
  })
})

describe('plans and access helpers', () => {
  it('shows the same rows on every plan card', () => {
    const keys = (id) => planFeatureRows({ id }).map((r) => r.key)
    assert.deepEqual(keys('free'), keys('basic'))
    assert.deepEqual(keys('basic'), keys('pro'))
    assert.equal(planFeatureRows({ id: 'free' }).find((r) => r.key === 'hermes').included, false)
    assert.deepEqual(planFeatureRows({ id: 'pro' }).find((r) => r.key === 'resources').values, { ram: 4, cpu: 2, gb: 20 })
  })

  it('maps the legacy hermes plan to Basic', () => {
    assert.equal(planInfo('hermes').id, 'basic')
    assert.equal(planInfo('nope').id, 'free')
  })

  it('asks for a session refresh only when Stripe is ahead of the groups', () => {
    assert.equal(needsSessionRefresh(['plan-free'], { plan: 'basic', status: 'active' }), true)
    assert.equal(needsSessionRefresh(['plan-basic'], { plan: 'basic', status: 'active' }), false)
    assert.equal(needsSessionRefresh(['plan-free'], { plan: 'basic', status: 'canceled' }), false)
    assert.equal(needsSessionRefresh(['plan-free'], {}), false)
  })

  it('turns raw groups into customer-facing access labels', () => {
    assert.deepEqual(accessKeys(['plan-basic', 'hermes-owner', 'bankdefi-admin', 'random']), ['planBasic', 'hermesOperator', 'staff'])
    assert.deepEqual(accessKeys([]), [])
  })

  it('maps instance rows to status tones', () => {
    assert.equal(instanceStatus({ status: 'running', ready: true }), 'active')
    assert.equal(instanceStatus({ status: 'running', ready: false }), 'starting')
    assert.equal(instanceStatus({ status: 'provisioning' }), 'starting')
    assert.equal(instanceStatus({ status: 'stopped' }), 'stopped')
    assert.equal(instanceStatus({ status: 'running', ready: true, error: 'boom' }), 'error')
    assert.equal(instanceStatus(null), 'stopped')
  })
})
