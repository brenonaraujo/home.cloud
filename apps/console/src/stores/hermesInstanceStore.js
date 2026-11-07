import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchHermesInstances } from '../api/hermesApi.js'
import { hasLiveHermesInstance, isLiveHermesInstance } from '../config/console-overview.mjs'

// Shell-wide answer to "does this account already have a Hermes instance?".
// hasInstance is null until known, so notifications never guess.
export const useHermesInstanceStore = defineStore('hermesInstance', () => {
  const hasInstance = ref(null)
  const instance = ref(null)
  const loading = ref(false)
  let inflight = null

  function sync(instances, email = '') {
    const rows = Array.isArray(instances) ? instances : []
    hasInstance.value = hasLiveHermesInstance(rows)
    const live = rows.filter(isLiveHermesInstance)
    instance.value = live.find((row) => email && row.email === email) || live[0] || null
  }

  async function load(idToken, email = '') {
    if (!idToken) return
    if (inflight) return inflight
    loading.value = true
    inflight = fetchHermesInstances(idToken)
      .then((data) => sync(Array.isArray(data?.instances) ? data.instances : [], email))
      .catch(() => {})
      .finally(() => {
        inflight = null
        loading.value = false
      })
    return inflight
  }

  function clear() {
    hasInstance.value = null
    instance.value = null
  }

  return { hasInstance, instance, loading, sync, load, clear }
})
