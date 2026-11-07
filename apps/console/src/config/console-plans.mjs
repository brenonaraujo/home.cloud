// Single source for plan prices, quotas and the comparable feature table
// shown on Billing (issue #44). Keep in step with the control plane.

export const PLANS = [
  { id: 'free', amountCents: 0, interval: 'month', includesHermes: false, diskGb: 0, memoryGb: 0, cpus: 0 },
  { id: 'basic', amountCents: 2990, interval: 'month', includesHermes: true, diskGb: 5, memoryGb: 2, cpus: 1 },
  { id: 'pro', amountCents: 7990, interval: 'month', includesHermes: true, diskGb: 20, memoryGb: 4, cpus: 2 }
]

const LEGACY = { hermes: 'basic' }

export function planInfo(id) {
  const key = LEGACY[id] || id
  return PLANS.find((p) => p.id === key) || PLANS[0]
}

/** Rows every plan card shows, so cards compare line by line. */
export function planFeatureRows(plan) {
  const p = planInfo(plan?.id || plan)
  return [
    { key: 'services', included: true },
    { key: 'hermes', included: p.includesHermes },
    { key: 'resources', included: p.includesHermes, values: { ram: p.memoryGb, cpu: p.cpus, gb: p.diskGb } },
    { key: 'invoices', included: p.amountCents > 0 },
    { key: 'priority', included: p.id === 'pro' }
  ]
}

const LIVE = new Set(['active', 'trialing', 'past_due'])

/**
 * Stripe already says the plan is paid, but the OIDC session still carries
 * the old groups: the session needs to be refreshed to pick up access.
 */
export function needsSessionRefresh(groups, billing) {
  const plan = String(billing?.plan || '').toLowerCase()
  if (!LIVE.has(String(billing?.status || '').toLowerCase())) return false
  if (plan !== 'basic' && plan !== 'pro') return false
  const have = new Set((groups || []).map((g) => String(g).toLowerCase()))
  return !have.has(`plan-${plan}`)
}

const ACCESS = [
  { match: (g) => g === 'plan-pro', key: 'planPro' },
  { match: (g) => g === 'plan-basic' || g === 'plan-hermes', key: 'planBasic' },
  { match: (g) => g === 'plan-free', key: 'planFree' },
  { match: (g) => g === 'hermes-owner', key: 'hermesOperator' },
  { match: (g) => g === 'brenon-admins' || g.endsWith('-admin') || g.endsWith('-admins'), key: 'staff' }
]

/** Customer-facing access labels (i18n keys) instead of raw Authentik groups. */
export function accessKeys(groups) {
  const out = []
  for (const raw of groups || []) {
    const g = String(raw).toLowerCase()
    const hit = ACCESS.find((row) => row.match(g))
    if (hit && !out.includes(hit.key)) out.push(hit.key)
  }
  return out
}

/** Hermes instance row → BcStatus tone. */
export function instanceStatus(row) {
  if (!row) return 'stopped'
  const status = String(row.status || '').toLowerCase()
  if (row.error || status === 'failed' || status === 'error') return 'error'
  if (status === 'stopped') return 'stopped'
  if (status === 'running' && row.ready) return 'active'
  if (['pending', 'provisioning', 'running'].includes(status)) return 'starting'
  return 'stopped'
}
