import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHermesDockStore = defineStore('hermesDock', () => {
  const open = ref(false)
  const nonce = ref(0)
  const lastEvent = ref('idle')

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

  return { open, nonce, lastEvent, startChat, close, toggle, restart, newSession }
})
