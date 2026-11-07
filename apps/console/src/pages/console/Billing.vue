<template>
  <div>
    <BcPageHeader
      :crumbs="[{ label: t('console.billing.title') }]"
      :title="t('console.billing.title')"
      :subtitle="t('console.billing.subtitleShort')"
    />

    <div class="mt-6 flex flex-col gap-3">
      <BcAlert v-if="flash" :tone="flash.tone" :title="flash.title">
        {{ flash.text }}
        <template v-if="staleSession" #actions>
          <BcButton size="sm" :loading="refreshing" @click="refreshSession">{{ t('console.billing.refreshSession') }}</BcButton>
        </template>
      </BcAlert>
      <BcAlert v-else-if="staleSession" tone="info" :title="t('console.billing.staleTitle')">
        {{ t('console.billing.staleBody') }}
        <template #actions>
          <BcButton size="sm" :loading="refreshing" @click="refreshSession">{{ t('console.billing.refreshSession') }}</BcButton>
        </template>
      </BcAlert>
      <BcAlert v-if="error" tone="danger">{{ error }}</BcAlert>
    </div>

    <ul class="mt-8 grid gap-4 lg:grid-cols-3" :aria-label="t('console.billing.plans')">
      <li
        v-for="row in plans"
        :key="row.id"
        class="flex flex-col rounded-card border p-6"
        :class="row.id === currentId ? 'border-brand-400/70 bg-brand-500/5' : 'border-line bg-surface-raised'"
        :aria-current="row.id === currentId ? 'true' : undefined"
      >
        <div class="flex min-h-[1.5rem] flex-wrap items-center gap-2">
          <BcBadge v-if="row.id === currentId" tone="brand">{{ t('console.billing.yourPlan') }}</BcBadge>
          <BcBadge v-if="row.includesHermes" tone="info">{{ t('console.billing.hermesBadge') }}</BcBadge>
        </div>
        <h2 class="mt-3 text-xl font-semibold text-fg">{{ planLabel(row.id) }}</h2>
        <p class="mt-2 text-3xl font-semibold tracking-tight text-fg">{{ formatMoney(row.amountCents, 'BRL', locale) }}</p>
        <p class="mt-1 text-sm text-fg-muted">{{ t('console.billing.perMonth') }}</p>

        <ul class="mt-6 space-y-3 text-sm leading-relaxed">
          <li v-for="feature in planFeatureRows(row)" :key="feature.key" class="flex gap-3">
            <CheckIcon v-if="feature.included" class="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            <CloseIcon v-else class="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
            <span :class="feature.included ? 'text-fg' : 'text-fg-muted'">
              <span class="sr-only">{{ feature.included ? t('console.billing.included') : t('console.billing.notIncluded') }}:</span>
              {{ featureLabel(feature) }}
            </span>
          </li>
        </ul>

        <div class="mt-8 flex-1" />
        <div v-if="row.id === currentId" class="flex flex-col gap-2">
          <BcButton v-if="row.includesHermes" to="/hermes" block>{{ t('console.billing.openHermes') }}</BcButton>
          <p v-else class="text-sm text-fg-muted">{{ t('console.billing.currentFree') }}</p>
        </div>
        <BcButton
          v-else-if="row.amountCents > currentAmount"
          variant="primary"
          block
          :loading="busy === row.id"
          :disabled="Boolean(busy)"
          @click="upgrade(row.id)"
        >
          {{ t('console.billing.upgradeTo', { plan: planLabel(row.id) }) }}
        </BcButton>
        <p v-else class="text-sm text-fg-muted">{{ t('console.billing.downgradeHint') }}</p>
      </li>
    </ul>

    <div class="mt-10 grid gap-6 lg:grid-cols-3">
      <BcPanel class="lg:col-span-2" :title="t('console.billing.thisPeriod')">
        <p class="text-sm capitalize text-fg-muted">{{ period }}</p>
        <p class="mt-3 text-4xl font-semibold tracking-tight text-fg">{{ amount }}</p>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
          {{ entitlement.status && entitlement.status !== 'none' ? t('console.billing.stripeHint') : t('console.billing.zeroHint') }}
        </p>
      </BcPanel>
      <BcPanel :title="t('console.billing.payment')">
        <p class="text-sm leading-relaxed text-fg-muted">
          {{ entitlement.customerId ? t('console.billing.paymentReady') : t('console.billing.paymentEmpty') }}
        </p>
        <div v-if="entitlement.customerId" class="mt-6">
          <BcButton :loading="busy === 'portal'" :disabled="Boolean(busy)" @click="portal">{{ t('console.billing.manage') }}</BcButton>
        </div>
      </BcPanel>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { currentPeriodLabel, formatMoney } from '../../config/console-overview.mjs'
import { humanBillingError } from '../../config/console-billing.mjs'
import { needsSessionRefresh, planFeatureRows, planInfo } from '../../config/console-plans.mjs'
import { FALLBACK_PLANS, startCheckout, startPortal } from '../../api/billingApi.js'
import { usePlan } from '../../composables/usePlan.js'
import { CheckIcon, CloseIcon } from '../../components/icons/Icons.js'
import { BcAlert, BcBadge, BcButton, BcPageHeader, BcPanel } from '../../components/bc/index.js'

const { t, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const entitlement = useEntitlementStore()
const { id: currentPlan, planLabel } = usePlan()

const REFRESH_KEY = 'bc-checkout-session-refresh'

const plans = FALLBACK_PLANS
const error = ref('')
const busy = ref('')
const refreshing = ref(false)

// Legacy plan-hermes maps to Basic, so the right card is marked.
const currentId = computed(() => planInfo(currentPlan.value).id)
const currentAmount = computed(() => planInfo(currentPlan.value).amountCents)
const amount = computed(() => formatMoney(currentAmount.value, 'BRL', locale.value))
const period = computed(() => currentPeriodLabel(locale.value))
const staleSession = computed(() => needsSessionRefresh(auth.groups, entitlement.billing))

const flash = computed(() => {
  const state = route.query.checkout
  if (state === 'success') {
    return { tone: 'success', title: t('console.billing.checkoutSuccessTitle'), text: t('console.billing.checkoutSuccess') }
  }
  if (state === 'cancel') return { tone: 'info', title: '', text: t('console.billing.checkoutCancel') }
  return null
})

function featureLabel(feature) {
  if (feature.key === 'resources' && !feature.included) return t('console.billing.row.resourcesNone')
  return t(`console.billing.row.${feature.key}`, feature.values || {})
}

function readFlag() {
  try {
    return sessionStorage.getItem(REFRESH_KEY)
  } catch {
    return '1'
  }
}

function writeFlag() {
  try {
    sessionStorage.setItem(REFRESH_KEY, '1')
  } catch {
    /* without storage we never auto-refresh */
  }
}

async function refreshSession() {
  refreshing.value = true
  writeFlag()
  try {
    await auth.refreshSession('/billing')
  } catch {
    error.value = t('console.billing.needSession')
  } finally {
    refreshing.value = false
  }
}

async function upgrade(plan) {
  error.value = ''
  if (!auth.idToken) {
    error.value = t('console.billing.needSession')
    return
  }
  busy.value = plan
  try {
    window.location.href = await startCheckout(auth.idToken, plan)
  } catch (err) {
    error.value = humanBillingError(err, t('console.billing.checkoutSoon'))
    busy.value = ''
  }
}

async function portal() {
  error.value = ''
  busy.value = 'portal'
  try {
    window.location.href = await startPortal(auth.idToken)
  } catch (err) {
    error.value = humanBillingError(err, t('console.billing.portalError'))
    busy.value = ''
  }
}

onMounted(async () => {
  if (route.query.checkout === 'success' && auth.idToken) {
    await entitlement.load(auth.idToken, auth.email, { force: true })
    // Stripe says paid but the session still has the old groups: refresh once,
    // automatically, so Hermes and paid services open without signing out.
    if (staleSession.value && !readFlag()) await refreshSession()
  }
})
</script>
