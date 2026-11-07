import { reactive } from 'vue'

// One polite live region for the shell (rendered by ConsoleLayout).
const state = reactive({ message: '' })

export function useAnnouncer() {
  function say(text) {
    state.message = ''
    // Clear first so repeating the same text is announced again.
    setTimeout(() => {
      state.message = String(text || '')
    }, 50)
  }
  return {
    get message() {
      return state.message
    },
    say
  }
}
