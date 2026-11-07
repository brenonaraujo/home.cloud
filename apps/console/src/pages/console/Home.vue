<template>
  <div>
    <BcPageHeader :eyebrow="t('console.home.overview')" :title="t('console.home.greeting', { name: firstName })">
      <template #subtitle>
        <span class="break-all font-mono">{{ auth.email }}</span>
      </template>
    </BcPageHeader>

    <!-- Account at a glance: plan, this month, Hermes (issue #44 fase 3). -->
    <section class="mt-8 grid gap-4 md:grid-cols-3" :aria-label="t('console.home.accountSummary')">
      <BcPanel :title="t('console.home.planCard')" heading-tag="h2">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-2xl font-semibold text-fg">{{ plan.label.value }}</p>
          <BcBadge v-if="plan.isPaid.value" tone="brand">{{ t('console.billing.yourPlan') }}</BcBadge>
        </div>
        <p class="mt-1 text-sm text-fg-muted">
          {{ formatMoney(plan.info.value.amountCents, 'BRL', locale) }} {{ t('console.billing.perMonth') }}
        </p>
        <div class="mt-auto pt-4">
          <BcButton :to="PATHS.billing" size="sm">
            {{ plan.isPaid.value ? t('console.home.managePlan') : t('console.home.seePlans') }}
          </BcButton>
        </div>
      </BcPanel>

      <BcPanel :title="t('console.home.periodCard')" heading-tag="h2">
        <p class="text-2xl font-semibold text-fg">{{ formatMoney(plan.info.value.amountCents, 'BRL', locale) }}</p>
        <p class="mt-1 text-sm capitalize text-fg-muted">{{ period }}</p>
        <p class="mt-auto pt-4 text-sm text-fg-muted">
          {{ entitlement.status && entitlement.status !== 'none' ? t('console.home.periodStripe') : t('console.home.periodNone') }}
        </p>
      </BcPanel>

      <BcPanel :title="t('console.home.hermesCard')" heading-tag="h2">
        <template v-if="canManage">
          <BcStatus v-if="hermesInstance.instance" :status="instanceStatus(hermesInstance.instance)" />
          <p v-else-if="hermesInstance.hasInstance === false" class="text-sm text-fg-muted">{{ t('console.home.hermesNone') }}</p>
          <p v-else class="text-sm text-fg-muted">{{ t('console.hermes.loading') }}</p>
          <p v-if="hermesInstance.instance?.hostname" class="mt-2 break-all font-mono text-xs text-fg-muted">
            {{ hermesInstance.instance.hostname }}
          </p>
          <div class="mt-auto pt-4">
            <BcButton :to="PATHS.hermes" size="sm" :variant="hermesInstance.hasInstance === false ? 'primary' : 'secondary'">
              {{ hermesInstance.hasInstance === false ? t('console.hermes.create') : t('console.home.hermesOpen') }}
            </BcButton>
          </div>
        </template>
        <template v-else>
          <p class="text-sm text-fg-muted">{{ t('console.home.hermesLocked') }}</p>
          <div class="mt-auto pt-4">
            <BcButton :to="PATHS.hermes" size="sm">{{ t('console.home.hermesLearn') }}</BcButton>
          </div>
        </template>
      </BcPanel>
    </section>

    <div v-if="!auth.ready || catalog.loading" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <BcSkeleton v-for="n in 3" :key="n" />
    </div>

    <template v-else-if="searching">
      <h2 class="mt-10 text-section-title text-fg">{{ t('console.search.results') }}</h2>
      <div v-if="filtered.length" class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <BcServiceCard v-for="app in filtered" :key="app.id" :app="app" />
      </div>
      <BcEmptyState v-else class="mt-4" :icon="InboxIcon" :title="t('console.emptyTitle')" :body="t('console.search.empty')" />
    </template>

    <template v-else>
      <div class="mt-8 grid gap-6 lg:grid-cols-2">
        <BcPanel flush :title="t('console.home.favorites')">
          <ul v-if="favorites.length">
            <BcServiceRow v-for="app in favorites" :key="'f-' + app.id" :app="app" />
          </ul>
          <p v-else class="px-4 py-6 text-sm text-fg-muted">{{ t('console.home.favoritesEmpty') }}</p>
        </BcPanel>
        <BcPanel flush :title="t('console.home.recent')">
          <ul v-if="recent.length">
            <BcServiceRow v-for="app in recent" :key="'r-' + app.id" :app="app" />
          </ul>
          <p v-else class="px-4 py-6 text-sm text-fg-muted">{{ t('console.home.recentEmpty') }}</p>
        </BcPanel>
      </div>

      <div class="mt-10 flex flex-wrap items-end justify-between gap-2">
        <h2 class="text-section-title text-fg">{{ t('console.home.suggested') }}</h2>
        <BcButton :to="PATHS.services" variant="ghost" size="sm">
          {{ t('console.home.all') }}
          <template #icon><ChevronRightIcon class="order-last h-4 w-4" /></template>
        </BcButton>
      </div>
      <div v-if="suggested.length" class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <BcServiceCard v-for="app in suggested" :key="app.id" :app="app" />
      </div>
      <BcEmptyState v-else class="mt-4" :icon="InboxIcon" :title="t('console.emptyTitle')" :body="t('console.empty')" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/authStore'
import { useConsoleStore } from '../../stores/consoleStore'
import { useEntitlementStore } from '../../stores/entitlementStore'
import { useHermesInstanceStore } from '../../stores/hermesInstanceStore'
import { canManageHermes } from '../../config/console-taxonomy.mjs'
import { currentPeriodLabel, formatMoney } from '../../config/console-overview.mjs'
import { instanceStatus } from '../../config/console-plans.mjs'
import { PATHS } from '../../config/console-paths.mjs'
import { usePlan } from '../../composables/usePlan.js'
import { ChevronRightIcon, InboxIcon } from '../../components/icons/Icons.js'
import {
  BcBadge,
  BcButton,
  BcEmptyState,
  BcPageHeader,
  BcPanel,
  BcServiceCard,
  BcServiceRow,
  BcSkeleton,
  BcStatus
} from '../../components/bc/index.js'

const { t, locale } = useI18n()
const auth = useAuthStore()
const catalog = useConsoleStore()
const { searchQuery } = storeToRefs(catalog)
const entitlement = useEntitlementStore()
const hermesInstance = useHermesInstanceStore()
const plan = usePlan()

const firstName = computed(() => {
  const name = auth.displayName || auth.email || ''
  return String(name).trim().split(/\s+/)[0] || '—'
})

const canManage = computed(() => canManageHermes(auth.groups))
const period = computed(() => currentPeriodLabel(locale.value))
const searching = computed(() => String(searchQuery.value || '').trim().length > 0)
const filtered = computed(() => catalog.searchFor(auth.groups, searchQuery.value, locale.value))
const recent = computed(() => catalog.recentApps(auth.groups).slice(0, 5))
const favorites = computed(() => catalog.favoriteApps(auth.groups))
// Home is an overview: a short pick of services, the full catalog lives in /services.
const suggested = computed(() => {
  const seen = new Set([...favorites.value, ...recent.value].map((app) => app.id))
  return catalog.appsFor(auth.groups).filter((app) => !seen.has(app.id)).slice(0, 3)
})
</script>
