import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isLiveOidc, SITE_HOME, postLogoutRedirectUri } from '../src/config/auth.js'

describe('preview auth (OIDC live is issue #6)', () => {
  it('does not enable live OIDC in this extract', () => {
    assert.equal(isLiveOidc(), false)
  })

  it('logs out to the company site, not the console apex', () => {
    assert.equal(postLogoutRedirectUri(), SITE_HOME)
    assert.equal(postLogoutRedirectUri(), 'https://brenon.cloud/')
  })
})
