import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchBillingMe } from '../api/billingApi.js'
import { readEntitlement, writeEntitlement } from '../config/console-entitlement.mjs'

function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const useEntitlementStore = defineStore('entitlement', () => {
  const plan = ref('')
  const status = ref('')
  const customerId = ref('')
  const loaded = ref(false)
  const emailKey = ref('')

  const billing = computed(() => ({
    plan: plan.value,
    status: status.value,
    customerId: customerId.value
  }))

  function apply(next) {
    plan.value = next.plan || ''
    status.value = next.status || ''
    customerId.value = next.customerId || ''
    loaded.value = true
  }

  function hydrate(email) {
    const key = String(email || '').toLowerCase()
    if (!key) return false
    emailKey.value = key
    const cached = readEntitlement(browserStorage(), key)
    if (!cached) return false
    apply(cached)
    return true
  }

  async function load(idToken, email, { force = false } = {}) {
    const key = String(email || emailKey.value || '').toLowerCase()
    if (key) emailKey.value = key
    if (!force && key && hydrate(key)) return
    if (!idToken) {
      loaded.value = true
      return
    }
    try {
      const me = await fetchBillingMe(idToken)
      apply({
        plan: me?.plan || '',
        status: me?.status || '',
        customerId: me?.customerId || ''
      })
      if (key) {
        writeEntitlement(browserStorage(), key, {
          plan: plan.value,
          status: status.value,
          customerId: customerId.value
        })
      }
    } catch {
      if (!plan.value) apply({ plan: '', status: '', customerId: '' })
      loaded.value = true
    }
  }

  function clear() {
    plan.value = ''
    status.value = ''
    customerId.value = ''
    loaded.value = false
    emailKey.value = ''
  }

  return { plan, status, customerId, loaded, billing, hydrate, load, clear }
})
