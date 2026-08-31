import { SITE_HOME } from './console-paths.mjs'

export const AUTH_ISSUER = 'https://auth.brenon.cloud/application/o/console/'
export const AUTH_CLIENT_ID = 'console'
export const SITE_CLIENT_ID = 'brenon-cloud'
export const AUTH_CALLBACK_PATH = '/auth/callback'
export const AUTH_CONTINUE_PATH = '/auth/continue'
export const ENROLLMENT_FLOW = 'https://auth.brenon.cloud/if/flow/bankdefi-enrollment-flow/'
export const LIVE_HOSTNAME = 'console.brenon.cloud'
export { SITE_HOME }

const FAILURES = new Set(['login_new', 'session'])

export function isLiveOidc(env = import.meta.env || {}, hostname = liveHostname()) {
  if (env.VITE_OIDC_LIVE === '0') return false
  if (env.VITE_OIDC_LIVE === '1') return true
  return hostname === LIVE_HOSTNAME
}

function liveHostname() {
  if (typeof window === 'undefined') return ''
  return window.location.hostname
}

export function authRedirectUri() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${AUTH_CALLBACK_PATH}`
}

export function postLogoutRedirectUri() {
  return SITE_HOME
}

export function enrollmentContinueUri() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${AUTH_CONTINUE_PATH}`
}

export function identityFailureKind(value) {
  const key = String(value || '').trim()
  if (FAILURES.has(key)) return key
  return 'login_new'
}

export function oidcSettings() {
  return {
    authority: AUTH_ISSUER,
    client_id: AUTH_CLIENT_ID,
    redirect_uri: authRedirectUri(),
    post_logout_redirect_uri: postLogoutRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email all_groups',
    loadUserInfo: true,
    automaticSilentRenew: false
  }
}

export const PREVIEW_USER = {
  access_token: 'preview',
  id_token: 'preview',
  expired: false,
  profile: {
    name: 'Preview Operator',
    preferred_username: 'preview',
    email: 'preview@local',
    groups: ['plan-free']
  }
}
