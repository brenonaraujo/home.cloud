import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchLiveCatalog } from '../api/consoleCatalogApi'
import { visibleForGroups } from '../config/console-acl.mjs'
import { CONSOLE_SERVICES } from '../config/console-registry'
import {
  readPrefs,
  recordVisit,
  resolveByIds,
  toggleFavorite,
  markNotificationsRead,
  setSidebarFavoritesHidden
} from '../config/console-prefs.mjs'
import { groupServices, searchServices } from '../config/console-taxonomy.mjs'

function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const useConsoleStore = defineStore('console', () => {
  const services = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const source = ref('fallback')
  const error = ref(null)
  const recentIds = ref([])
  const favoriteIds = ref([])
  const readNotificationIds = ref([])
  const sidebarFavoritesHidden = ref(false)
  const lastVisit = ref({})
  const prefsEmail = ref('')
  const searchQuery = ref('')

  const offline = computed(() => loaded.value && source.value === 'fallback' && Boolean(error.value))

  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    if (force) error.value = null
    try {
      const live = await fetchLiveCatalog()
      if (live.length) {
        services.value = live
        source.value = 'live'
        error.value = null
      } else {
        services.value = CONSOLE_SERVICES
        source.value = 'fallback'
        error.value = null
      }
    } catch (err) {
      services.value = CONSOLE_SERVICES
      source.value = 'fallback'
      error.value = err?.message || 'catalog'
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  function catalogList() {
    return services.value.length ? services.value : CONSOLE_SERVICES
  }

  function appsFor(userGroups) {
    return visibleForGroups(catalogList(), userGroups)
  }

  function groupedFor(userGroups) {
    return groupServices(appsFor(userGroups))
  }

  function searchFor(userGroups, query, locale) {
    return searchServices(appsFor(userGroups), query, locale)
  }

  function hydratePrefs(email) {
    const nextEmail = String(email || '')
    if (prefsEmail.value === nextEmail) return
    prefsEmail.value = nextEmail
    const prefs = readPrefs(browserStorage(), nextEmail)
    applyPrefs(prefs)
  }

  function applyPrefs(prefs) {
    recentIds.value = prefs.recent
    favoriteIds.value = prefs.favorites
    readNotificationIds.value = prefs.readNotifications
    sidebarFavoritesHidden.value = Boolean(prefs.sidebarFavoritesHidden)
    lastVisit.value = prefs.lastVisit || {}
  }

  function visit(id, email) {
    applyPrefs(recordVisit(browserStorage(), email, id))
  }

  function star(id, email) {
    applyPrefs(toggleFavorite(browserStorage(), email, id))
  }

  function hideSidebarFavorites(hidden, email) {
    applyPrefs(setSidebarFavoritesHidden(browserStorage(), email, hidden))
  }

  function markNotesRead(ids, email) {
    applyPrefs(markNotificationsRead(browserStorage(), email, ids))
  }

  function isNoteRead(id) {
    return readNotificationIds.value.includes(id)
  }

  function isFavorite(id) {
    return favoriteIds.value.includes(id)
  }

  function lastVisitAt(id) {
    const ts = Number(lastVisit.value?.[id])
    return Number.isFinite(ts) && ts > 0 ? ts : null
  }

  function recentApps(userGroups) {
    return resolveByIds(appsFor(userGroups), recentIds.value)
  }

  function favoriteApps(userGroups) {
    return resolveByIds(appsFor(userGroups), favoriteIds.value)
  }

  return {
    services,
    loaded,
    loading,
    source,
    error,
    offline,
    recentIds,
    favoriteIds,
    readNotificationIds,
    sidebarFavoritesHidden,
    lastVisit,
    searchQuery,
    load,
    appsFor,
    groupedFor,
    searchFor,
    hydratePrefs,
    visit,
    star,
    hideSidebarFavorites,
    markNotesRead,
    isNoteRead,
    isFavorite,
    lastVisitAt,
    recentApps,
    favoriteApps
  }
})
