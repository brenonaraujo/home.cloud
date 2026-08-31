<template>
  <div>
    <ConsoleBreadcrumb :items="[{ label: t('console.nav.billing') }]" />

    <h1 class="text-3xl font-semibold tracking-tight text-white">{{ t('console.billing.title') }}</h1>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{{ t('console.billing.subtitle') }}</p>

    <p
      v-if="flash"
      class="mt-6 rounded-md border px-4 py-3 text-sm"
      :class="flash.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'"
    >
      {{ flash.text }}
    </p>
    <p v-if="error" class="mt-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {{ error }}
    </p>

    <div class="mt-10 grid gap-4 lg:grid-cols-3">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="flex flex-col rounded-lg border p-6"
        :class="plan.id === currentPlan
          ? 'border-blue-500/50 bg-blue-500/10'
          : plan.id === 'pro'
            ? 'border-blue-500/25 bg-gray-900'
            : 'border-white/10 bg-gray-900'"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.plan') }}</p>
          <span
            v-if="plan.id === 'pro' || plan.includesHermes"
            class="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-blue-200"
          >
            {{ t('console.billing.hermesBadge') }}
          </span>
        </div>
        <h2 class="mt-2 text-xl font-semibold text-white">{{ planLabel(plan.id) }}</h2>
        <p class="mt-3 text-3xl font-semibold tracking-tight text-white">{{ formatMoney(plan.amountCents, 'BRL', locale) }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ t('console.billing.perMonth') }}</p>
        <p v-if="plan.id === 'pro' || plan.includesHermes" class="mt-4 text-sm font-medium text-blue-200">
          {{ t('console.billing.hermesOwn') }}
        </p>
        <p v-if="planQuotaLine(plan).gb" class="mt-1 text-xs text-gray-400">{{ t('console.billing.quota', planQuotaLine(plan)) }}</p>
        <p v-if="plan.id === 'pro' || plan.includesHermes" class="mt-1 text-sm leading-relaxed text-gray-400">
          {{ t('console.billing.hermesOwnBody') }}
        </p>
        <ul class="mt-6 space-y-2 text-sm leading-relaxed text-gray-300">
          <li v-for="line in planLines(plan.id)" :key="line" class="flex gap-2">
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
            <span>{{ line }}</span>
          </li>
        </ul>
        <div class="mt-8 flex-1" />
        <p v-if="plan.id === currentPlan" class="text-sm text-blue-300">{{ t('console.billing.current') }}</p>
        <div v-else-if="plan.id !== 'free'" class="flex flex-col gap-2">
          <button
            type="button"
            class="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            :disabled="busy"
            @click="upgrade(plan.id)"
          >
            {{ t('console.billing.upgrade') }}
          </button>
          <router-link
            v-if="plan.id === 'pro' || plan.includesHermes"
            to="/hermes"
            class="inline-flex min-h-[44px] items-center justify-center text-sm text-blue-300 hover:text-white"
          >
            {{ t('console.billing.openHermes') }}
          </router-link>
        </div>
      </article>
    </div>

    <div class="mt-10 grid gap-6 lg:grid-cols-3">
      <section class="rounded-lg border border-white/10 bg-gray-900 p-6 lg:col-span-2">
        <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.billing.thisPeriod') }}</p>
        <p class="mt-2 text-sm text-gray-400">{{ period }}</p>
        <p class="mt-4 text-4xl font-semibold tracking-tight text-white">{{ amount }}</p>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-gray-400">
          {{ entitlement.status && entitlement.status !== 'none' ? t('console.billing.stripeHint') : t('console.billing.zeroHint') }}
        </p>
      </section>
      <section class="rounded-lg border border-white/10 bg-gray-900 p-6">
        <h2 class="text-sm font-semibold text-white">{{ t('console.billing.payment') }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-gray-400">
          {{ entitlement.customerId ? t('console.billing.paymentReady') : t('console.billing.paymentEmpty') }}
        </p>
        <button
          v-if="entitlement.customerId"
          type="button"
          class="mt-6 inline-flex min-h-[44px] items-center rounded-md border border-white/15 px-4 text-sm text-gray-200 hover:bg-white/5 disabled:opacity-50"
          :disabled="busy"
          @click="portal"
        >
          {{ t('console.billing.manage') }}
        </button>
        <p class="mt-4 text-xs text-gray-500">{{ t('console.billing.planHint') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { displayPlan } from '../../config/console-taxonomy.mjs'
import { currentPeriodLabel, formatMoney } from '../../config/console-overview.mjs'
import { humanBillingError } from '../../config/console-billing.mjs'
import { FALLBACK_PLANS, startCheckout, startPortal } from '../../api/billingApi.js'
import ConsoleBreadcrumb from '../../components/console/ConsoleBreadcrumb.vue'

const { t, te, tm, locale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const entitlement = useEntitlementStore()

const plans = FALLBACK_PLANS
const error = ref('')
const busy = ref(false)

const currentPlan = computed(() => displayPlan(auth.groups, entitlement.billing))
const amount = computed(() => {
  const row = plans.find((p) => p.id === currentPlan.value)
  return formatMoney(row?.amountCents || 0, 'BRL', locale.value)
})
const period = computed(() => currentPeriodLabel(locale.value))
const flash = computed(() => {
  if (route.query.checkout === 'success') {
    return { ok: true, text: t('console.billing.checkoutSuccess') }
  }
  if (route.query.checkout === 'cancel') {
    return { ok: false, text: t('console.billing.checkoutCancel') }
  }
  return null
})

function planLabel(id) {
  const key = `console.plan.${id}`
  return te(key) ? t(key) : id
}

function planLines(id) {
  const key = `console.billing.features.${id}`
  if (!te(key)) return []
  const value = tm(key)
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean)
  return []
}

function planDisk(plan) {
  if (plan?.diskGb) return Number(plan.diskGb)
  if (plan?.id === 'pro') return 20
  if (plan?.id === 'basic' || plan?.includesHermes) return 5
  return 0
}

function planQuotaLine(plan) {
  const gb = planDisk(plan)
  if (!gb) return { ram: 0, cpu: 0, gb: 0 }
  if (plan?.memoryGb) return { ram: Number(plan.memoryGb), cpu: Number(plan.cpus || 1), gb }
  if (plan?.id === 'pro') return { ram: 4, cpu: 2, gb: 20 }
  return { ram: 2, cpu: 1, gb }
}

async function upgrade(plan) {
  error.value = ''
  if (!auth.idToken) {
    error.value = t('console.billing.needSession')
    return
  }
  busy.value = true
  try {
    window.location.href = await startCheckout(auth.idToken, plan)
  } catch (err) {
    error.value = humanBillingError(err, t('console.billing.checkoutSoon'))
    busy.value = false
  }
}

async function portal() {
  error.value = ''
  busy.value = true
  try {
    window.location.href = await startPortal(auth.idToken)
  } catch (err) {
    error.value = humanBillingError(err, t('console.billing.portalError'))
    busy.value = false
  }
}

onMounted(async () => {
  if (route.query.checkout === 'success' && auth.idToken) {
    await entitlement.load(auth.idToken, auth.email, { force: true })
  }
})
</script>
