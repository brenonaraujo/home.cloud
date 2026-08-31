const BASE = 'https://control.brenon.cloud'

async function readJSON(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { error: text || res.statusText }
  }
}

export async function fetchBillingPlans() {
  const res = await fetch(`${BASE}/api/v1/billing/plans`)
  const data = await readJSON(res)
  if (!res.ok) throw new Error(data.error || `plans ${res.status}`)
  return data
}

export async function fetchBillingMe(idToken) {
  const res = await fetch(`${BASE}/api/v1/billing/me`, {
    headers: { Authorization: `Bearer ${idToken}` }
  })
  const data = await readJSON(res)
  if (!res.ok) throw new Error(data.error || `billing ${res.status}`)
  return data
}

export async function startCheckout(idToken, plan) {
  const res = await fetch(`${BASE}/api/v1/billing/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ plan })
  })
  const data = await readJSON(res)
  if (!res.ok || !data.url) throw new Error(data.error || `checkout ${res.status}`)
  return data.url
}

export async function startPortal(idToken) {
  const res = await fetch(`${BASE}/api/v1/billing/portal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` }
  })
  const data = await readJSON(res)
  if (!res.ok || !data.url) throw new Error(data.error || `portal ${res.status}`)
  return data.url
}

export const FALLBACK_PLANS = [
  { id: 'free', amountCents: 0, interval: 'month', includesHermes: false, diskGb: 0, memoryGb: 0, cpus: 0 },
  { id: 'basic', amountCents: 2990, interval: 'month', includesHermes: true, diskGb: 5, memoryGb: 2, cpus: 1 },
  { id: 'pro', amountCents: 7990, interval: 'month', includesHermes: true, diskGb: 20, memoryGb: 4, cpus: 2 }
]
