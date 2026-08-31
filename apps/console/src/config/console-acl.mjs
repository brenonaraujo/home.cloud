/**
 * ACL + shape for the member console catalog.
 * Live source: GET https://control.brenon.cloud/api/v1/catalog
 * Fallback: src/config/console-registry.js
 *
 * groups: ['*'] = any signed-in account. Otherwise overlap with the
 * session's Authentik groups (all_groups / groups claim).
 */

export function normalizeCatalogService(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = String(raw.id || '').trim()
  if (!id) return null
  const url = String(raw.url || raw.launchUrl || '').trim()
  if (!url) return null
  const name = raw.name || id
  const title = raw.title && typeof raw.title === 'object'
    ? { en: raw.title.en || name, pt: raw.title.pt || raw.title.en || name }
    : { en: name, pt: name }
  const description = raw.description && typeof raw.description === 'object'
    ? { en: raw.description.en || '', pt: raw.description.pt || raw.description.en || '' }
    : { en: '', pt: '' }
  const groups = Array.isArray(raw.groups)
    ? raw.groups
    : Array.isArray(raw.consoleGroups)
      ? raw.consoleGroups
      : []
  const kind = raw.kind || raw.category || ''
  return {
    id,
    title,
    description,
    url,
    groups: groups.map((g) => String(g)).filter(Boolean),
    icon: raw.icon || 'cube',
    color: raw.color || 'blue',
    kind
  }
}

export function visibleForGroups(services, userGroups) {
  const have = new Set((userGroups || []).map((g) => String(g).toLowerCase()))
  return (services || []).filter((svc) => {
    const groups = svc.groups || []
    if (groups.includes('*')) return true
    return groups.some((g) => have.has(String(g).toLowerCase()))
  })
}
