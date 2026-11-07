import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchHermesInstances } from '../api/hermesApi.js'
import { hasLiveHermesInstance } from '../config/console-overview.mjs'

// Shell-wide answer to "does this account already have a Hermes instance?".
// hasInstance is null until known, so notifications never guess.
export const useHermesInstanceStore = defineStore('hermesInstance', () => {
  const hasInstance = ref(null)
  let inflight = null

  function sync(instances) {
    hasInstance.value = hasLiveHermesInstance(instances)
  }

  async function load(idToken) {
    if (!idToken) return
    if (inflight) return inflight
    inflight = fetchHermesInstances(idToken)
      .then((data) => sync(Array.isArray(data?.instances) ? data.instances : []))
      .catch(() => {})
      .finally(() => {
        inflight = null
      })
    return inflight
  }

  function clear() {
    hasInstance.value = null
  }

  return { hasInstance, sync, load, clear }
})
