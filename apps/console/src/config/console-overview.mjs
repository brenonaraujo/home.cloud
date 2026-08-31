import { canManageHermes, primaryPlan } from './console-taxonomy.mjs'

export function billingSnapshot(groups) {
  return {
    plan: primaryPlan(groups),
    amountCents: 0,
    currency: 'BRL',
    invoices: []
  }
}

export function formatMoney(cents, currency = 'BRL', locale = 'en') {
  const lang = locale === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency
  }).format(Number(cents || 0) / 100)
}

export function currentPeriodLabel(locale = 'en', now = new Date()) {
  const lang = locale === 'pt' ? 'pt-BR' : 'en-US'
  return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(now)
}

export function buildNotifications({ catalogOffline = false, groups = [] } = {}) {
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
  if (canManageHermes(groups)) {
    items.push({
      id: 'hermes-provision',
      level: 'info',
      key: 'hermesProvision',
      to: '/hermes'
    })
  }
  return items
}
