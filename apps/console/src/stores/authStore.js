import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { UserManager } from 'oidc-client-ts'
import {
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
  if (!manager) {
    manager = new UserManager(oidcSettings())
  }
  return manager
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
    return String(raw)
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
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
    } catch (err) {
      error.value = err?.message || 'auth'
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
      await getManager().signinRedirect({
        state: { returnTo: next }
      })
    } catch (err) {
      loginStarted = false
      throw err
    }
  }

  function signup() {
    window.location.href = postLogoutRedirectUri()
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
    if (!isLiveOidc()) {
      user.value = null
      try {
        useEntitlementStore().clear()
      } catch {
        /* pinia may not be ready in tests */
      }
      window.location.replace(home)
      return
    }
    const mgr = getManager()
    const hint = user.value?.id_token
    user.value = null
    try {
      useEntitlementStore().clear()
    } catch {
      /* pinia may not be ready in tests */
    }
    try {
      await mgr.signoutRedirect({
        id_token_hint: hint,
        post_logout_redirect_uri: home
      })
    } catch {
      try {
        await mgr.removeUser()
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
