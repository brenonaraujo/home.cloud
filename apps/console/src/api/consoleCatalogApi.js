import { normalizeCatalogService } from '../config/console-acl.mjs'

export const CONSOLE_CATALOG_URL = 'https://control.brenon.cloud/api/v1/catalog'

export async function fetchLiveCatalog() {
  const response = await fetch(CONSOLE_CATALOG_URL, {
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error(`catalog ${response.status}`)
  }
  const data = await response.json()
  const rows = Array.isArray(data?.services) ? data.services : []
  return rows.map(normalizeCatalogService).filter(Boolean)
}
