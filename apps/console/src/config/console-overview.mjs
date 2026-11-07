import { canManageHermes, primaryPlan } from './console-taxonomy.mjs'

export function billingSnapshot(groups) {
  return {
    plan: primaryPlan(groups),
    amountCents: 0,
    currency: 'BRL',
    invoices: []
  }
}

const LIVE_HERMES_STATUSES = ['pending', 'provisioning', 'running', 'stopped']

export function isLiveHermesInstance(row) {
  return Boolean(row) && LIVE_HERMES_STATUSES.includes(row.status)
}

export function hasLiveHermesInstance(instances) {
  return Array.isArray(instances) && instances.some(isLiveHermesInstance)
}

// BRL is always shown the Brazilian way (R$ 29,90), whatever the UI language.
export function formatMoney(cents, currency = 'BRL', locale = 'en') {
  const lang = currency === 'BRL' || locale === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency
  }).format(Number(cents || 0) / 100)
}

export function currentPeriodLabel(locale = 'en', now = new Date()) {
  const lang = locale === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(now)
}

// hermesInstance: true (has a live instance), false (confirmed none), null (unknown yet).
export function buildNotifications({ catalogOffline = false, groups = [], hermesInstance = null } = {}) {
  const items = []
  if (catalogOffline) {
    items.push({
      id: 'catalog-offline',
      level: 'warning',
      key: 'catalogOffline',
      to: null
    })
  }
  if (!(groups || []).length) {
    items.push({
      id: 'groups-empty',
      level: 'info',
      key: 'groupsEmpty',
      to: '/account'
    })
  }
  if (canManageHermes(groups) && hermesInstance === false) {
    items.push({
      id: 'hermes-provision',
      level: 'info',
      key: 'hermesProvision',
      to: '/hermes'
    })
  }
  return items
}
