/** Map browser/CORS fetch failures to a stable billing message. */
export function humanBillingError(err, fallback) {
  const raw = String(err?.message || err || '')
  const lower = raw.toLowerCase()
  if (
    !raw ||
    lower === 'load failed' ||
    lower === 'failed to fetch' ||
    lower.includes('networkerror') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('unauthorized')
  ) {
    return fallback
  }
  return raw
}
