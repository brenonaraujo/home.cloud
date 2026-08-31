<template>
  <div>
    <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.home.overview') }}</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">
      {{ t('console.home.greeting', { name: firstName }) }}
    </h1>
    <p class="mt-2 text-sm text-gray-400">
      <span class="font-mono">{{ auth.email }}</span>
      <span class="text-gray-600"> · </span>
      {{ planLabel }}
      <span class="text-gray-600"> · </span>
      {{ t('console.region') }}
    </p>

    <div v-if="!auth.ready || catalog.loading" class="mt-8 grid gap-6 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="h-48 animate-pulse rounded-lg border border-white/10 bg-gray-900" />
    </div>

    <template v-else>
      <div class="mt-8 grid gap-6 lg:grid-cols-3">
        <ConsolePanel
          :title="t('console.nav.account')"
          :action="t('console.view')"
          to="/account"
        >
          <dl class="grid gap-4">
            <div>
              <dt class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.plan') }}</dt>
              <dd class="mt-1 text-sm text-white">{{ planLabel }}</dd>
            </div>
            <div>
              <dt class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.account.role') }}</dt>
              <dd class="mt-1 text-sm text-white">
                {{ staff ? t('console.account.staff') : t('console.account.customer') }}
              </dd>
            </div>
            <div>
              <dt class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ t('console.home.region') }}</dt>
              <dd class="mt-1 font-mono text-sm text-white">{{ t('console.region') }}</dd>
            </div>
          </dl>
        </ConsolePanel>

        <ConsolePanel
          :title="t('console.nav.billing')"
          :action="t('console.view')"
          to="/billing"
        >
          <p class="text-[11px] uppercase tracking-[0.12em] text-gray-500">{{ period }}</p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-white">{{ amount }}</p>
          <p class="mt-2 text-sm leading-relaxed text-gray-400">{{ t('console.billing.zeroHint') }}</p>
        </ConsolePanel>

        <ConsolePanel
          :title="t('console.nav.notifications')"
          :action="t('console.view')"
          to="/notifications"
        >
          <p v-if="!notes.length" class="text-sm text-gray-400">{{ t('console.notifications.empty') }}</p>
          <ul v-else class="flex flex-col gap-4">
            <li v-for="note in notes.slice(0, 3)" :key="note.id">
              <p class="text-sm font-medium text-white">{{ t('console.notifications.items.' + note.key + '.title') }}</p>
              <p class="mt-1 text-xs leading-relaxed text-gray-400">
                {{ t('console.notifications.items.' + note.key + '.body') }}
              </p>
            </li>
          </ul>
        </ConsolePanel>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <section class="flex min-h-[16rem] flex-col rounded-lg border border-white/10 bg-gray-900">
          <h2 class="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
            {{ t('console.home.recent') }}
          </h2>
          <ul v-if="recent.length" class="flex-1">
            <ConsoleServiceRow v-for="app in recent" :key="'r-' + app.id" :app="app" />
          </ul>
          <p v-else class="flex flex-1 items-center px-4 py-8 text-sm text-gray-500">
            {{ t('console.home.recentEmpty') }}
          </p>
        </section>

        <section class="flex min-h-[16rem] flex-col rounded-lg border border-white/10 bg-gray-900">
          <h2 class="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
            {{ t('console.home.favorites') }}
          </h2>
          <ul v-if="favorites.length" class="flex-1">
            <ConsoleServiceRow v-for="app in favorites" :key="'f-' + app.id" :app="app" />
          </ul>
          <p v-else class="flex flex-1 items-center px-4 py-8 text-sm text-gray-500">
            {{ t('console.home.favoritesEmpty') }}
          </p>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { displayPlan, isStaff } from '../../config/console-taxonomy.mjs'
import {
  billingSnapshot,
  buildNotifications,
  currentPeriodLabel,
  formatMoney
} from '../../config/console-overview.mjs'
import { unreadNotifications } from '../../config/console-prefs.mjs'
import ConsolePanel from '../../components/console/ConsolePanel.vue'
import ConsoleServiceRow from '../../components/console/ConsoleServiceRow.vue'

const { t, te, locale } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const entitlement = useEntitlementStore()

const firstName = computed(() => {
  const name = auth.displayName || auth.email || ''
  return String(name).trim().split(/\s+/)[0] || '—'
})

const staff = computed(() => isStaff(auth.groups))
const planLabel = computed(() => {
  const plan = displayPlan(auth.groups, entitlement.billing)
  const key = `console.plan.${plan}`
  return te(key) ? t(key) : plan
})
const billing = computed(() => billingSnapshot(auth.groups))
const amount = computed(() => formatMoney(billing.value.amountCents, billing.value.currency, locale.value))
const period = computed(() => currentPeriodLabel(locale.value))
const notes = computed(() =>
  unreadNotifications(
    buildNotifications({ catalogOffline: Boolean(catalog.error), groups: auth.groups }),
    catalog.readNotificationIds
  )
)
const recent = computed(() => catalog.recentApps(auth.groups).slice(0, 8))
const favorites = computed(() => catalog.favoriteApps(auth.groups))
</script>
