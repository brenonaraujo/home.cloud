import { SITE_HOME } from './console-paths.mjs'

/** Placeholder client for issue #6. This extract does not talk to the IdP. */
export const AUTH_ISSUER = 'https://auth.brenon.cloud/application/o/console/'
export const AUTH_CLIENT_ID = 'console'
export { SITE_HOME }

export function isLiveOidc() {
  const env = import.meta.env || {}
  return env.VITE_OIDC_LIVE === '1'
}

export function authRedirectUri() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/auth/callback`
}

/** After logout always land on the public company site. */
export function postLogoutRedirectUri() {
  return SITE_HOME
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
