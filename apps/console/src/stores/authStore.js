import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { UserManager } from 'oidc-client-ts'
import {
  ENROLLMENT_FLOW,
  enrollmentContinueUri,
  identityFailureKind,
  isLiveOidc,
  oidcSettings,
  postLogoutRedirectUri,
  PREVIEW_USER
} from '../config/auth.js'
import { PATHS } from '../config/console-paths.mjs'
import { useEntitlementStore } from './entitlementStore'

let manager
let loginStarted = false

function getManager() {
  if (!manager) manager = new UserManager(oidcSettings())
  return manager
}

function clearEntitlement() {
  try {
    useEntitlementStore().clear()
  } catch {
    /* pinia may not be ready in tests */
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(user.value?.access_token || user.value?.id_token))
  const displayName = computed(() => {
    const p = user.value?.profile || {}
    return p.name || p.preferred_username || p.email || ''
  })
  const email = computed(() => user.value?.profile?.email || '')
  const username = computed(() => user.value?.profile?.preferred_username || '')
  const idToken = computed(() => user.value?.id_token || '')
  const groups = computed(() => {
    const raw = user.value?.profile?.groups || user.value?.profile?.all_groups || ''
    if (Array.isArray(raw)) return raw.filter(Boolean)
    return String(raw).split(',').map((g) => g.trim()).filter(Boolean)
  })

  async function hydrate() {
    error.value = null
    if (!isLiveOidc()) {
      user.value = PREVIEW_USER
      ready.value = true
      return
    }
    try {
      const current = await getManager().getUser()
      user.value = current && !current.expired ? current : null
    } catch {
      error.value = identityFailureKind('session')
      user.value = null
    } finally {
      ready.value = true
    }
  }

  async function login(returnTo = PATHS.overview) {
    if (!isLiveOidc()) {
      user.value = PREVIEW_USER
      ready.value = true
      return
    }
    if (loginStarted) return
    const next = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : PATHS.overview
    loginStarted = true
    try {
      await getManager().signinRedirect({ state: { returnTo: next } })
    } catch {
      loginStarted = false
      error.value = identityFailureKind('login_new')
      throw new Error('login_new')
    }
  }

  function signup() {
    if (!isLiveOidc()) {
      user.value = PREVIEW_USER
      ready.value = true
      return
    }
    const next = encodeURIComponent(enrollmentContinueUri())
    window.location.href = `${ENROLLMENT_FLOW}?next=${next}`
  }

  async function completeLogin() {
    if (!isLiveOidc()) {
      user.value = PREVIEW_USER
      ready.value = true
      return PATHS.overview
    }
    const result = await getManager().signinRedirectCallback()
    user.value = result
    ready.value = true
    const returnTo = result?.state?.returnTo
    return typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : PATHS.overview
  }

  async function logout() {
    const home = postLogoutRedirectUri()
    const hint = user.value?.id_token
    user.value = null
    clearEntitlement()
    if (!isLiveOidc()) {
      window.location.replace(home)
      return
    }
    try {
      await getManager().signoutRedirect({
        id_token_hint: hint,
        post_logout_redirect_uri: home
      })
    } catch {
      try {
        await getManager().removeUser()
      } catch {
        /* still send them home */
      }
      window.location.replace(home)
    }
  }

  return {
    user,
    ready,
    error,
    isAuthenticated,
    displayName,
    email,
    username,
    groups,
    idToken,
    hydrate,
    login,
    signup,
    completeLogin,
    logout
  }
})
