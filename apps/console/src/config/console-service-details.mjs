/**
 * Honest details for /services/:id.
 * Catalog + optional facts + this-browser last visit. No invented SKUs.
 */
import { factsFor } from './console-service-facts.mjs'

export function hostnameOf(url) {
  try {
    return new URL(url).host
  } catch {
    return String(url || '')
  }
}

export function serviceAccess(svc) {
  const groups = svc?.groups || []
  if (groups.includes('*')) return 'any'
  return 'staff'
}

export function servicePlan(svc) {
  const facts = factsFor(svc?.id)
  if (facts?.plan) return facts.plan
  return serviceAccess(svc) === 'any' ? 'free' : 'staff'
}

export function derivedBullets(svc, locale = 'en') {
  const host = hostnameOf(svc?.url)
  const any = serviceAccess(svc) === 'any'
  if (locale === 'pt') {
    return [
      host ? `Abre a partir deste console em ${host}.` : 'Abre a partir deste console.',
      any ? 'Qualquer conta Brenon Cloud logada pode abrir.' : 'Só staff.',
      'Login é Authentik. O app abre em uma nova aba.'
    ]
  }
  return [
    host ? `Launches from this console at ${host}.` : 'Launches from this console.',
    any ? 'Any signed-in Brenon Cloud account can open it.' : 'Staff only.',
    'Sign-in is Authentik. The app opens in a new tab.'
  ]
}

export function serviceDetails(svc, locale = 'en') {
  if (!svc) return null
  const lang = locale === 'pt' ? 'pt' : 'en'
  const facts = factsFor(svc.id, lang)
  const bullets = facts?.bullets?.length ? facts.bullets : derivedBullets(svc, lang)
  return {
    plan: servicePlan(svc),
    access: serviceAccess(svc),
    host: hostnameOf(svc.url),
    docsUrl: facts?.docsUrl || '',
    statusUrl: facts?.statusUrl || 'https://status.brenon.cloud',
    bullets
  }
}

export function formatRelativeTime(ts, now = Date.now(), locale = 'en') {
  const at = Number(ts)
  if (!Number.isFinite(at) || at <= 0) return ''
  let sec = Math.round((at - now) / 1000)
  if (sec > 0 && sec < 5) sec = 0
  const abs = Math.abs(sec)
  const rtf = new Intl.RelativeTimeFormat(locale === 'pt' ? 'pt-BR' : 'en', { numeric: 'auto' })
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1]
  ]
  for (const [unit, size] of units) {
    if (abs >= size || unit === 'second') {
      return rtf.format(Math.round(sec / size), unit)
    }
  }
  return ''
}

export function formatAbsoluteTime(ts, locale = 'en') {
  const at = Number(ts)
  if (!Number.isFinite(at) || at <= 0) return ''
  try {
    return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(at))
  } catch {
    return new Date(at).toISOString()
  }
}
