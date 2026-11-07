import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHermesDockStore = defineStore('hermesDock', () => {
  const open = ref(false)
  const nonce = ref(0)
  const lastEvent = ref('idle')
  // Shell coordination: the layout pads <main> while the FAB is visible and
  // hides the FAB while the mobile drawer is open (issue #44).
  const visible = ref(false)
  const suppressed = ref(false)

  function startChat() {
    open.value = true
    lastEvent.value = 'show'
  }

  function close() {
    open.value = false
    lastEvent.value = 'hide'
  }

  function toggle() {
    if (open.value) close()
    else startChat()
  }

  function restart() {
    nonce.value += 1
    open.value = true
    lastEvent.value = 'restart'
  }

  function newSession() {
    restart()
  }

  return { open, nonce, lastEvent, visible, suppressed, startChat, close, toggle, restart, newSession }
})
