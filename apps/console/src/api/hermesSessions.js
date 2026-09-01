const metrics = { list: 0, resume: 0, launch: 0, refuse: 0 }

export function resetHermesMetrics() {
  metrics.list = 0
  metrics.resume = 0
  metrics.launch = 0
  metrics.refuse = 0
}

export function hermesMetricCounts() {
  return { ...metrics }
}

export function noteHermesMetric(name) {
  if (Object.prototype.hasOwnProperty.call(metrics, name)) metrics[name] += 1
  return metrics[name]
}

export function hermesSurfaceLog(event, kind) {
  return { event: String(event || ''), kind: String(kind || '') }
}

export function canUseHermesSessions(instance) {
  return Boolean(instance?.ready && instance?.hostname)
}

export function hermesDashboardUrl(instance) {
  const explicit = String(instance?.launchUrl || '').trim()
  if (explicit) return explicit
  const host = String(instance?.hostname || '').trim()
  if (!host) return ''
  return `https://${host}/hermes`
}

export function hermesDashboardChatUrl(instance, sessionId) {
  const base = hermesDashboardUrl(instance)
  if (!base) return ''
  const id = String(sessionId || '').trim()
  if (!id) return `${base}/chat`
  return `${base}/chat?resume=${encodeURIComponent(id)}`
}

export function hermesSessionsApiUrl(instance) {
  const base = hermesDashboardUrl(instance)
  if (!base) return ''
  return `${base}/api/sessions?limit=20&order=recent`
}

export function classifyHermesSurfaceError(err, extra = {}) {
  if (!extra.hasInstance) return 'instance'
  const msg = String(err?.message || err || '')
  const status = Number(err?.status || 0)
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return 'edge'
  if (/control\.brenon\.cloud/i.test(msg)) return 'console'
  if (status >= 500 || /tenant/i.test(msg)) return 'tenant'
  return 'tenant'
}

export function normalizeHermesSessions(payload) {
  const rows = Array.isArray(payload?.sessions)
    ? payload.sessions
    : Array.isArray(payload)
      ? payload
      : []
  return rows
    .map((row) => {
      const id = String(row?.id || '').trim()
      if (!id) return null
      const title = String(row.title || '').trim() || id
      const lastActive = Number(row.last_active || row.updated_at || 0)
      return { id, title, lastActive }
    })
    .filter(Boolean)
    .sort((a, b) => b.lastActive - a.lastActive)
}

export function openNativeSurface(url, openFn) {
  const href = String(url || '').trim()
  if (!href) return false
  const open = openFn || (typeof window !== 'undefined' ? window.open.bind(window) : null)
  if (!open) return false
  open(href, '_blank', 'noopener,noreferrer')
  noteHermesMetric('launch')
  return true
}

export async function fetchHermesNativeSessions(instance, fetchImpl = fetch) {
  if (!canUseHermesSessions(instance)) {
    noteHermesMetric('refuse')
    console.info('[hermes-surface]', hermesSurfaceLog('list', 'instance'))
    return { sessions: [], kind: 'instance' }
  }
  noteHermesMetric('list')
  const url = hermesSessionsApiUrl(instance)
  try {
    const res = await fetchImpl(url, { credentials: 'include' })
    if (!res.ok) {
      const err = new Error(`tenant ${res.status}`)
      err.status = res.status
      throw err
    }
    const data = await res.json()
    return { sessions: normalizeHermesSessions(data), kind: '' }
  } catch (err) {
    const kind = classifyHermesSurfaceError(err, { hasInstance: true })
    console.info('[hermes-surface]', hermesSurfaceLog('list', kind))
    return { sessions: [], kind }
  }
}
