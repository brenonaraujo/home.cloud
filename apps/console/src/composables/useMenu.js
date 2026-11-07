import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * WAI-ARIA menu button behaviour shared by the session menu and BcMenu:
 * arrows open and move, Home/End jump, Esc closes back to the trigger,
 * Tab and outside clicks close.
 */
export function useMenu({ itemSelector = '[role="menuitem"]' } = {}) {
  const open = ref(false)
  const root = ref(null)
  const trigger = ref(null)
  const list = ref(null)

  function items() {
    return Array.from(list.value?.querySelectorAll(itemSelector) || []).filter((el) => !el.disabled)
  }

  function focusItem(index) {
    const all = items()
    if (!all.length) return
    all[(index + all.length) % all.length].focus()
  }

  async function openMenu(index = 0) {
    open.value = true
    await nextTick()
    focusItem(index)
  }

  function closeMenu({ restoreFocus = false } = {}) {
    open.value = false
    if (restoreFocus) trigger.value?.focus()
  }

  function toggleMenu() {
    if (open.value) closeMenu()
    else openMenu(0)
  }

  function onMenuKey(event) {
    const all = items()
    const current = all.indexOf(document.activeElement)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusItem(current + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusItem(current - 1)
        break
      case 'Home':
        event.preventDefault()
        focusItem(0)
        break
      case 'End':
        event.preventDefault()
        focusItem(-1)
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        closeMenu({ restoreFocus: true })
        break
      case 'Tab':
        closeMenu()
        break
    }
  }

  function onTriggerKey(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openMenu(0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(-1)
    }
  }

  const onDocClick = (event) => {
    if (open.value && !root.value?.contains(event.target)) closeMenu()
  }

  onMounted(() => document.addEventListener('click', onDocClick))
  onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

  return { open, root, trigger, list, openMenu, closeMenu, toggleMenu, onMenuKey, onTriggerKey }
}
