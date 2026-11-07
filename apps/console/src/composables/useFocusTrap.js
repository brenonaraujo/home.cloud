import { nextTick, onBeforeUnmount, watch } from 'vue'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export function focusableIn(root) {
  if (!root) return []
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
    (el) => !el.closest('[inert]') && el.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Keeps Tab inside `container` while `active` is true, closes on Escape and
 * hands focus back to whatever had it before opening (WCAG 2.1.2 / 2.4.3).
 */
export function useFocusTrap(container, active, { onEscape, initialFocus } = {}) {
  let returnTo = null

  function onKey(event) {
    if (!active.value) return
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault()
      event.stopPropagation()
      onEscape()
      return
    }
    if (event.key !== 'Tab') return
    const items = focusableIn(container.value)
    if (!items.length) {
      event.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    active,
    async (on) => {
      if (on) {
        returnTo = document.activeElement
        document.addEventListener('keydown', onKey, true)
        await nextTick()
        const target = initialFocus?.value || focusableIn(container.value)[0] || container.value
        target?.focus?.()
      } else {
        document.removeEventListener('keydown', onKey, true)
        if (returnTo && typeof returnTo.focus === 'function' && document.contains(returnTo)) {
          returnTo.focus()
        }
        returnTo = null
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => document.removeEventListener('keydown', onKey, true))
}
