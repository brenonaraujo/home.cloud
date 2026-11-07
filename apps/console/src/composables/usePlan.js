import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { useEntitlementStore } from '../stores/entitlementStore'
import { displayPlan } from '../config/console-taxonomy.mjs'
import { planInfo } from '../config/console-plans.mjs'

/** Current plan for the session: id, translated label, quota and paid flag. */
export function usePlan() {
  const { t, te } = useI18n()
  const auth = useAuthStore()
  const entitlement = useEntitlementStore()

  const id = computed(() => displayPlan(auth.groups, entitlement.billing))
  const info = computed(() => planInfo(id.value))
  const label = computed(() => planLabel(id.value))
  const isPaid = computed(() => info.value.amountCents > 0)

  function planLabel(plan) {
    const key = `console.plan.${plan}`
    return te(key) ? t(key) : plan
  }

  return { id, info, label, isPaid, planLabel }
}
