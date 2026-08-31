const MAX_RECENT = 8

export function prefsKey(email) {
  return `brenon-console:${String(email || 'anon').toLowerCase()}`
}

export function emptyPrefs() {
  return { recent: [], favorites: [], readNotifications: [], sidebarFavoritesHidden: false, lastVisit: {} }
}

export function readPrefs(storage, email) {
  if (!storage) return emptyPrefs()
  try {
    const raw = storage.getItem(prefsKey(email))
    if (!raw) return emptyPrefs()
    const parsed = JSON.parse(raw)
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent.map(String).filter(Boolean) : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites.map(String).filter(Boolean) : [],
      readNotifications: Array.isArray(parsed.readNotifications)
        ? parsed.readNotifications.map(String).filter(Boolean)
        : [],
      sidebarFavoritesHidden: Boolean(parsed.sidebarFavoritesHidden),
      lastVisit: normalizeLastVisit(parsed.lastVisit)
    }
  } catch {
    return emptyPrefs()
  }
}

export function writePrefs(storage, email, prefs) {
  if (!storage) return emptyPrefs()
  const next = {
    recent: (prefs?.recent || []).slice(0, MAX_RECENT),
    favorites: [...new Set(prefs?.favorites || [])],
    readNotifications: [...new Set(prefs?.readNotifications || [])],
    sidebarFavoritesHidden: Boolean(prefs?.sidebarFavoritesHidden),
    lastVisit: normalizeLastVisit(prefs?.lastVisit)
  }
  storage.setItem(prefsKey(email), JSON.stringify(next))
  return next
}

function normalizeLastVisit(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  for (const [id, at] of Object.entries(raw)) {
    const key = String(id || '').trim()
    const ts = Number(at)
    if (key && Number.isFinite(ts) && ts > 0) out[key] = ts
  }
  return out
}

export function recordVisit(storage, email, id, at = Date.now()) {
  const key = String(id || '').trim()
  const prefs = readPrefs(storage, email)
  if (!key) return prefs
  const recent = [key, ...prefs.recent.filter((item) => item !== key)].slice(0, MAX_RECENT)
  const lastVisit = { ...prefs.lastVisit, [key]: Number(at) || Date.now() }
  return writePrefs(storage, email, { ...prefs, recent, lastVisit })
}

export function lastVisitAt(prefs, id) {
  const ts = Number(prefs?.lastVisit?.[id])
  return Number.isFinite(ts) && ts > 0 ? ts : null
}

export function setSidebarFavoritesHidden(storage, email, hidden) {
  const prefs = readPrefs(storage, email)
  return writePrefs(storage, email, { ...prefs, sidebarFavoritesHidden: Boolean(hidden) })
}

export function toggleFavorite(storage, email, id) {
  const key = String(id || '').trim()
  const prefs = readPrefs(storage, email)
  if (!key) return prefs
  const has = prefs.favorites.includes(key)
  const favorites = has ? prefs.favorites.filter((item) => item !== key) : [...prefs.favorites, key]
  return writePrefs(storage, email, { ...prefs, favorites })
}

export function markNotificationsRead(storage, email, ids) {
  const prefs = readPrefs(storage, email)
  const extra = (ids || []).map(String).filter(Boolean)
  if (!extra.length) return prefs
  const readNotifications = [...new Set([...prefs.readNotifications, ...extra])]
  return writePrefs(storage, email, { ...prefs, readNotifications })
}

export function unreadNotifications(items, readIds) {
  const read = new Set(readIds || [])
  return (items || []).filter((item) => !read.has(item.id))
}

export const NOTIFICATIONS_PAGE_SIZE = 10

export function paginate(items, page, size = NOTIFICATIONS_PAGE_SIZE) {
  const list = items || []
  const pages = Math.max(1, Math.ceil(list.length / size) || 1)
  const current = Math.min(pages, Math.max(1, Number(page) || 1))
  const start = (current - 1) * size
  return {
    page: current,
    pages,
    total: list.length,
    items: list.slice(start, start + size)
  }
}

export function resolveByIds(services, ids) {
  const map = new Map((services || []).map((svc) => [svc.id, svc]))
  return (ids || []).map((id) => map.get(id)).filter(Boolean)
}
