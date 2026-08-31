const TTL_MS = 24 * 60 * 60 * 1000

export function entitlementKey(email) {
  return `brenon-console-plan:${String(email || '').toLowerCase()}`
}

export function readEntitlement(storage, email) {
  if (!storage || !email) return null
  try {
    const raw = storage.getItem(entitlementKey(email))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const at = Number(parsed.at) || 0
    if (!at || Date.now() - at > TTL_MS) return null
    const plan = String(parsed.plan || '').toLowerCase()
    const status = String(parsed.status || '')
    const customerId = String(parsed.customerId || '')
    if (!plan) return null
    return { plan, status, customerId, at }
  } catch {
    return null
  }
}

export function writeEntitlement(storage, email, { plan, status, customerId } = {}) {
  if (!storage || !email) return null
  const next = {
    plan: String(plan || '').toLowerCase(),
    status: String(status || ''),
    customerId: String(customerId || ''),
    at: Date.now()
  }
  if (!next.plan) {
    storage.removeItem(entitlementKey(email))
    return null
  }
  storage.setItem(entitlementKey(email), JSON.stringify(next))
  return next
}

export function clearEntitlement(storage, email) {
  if (!storage || !email) return
  storage.removeItem(entitlementKey(email))
}
