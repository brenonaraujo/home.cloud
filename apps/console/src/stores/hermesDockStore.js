import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHermesDockStore = defineStore('hermesDock', () => {
  const open = ref(false)
  const nonce = ref(0)

  function startChat() {
    open.value = true
  }

  function close() {
    open.value = false
  }

  function toggle() {
    if (open.value) close()
    else startChat()
  }

  function restart() {
    nonce.value += 1
    open.value = true
  }

  return { open, nonce, startChat, close, toggle, restart }
})
