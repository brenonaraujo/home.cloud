/**
 * Client-side grouping for the member console.
 * Live catalog may send `kind` or `category`; otherwise we infer:
 *   application = public product (`groups: ['*']` or known product ids)
 *   platform    = staff/ops consoles
 */

const PLATFORM_IDS = new Set(['grafana', 'n8n', 'minio', 'portainer', 'konga', 'authentik', 'console-air', 'vserver'])

const STAFF_GROUPS = [
  'brenon-admins',
  'brenon-ops',
  'brenon-viewers',
  'brenon-builders',
  'api-owner',
  'hermes-owner'
]

export function serviceKind(svc) {
  const explicit = String(svc?.kind || svc?.category || '').toLowerCase()
  if (explicit === 'platform') return 'platform'
  if (explicit === 'product' || explicit === 'application' || explicit === 'app') {
    return 'application'
  }
  const id = String(svc?.id || '').toLowerCase()
  if (PLATFORM_IDS.has(id)) return 'platform'
  const groups = svc?.groups || []
  if (groups.includes('*')) return 'application'
  return 'platform'
}

export function groupServices(services) {
  const applications = []
  const platform = []
  for (const svc of services || []) {
    if (serviceKind(svc) === 'application') applications.push(svc)
    else platform.push(svc)
  }
  return { applications, platform }
}

export function searchServices(services, query, locale = 'en') {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return services || []
  return (services || []).filter((svc) => {
    const title = String(svc.title?.[locale] || svc.title?.en || svc.id || '').toLowerCase()
    const desc = String(svc.description?.[locale] || svc.description?.en || '').toLowerCase()
    const host = String(svc.url || '').toLowerCase()
    const id = String(svc.id || '').toLowerCase()
    return title.includes(q) || desc.includes(q) || host.includes(q) || id.includes(q)
  })
}

export function displayPlan(groups, billing) {
  const paid = String(billing?.plan || '').toLowerCase()
  const status = String(billing?.status || '').toLowerCase()
  const live = status === 'active' || status === 'trialing' || status === 'past_due'
  if (live && (paid === 'basic' || paid === 'pro')) return paid
  return primaryPlan(groups)
}

export function primaryPlan(groups) {
  const have = (groups || []).map((g) => String(g).toLowerCase())
  if (have.includes('plan-pro')) return 'pro'
  if (have.includes('plan-basic')) return 'basic'
  if (have.includes('plan-hermes')) return 'hermes'
  if (have.includes('plan-free')) return 'free'
  const plans = have.filter((g) => g.startsWith('plan-'))
  if (plans.length) return plans[0].slice('plan-'.length)
  return 'free'
}

export function isStaff(groups) {
  const have = new Set((groups || []).map((g) => String(g).toLowerCase()))
  return STAFF_GROUPS.some((g) => have.has(g))
}

export function isHermesSubscriber(groups) {
  const have = new Set((groups || []).map((g) => String(g).toLowerCase()))
  return have.has('plan-hermes') || have.has('plan-pro') || have.has('plan-basic')
}

export function hermesQuota(groups) {
  const plan = primaryPlan(groups)
  if (plan === 'pro') return { diskGb: 20, memoryGb: 4, cpus: 2 }
  if (plan === 'basic' || plan === 'hermes') return { diskGb: 5, memoryGb: 2, cpus: 1 }
  return { diskGb: 0, memoryGb: 0, cpus: 0 }
}

export function hermesDiskGb(groups) {
  return hermesQuota(groups).diskGb
}

export function isHermesOperator(groups) {
  const have = new Set((groups || []).map((g) => String(g).toLowerCase()))
  return have.has('hermes-owner')
}

export function canManageHermes(groups) {
  return isHermesSubscriber(groups) || isHermesOperator(groups)
}

export function pickLocalized(obj, locale) {
  if (!obj || typeof obj !== 'object') return ''
  return obj[locale] || obj.en || ''
}
