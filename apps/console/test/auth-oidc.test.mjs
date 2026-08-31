import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AUTH_CALLBACK_PATH,
  AUTH_CLIENT_ID,
  AUTH_CONTINUE_PATH,
  AUTH_ISSUER,
  SITE_CLIENT_ID,
  SITE_HOME,
  identityFailureKind,
  isLiveOidc,
  oidcSettings,
  postLogoutRedirectUri
} from '../src/config/auth.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('OIDC client console is not the site client', () => {
  it('uses client_id console and never reuses brenon-cloud', () => {
    assert.equal(AUTH_CLIENT_ID, 'console')
    assert.equal(SITE_CLIENT_ID, 'brenon-cloud')
    assert.notEqual(AUTH_CLIENT_ID, SITE_CLIENT_ID)
    assert.equal(oidcSettings().client_id, 'console')
    assert.match(AUTH_ISSUER, /\/application\/o\/console\/$/)
    assert.doesNotMatch(AUTH_ISSUER, /\/application\/o\/home\//)
  })

  it('keeps preview off live OIDC and turns it on for the public console host', () => {
    assert.equal(isLiveOidc({}, ''), false)
    assert.equal(isLiveOidc({}, 'localhost'), false)
    assert.equal(isLiveOidc({}, 'brenon.cloud'), false)
    assert.equal(isLiveOidc({}, 'console.brenon.cloud'), true)
    assert.equal(isLiveOidc({ VITE_OIDC_LIVE: '1' }, 'localhost'), true)
    assert.equal(isLiveOidc({ VITE_OIDC_LIVE: '0' }, 'console.brenon.cloud'), false)
  })

  it('logs out to the company site, never an empty console shell', () => {
    assert.equal(postLogoutRedirectUri(), SITE_HOME)
    assert.equal(postLogoutRedirectUri(), 'https://brenon.cloud/')
    assert.equal(AUTH_CALLBACK_PATH, '/auth/callback')
    assert.equal(AUTH_CONTINUE_PATH, '/auth/continue')
  })

  it('names identity failures without PII', () => {
    assert.equal(identityFailureKind('login_new'), 'login_new')
    assert.equal(identityFailureKind('session'), 'session')
    assert.equal(identityFailureKind('user@example.com token abc'), 'login_new')
  })
})

describe('console shell stays gated', () => {
  it('does not render the shell without a house session', () => {
    const layout = readFileSync(join(root, 'src/layouts/ConsoleLayout.vue'), 'utf8')
    assert.match(layout, /auth\.ready && auth\.isAuthenticated/)
    assert.match(layout, /auth\.signingIn|auth\.identityError/)
    assert.doesNotMatch(layout, /aria-hidden="true" \/>/)
  })

  it('ships AuthCallback and AuthContinue pages', () => {
    assert.equal(existsSync(join(root, 'src/pages/AuthCallback.vue')), true)
    assert.equal(existsSync(join(root, 'src/pages/AuthContinue.vue')), true)
    const main = readFileSync(join(root, 'src/main.js'), 'utf8')
    assert.match(main, /path: AUTH_CALLBACK_PATH|path: '\/auth\/callback'/)
    assert.match(main, /path: AUTH_CONTINUE_PATH|path: '\/auth\/continue'/)
  })
})

describe('i18n auth copy', () => {
  it('has login, logout and identity error keys in en and pt', () => {
    const en = JSON.parse(readFileSync(join(root, 'src/locales/en.json'), 'utf8'))
    const pt = JSON.parse(readFileSync(join(root, 'src/locales/pt.json'), 'utf8'))
    for (const key of ['signingIn', 'completing', 'continuing', 'identityError', 'retry']) {
      assert.equal(typeof en.auth[key], 'string')
      assert.equal(typeof pt.auth[key], 'string')
    }
    assert.equal(typeof en.navbar.logout, 'string')
    assert.equal(typeof pt.navbar.logout, 'string')
  })
})

