// Medição de uso pelo Umami da casa. Desligada quando
// VITE_ANALYTICS_URL ou VITE_ANALYTICS_WEBSITE_ID está vazio.
//
// A console decide o que sai: o padrão da rota (`/services/:id`), nunca
// o id real, a query (`checkout`, `code`) nem a callback de login.
// ?nocount=1 desliga a contagem neste browser.

const OFF = 'brenon-analytics-off'

const ROUTE_URL = {
  overview: '/',
  'console-services': '/services',
  'console-service': '/services/:id',
  'console-hermes': '/hermes',
  'console-account': '/account',
  'console-billing': '/billing',
  'console-notifications': '/notifications',
  'console-host-auth': '/host-auth',
  'console-not-found': '/404'
}

const PUBLIC_PATHS = new Set(Object.values(ROUTE_URL))

export function resolveAnalyticsConfig(url, websiteId) {
  const base = typeof url === 'string' ? url.trim().replace(/\/+$/, '') : ''
  const id = typeof websiteId === 'string' ? websiteId.trim() : ''
  if (!id || !/^https?:\/\//.test(base)) return null
  return { scriptUrl: `${base}/script.js`, websiteId: id }
}

export function applyOptOut(search, storage) {
  const q = new URLSearchParams(search)
  if (q.get('nocount') === '1') storage.setItem(OFF, '1')
  if (q.get('nocount') === '0') storage.removeItem(OFF)
  return storage.getItem(OFF) === '1'
}

export function doNotTrackEnabled(nav) {
  if (!nav) return false
  return nav.doNotTrack === '1' || nav.msDoNotTrack === '1'
}

/** Padrão da rota, ou null se esta tela não se mede. */
export function trackedPath(route) {
  const name = route && route.name
  if (typeof name !== 'string') return null
  return ROUTE_URL[name] || null
}

export function trackingDecision({ route, optedOut, doNotTrack, host }) {
  if (optedOut || doNotTrack) return null
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') return null
  const url = trackedPath(route)
  if (!url) return null
  return { url }
}

/** Tira query. Página da própria console que não é padrão de rota não sai. */
export function cleanReferrer(value, origin) {
  if (typeof value !== 'string' || !value) return ''
  const cut = value.split('#')[0].split('?')[0]
  if (!origin) return cut
  let url
  try {
    url = new URL(cut, origin)
  } catch {
    return ''
  }
  if (url.origin !== origin) return `${url.origin}${url.pathname}`
  return PUBLIC_PATHS.has(url.pathname) ? url.pathname : ''
}

export function installAnalytics(router, env) {
  try {
    wireAnalytics(router, env || readViteEnv())
  } catch (err) {
    console.error('analytics install:', err)
  }
}

function readViteEnv() {
  return import.meta.env
}

function wireAnalytics(router, env) {
  const config = resolveAnalyticsConfig(env && env.VITE_ANALYTICS_URL, env && env.VITE_ANALYTICS_WEBSITE_ID)
  applyOptOut(location.search, localStorage)
  stripNocount()
  if (!config) return

  let script
  let lastUrl = ''
  let lastPath

  function loadScript() {
    script ??= new Promise((resolve) => {
      const el = document.createElement('script')
      el.defer = true
      el.src = config.scriptUrl
      el.dataset.websiteId = config.websiteId
      el.dataset.autoTrack = 'false'
      el.dataset.doNotTrack = 'true'
      el.onload = () => resolve(globalThis.umami ?? null)
      el.onerror = () => resolve(null)
      document.head.appendChild(el)
    })
    return script
  }

  function decide(route) {
    return trackingDecision({
      route,
      optedOut: localStorage.getItem(OFF) === '1',
      doNotTrack: doNotTrackEnabled(navigator),
      host: location.hostname
    })
  }

  async function track(route) {
    try {
      const path = trackedPath(route)
      if (!decide(route) || lastPath === path) return
      const umami = await loadScript()
      const decision = decide(route)
      if (!decision || lastPath === path) return
      if (!umami || typeof umami.track !== 'function') return
      lastPath = decision.url
      const referrer = lastUrl || cleanReferrer(document.referrer, location.origin)
      lastUrl = decision.url
      umami.track((defaults) => ({
        ...defaults,
        url: decision.url,
        referrer: referrer || cleanReferrer(defaults.referrer || '', location.origin)
      }))
    } catch (err) {
      console.error('analytics track:', err)
    }
  }

  router.afterEach((to) => {
    try {
      applyOptOut(location.search, localStorage)
      stripNocount()
      track(to)
    } catch (err) {
      console.error('analytics track:', err)
    }
  })
  track(router.currentRoute.value)
}

function stripNocount() {
  if (!location.search.includes('nocount=')) return
  const url = new URL(location.href)
  url.searchParams.delete('nocount')
  history.replaceState({}, '', url.pathname + url.search + url.hash)
}
