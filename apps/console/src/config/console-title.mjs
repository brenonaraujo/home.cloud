export const BRAND_TITLE = 'Brenon Cloud'
export const DEFAULT_TITLE = 'Brenon Cloud Console'

export function pageTitle(label) {
  const text = String(label || '').trim()
  return text ? `${text} · ${BRAND_TITLE}` : DEFAULT_TITLE
}

export function htmlLang(locale) {
  return locale === 'pt' ? 'pt-BR' : 'en'
}
